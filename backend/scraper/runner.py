"""Runs scraping for all sources and persists results to the database.

Incremental design — LLM calls are the expensive part, so:
1. Every fetched page is fingerprinted (sha256 of cleaned text). Unchanged
   pages skip the LLM entirely; their cats just get a freshness bump.
2. Profile pages are only extracted for cats that aren't already enriched
   (no image in DB). Existing enrichment is preserved by COALESCE upserts.
3. Cats that disappear from a re-extracted page are marked status="adopted"
   (hidden from the catalog's default view, revived if they ever reappear).
"""
import hashlib
import logging
from datetime import datetime, timezone

from sqlalchemy import case, func, select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Cat, PageSnapshot, Shelter
from scraper.agent import (
    clean_html,
    extract_cats,
    fetch_html,
    is_real_image,
)
from scraper.sources import SOURCES

log = logging.getLogger("uvicorn.error")

VALID_GENDERS = {"female", "male"}
VALID_AGE_CATEGORIES = {"kitten", "adult", "senior"}
VALID_STATUSES = {"available", "reserved"}


def _fingerprint(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _profile_url_if_needed(raw: dict, listing_urls: set[str]) -> str | None:
    """Return a cat's profile URL to fetch, or None.

    We only dig into a profile when the listing gave us no usable image, and only
    when the cat's source_url is a distinct http(s) page (not a listing page).
    """
    if is_real_image(raw.get("image_url")):
        return None
    src = (raw.get("source_url") or "").strip()
    if not src.lower().startswith("http"):
        return None
    if src.rstrip("/") in listing_urls:
        return None
    return src


def _merge_profile(listing: dict, profile: dict) -> dict:
    """Overlay richer profile fields onto the listing cat (non-empty wins).

    The listing's source_url (the profile link) and listing_url (the page the
    cat is listed on) are always kept.
    """
    merged = dict(listing)
    for key, value in profile.items():
        if key in ("source_url", "listing_url"):
            continue
        if value not in (None, "", [], {}):
            merged[key] = value
    return merged


async def get_or_create_shelter(session: AsyncSession, source: dict) -> Shelter:
    stmt = select(Shelter).where(Shelter.name == source["name"])
    shelter = (await session.execute(stmt)).scalar_one_or_none()
    if shelter is None:
        shelter = Shelter(
            name=source["name"],
            website=source["website"],
            location=source.get("location", ""),
        )
        session.add(shelter)
        await session.flush()  # assign PK
    return shelter


def normalize_cat(raw: dict, shelter: Shelter) -> dict | None:
    """Coerce a raw extracted dict into a clean row payload, or None if unusable."""
    name = (raw.get("name") or "").strip()
    if not name:
        return None
    # Sites often shout names in caps ("VOJTÍŠEK"); normalize for stable dedup
    # and a friendlier UI.
    if len(name) >= 2 and name.isupper():
        name = name.title()

    gender = (raw.get("gender") or "").strip().lower()
    if gender not in VALID_GENDERS:
        gender = ""

    age_category = (raw.get("age_category") or "").strip().lower()
    if age_category not in VALID_AGE_CATEGORIES:
        age_category = "adult"

    status = (raw.get("status") or "available").strip().lower()
    if status not in VALID_STATUSES:
        status = "available"

    tags = raw.get("tags") or []
    if not isinstance(tags, list):
        tags = []
    tags = [str(t).strip() for t in tags if str(t).strip()]

    source_url = (raw.get("source_url") or "").strip()
    if not source_url:
        return None  # required for dedup

    now = datetime.now(timezone.utc)
    return {
        "name": name,
        "gender": gender,
        "age_text": (raw.get("age_text") or "").strip(),
        "age_category": age_category,
        "shelter_id": shelter.id,
        "location": (raw.get("location") or shelter.location or "").strip(),
        "description": (raw.get("description") or None),
        "tags": tags,
        # Drop lazy-load placeholders (base64 data URIs) — keep only real images.
        "image_url": raw["image_url"] if is_real_image(raw.get("image_url")) else None,
        "source_url": source_url,
        "listing_url": (raw.get("listing_url") or "").strip(),
        "status": status,
        "scraped_at": now,
    }


async def upsert_cat(session: AsyncSession, payload: dict) -> None:
    """Insert or update on (source_url, name) conflict — re-scrape refreshes.

    Enrichment fields (image, description, tags) are never downgraded: a
    listing-only pass that yields nulls/empties keeps the stored profile data.
    """
    stmt = pg_insert(Cat).values(**payload)
    set_ = {
        "name": stmt.excluded.name,  # refresh casing; lower(name) key unchanged
        "gender": stmt.excluded.gender,
        "age_text": stmt.excluded.age_text,
        "age_category": stmt.excluded.age_category,
        "shelter_id": stmt.excluded.shelter_id,
        "location": stmt.excluded.location,
        "description": func.coalesce(stmt.excluded.description, Cat.description),
        "image_url": func.coalesce(stmt.excluded.image_url, Cat.image_url),
        "tags": case(
            (func.jsonb_array_length(stmt.excluded.tags) == 0, Cat.tags),
            else_=stmt.excluded.tags,
        ),
        "listing_url": stmt.excluded.listing_url,
        "status": stmt.excluded.status,
        "scraped_at": stmt.excluded.scraped_at,
    }
    stmt = stmt.on_conflict_do_update(
        index_elements=[Cat.source_url, func.lower(Cat.name)], set_=set_
    )
    await session.execute(stmt)


async def _fetch_pages(
    urls: list[str], source_name: str, errors: list[str]
) -> list[tuple[str, str]]:
    """Download + clean each URL (free — no API calls). Reports per-URL failures."""
    pages: list[tuple[str, str]] = []
    for url in urls:
        try:
            text = clean_html(await fetch_html(url), url)
        except Exception as exc:  # noqa: BLE001 - report, keep going
            errors.append(f"{source_name} ({url}): {exc}")
            continue
        if text.strip():
            pages.append((url, text))
    return pages


async def _stored_hash(session: AsyncSession, url: str) -> str | None:
    return (
        await session.execute(
            select(PageSnapshot.content_hash).where(PageSnapshot.url == url)
        )
    ).scalar_one_or_none()


async def _save_snapshot(
    session: AsyncSession, url: str, content_hash: str, when: datetime
) -> None:
    stmt = pg_insert(PageSnapshot).values(
        url=url, content_hash=content_hash, fetched_at=when
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=["url"],
        set_={"content_hash": content_hash, "fetched_at": when},
    )
    await session.execute(stmt)


async def _enriched_keys(
    session: AsyncSession, shelter_id: int
) -> set[tuple[str, str]]:
    """(source_url, name) pairs that already carry an image — skip their profiles."""
    rows = (
        await session.execute(
            select(Cat.source_url, Cat.name).where(
                Cat.shelter_id == shelter_id, Cat.image_url.is_not(None)
            )
        )
    ).all()
    return {(r.source_url, r.name) for r in rows}


async def run_all_sources(session: AsyncSession) -> tuple[int, list[str]]:
    """Scrape every configured source incrementally and persist results.

    Returns (number of cats upserted, list of error strings).
    """
    cats_scraped = 0
    errors: list[str] = []
    run_started = datetime.now(timezone.utc)
    pages_skipped = 0
    pages_extracted = 0

    for source in SOURCES:
        shelter = await get_or_create_shelter(session, source)
        listing_urls = source["scrape_urls"]
        listing_url_set = {u.rstrip("/") for u in listing_urls}

        # 1. Fetch all listing pages (free) and split unchanged vs changed.
        pages = await _fetch_pages(listing_urls, source["name"], errors)
        changed: list[tuple[str, str]] = []
        hashes: dict[str, str] = {}
        for url, text in pages:
            h = _fingerprint(text)
            hashes[url] = h
            if await _stored_hash(session, url) == h:
                # Nothing changed on this page — its cats are still listed.
                pages_skipped += 1
                await session.execute(
                    update(Cat)
                    .where(Cat.listing_url == url)
                    .values(scraped_at=run_started)
                )
                continue
            changed.append((url, text))

        # 2. Batch-extract only the changed pages.
        raw_cats: list[dict] = []
        if changed:
            try:
                raw_cats = await extract_cats(
                    changed, source["name"], force_source_url=False
                )
                pages_extracted += len(changed)
            except Exception as exc:  # noqa: BLE001 - report, keep going
                errors.append(f"{source['name']} listing extract: {exc}")
                changed = []  # no removal marking / snapshots on failure

        if raw_cats:
            # 3. Profile fallback — only for cats not already enriched in DB.
            enriched = await _enriched_keys(session, shelter.id)
            profile_urls: list[str] = []
            for cat in raw_cats:
                purl = _profile_url_if_needed(cat, listing_url_set)
                key = (
                    (cat.get("source_url") or "").strip(),
                    (cat.get("name") or "").strip(),
                )
                if purl and key not in enriched:
                    profile_urls.append(purl)
            profile_urls = list(dict.fromkeys(profile_urls))  # dedup, keep order

            by_url: dict[str, dict] = {}
            if profile_urls:
                profile_pages = await _fetch_pages(
                    profile_urls, source["name"], errors
                )
                try:
                    profile_cats = await extract_cats(
                        profile_pages, source["name"], force_source_url=True
                    )
                    by_url = {
                        c["source_url"]: c
                        for c in profile_cats
                        if c.get("source_url")
                    }
                except Exception as exc:  # noqa: BLE001 - report, keep going
                    errors.append(f"{source['name']} profile extract: {exc}")

            # 4. Merge + upsert.
            for cat in raw_cats:
                profile = by_url.get((cat.get("source_url") or "").strip())
                if profile:
                    cat = _merge_profile(cat, profile)
                payload = normalize_cat(cat, shelter)
                if payload is None:
                    continue
                try:
                    await upsert_cat(session, payload)
                    cats_scraped += 1
                except Exception as exc:  # noqa: BLE001
                    errors.append(
                        f"{source['name']} cat '{cat.get('name')}': {exc}"
                    )

        # 5. Cats that vanished from a successfully re-extracted page are no
        #    longer listed -> adopted. Then remember the page fingerprint.
        for url, _ in changed:
            await session.execute(
                update(Cat)
                .where(
                    Cat.listing_url == url,
                    Cat.scraped_at < run_started,
                    Cat.status != "adopted",
                )
                .values(status="adopted")
            )
            await _save_snapshot(session, url, hashes[url], run_started)

        # First full extraction of a source also sweeps legacy rows that never
        # got a listing_url (pre-incremental data) — safe because we just saw
        # the complete picture of this shelter.
        if changed and len(changed) == len(pages) == len(listing_urls):
            await session.execute(
                update(Cat)
                .where(
                    Cat.shelter_id == shelter.id,
                    Cat.listing_url == "",
                    Cat.scraped_at < run_started,
                    Cat.status != "adopted",
                )
                .values(status="adopted")
            )

        await session.commit()

    log.info(
        "Scrape done: %d upserts | pages extracted: %d, skipped unchanged: %d",
        cats_scraped,
        pages_extracted,
        pages_skipped,
    )
    return cats_scraped, errors
