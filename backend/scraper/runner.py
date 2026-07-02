"""Runs scraping for all sources and persists results to the database."""
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Cat, Shelter
from scraper.agent import (
    clean_html,
    extract_cats,
    fetch_html,
    is_real_image,
)
from scraper.sources import SOURCES

VALID_GENDERS = {"female", "male"}
VALID_AGE_CATEGORIES = {"kitten", "adult", "senior"}
VALID_STATUSES = {"available", "reserved"}


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

    The listing's source_url (the profile link) is always kept.
    """
    merged = dict(listing)
    for key, value in profile.items():
        if key == "source_url":
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
        "status": status,
        "scraped_at": now,
    }


async def upsert_cat(session: AsyncSession, payload: dict) -> None:
    """Insert or update on (source_url, name) conflict — re-scrape refreshes."""
    stmt = pg_insert(Cat).values(**payload)
    update_cols = {
        col: stmt.excluded[col]
        for col in (
            "gender",
            "age_text",
            "age_category",
            "shelter_id",
            "location",
            "description",
            "tags",
            "image_url",
            "status",
            "scraped_at",
        )
    }
    stmt = stmt.on_conflict_do_update(
        index_elements=["source_url", "name"], set_=update_cols
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


async def run_all_sources(session: AsyncSession) -> tuple[int, list[str]]:
    """Scrape every configured source and persist results.

    Request-efficient: all HTML is fetched over plain HTTP (free), then handed to
    the model in BATCHES (a handful of API calls total instead of one per page),
    which keeps us well under the Gemini free-tier daily request cap.

    Returns (number of cats scraped, list of error strings).
    """
    cats_scraped = 0
    errors: list[str] = []

    for source in SOURCES:
        shelter = await get_or_create_shelter(session, source)
        listing_urls = source["scrape_urls"]
        listing_url_set = {u.rstrip("/") for u in listing_urls}

        # 1. Fetch all listing pages (free) and batch-extract their cats.
        listing_pages = await _fetch_pages(listing_urls, source["name"], errors)
        try:
            raw_cats = await extract_cats(
                listing_pages, source["name"], force_source_url=False
            )
        except Exception as exc:  # noqa: BLE001 - report, keep going
            errors.append(f"{source['name']} listing extract: {exc}")
            raw_cats = []

        # 2. For cats whose listing entry had no image, fetch their profile pages
        #    (free) and batch-extract those too.
        profile_urls = []
        for cat in raw_cats:
            purl = _profile_url_if_needed(cat, listing_url_set)
            if purl:
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
            except Exception as exc:  # noqa: BLE001 - report, keep going
                errors.append(f"{source['name']} profile extract: {exc}")
                profile_cats = []
            by_url = {
                c["source_url"]: c for c in profile_cats if c.get("source_url")
            }

        # 3. Merge profile data in, then normalize + upsert everything.
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

        await session.commit()

    return cats_scraped, errors
