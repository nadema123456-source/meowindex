"""AI scraper agent.

Fetches a shelter page, strips it down to readable content, hands the text to
an LLM (Anthropic Claude or Google Gemini), and parses back structured cats.
"""
import asyncio
import json
import os
import re

import httpx
from bs4 import BeautifulSoup

# Transient statuses worth retrying: rate limit + server overload/unavailable.
RETRYABLE_STATUS = {429, 500, 502, 503, 504}
MAX_RETRIES = int(os.getenv("SCRAPER_MAX_RETRIES", "4"))

# Provider: Anthropic when its key is present (or SCRAPER_PROVIDER=anthropic),
# Gemini otherwise. Default models are the cheap high-volume tier of each —
# structured extraction doesn't need a frontier model.
def _resolve_provider() -> str:
    explicit = (os.getenv("SCRAPER_PROVIDER") or "").strip().lower()
    if explicit in ("anthropic", "gemini"):
        return explicit
    return "anthropic" if os.getenv("ANTHROPIC_API_KEY") else "gemini"


PROVIDER = _resolve_provider()
DEFAULT_MODELS = {"anthropic": "claude-haiku-4-5", "gemini": "gemini-2.5-flash"}
MODEL = os.getenv("SCRAPER_MODEL") or DEFAULT_MODELS[PROVIDER]
MAX_OUTPUT_TOKENS = int(os.getenv("SCRAPER_MAX_OUTPUT_TOKENS", "16000"))
MAX_CONTENT_CHARS = 60_000  # keep per-page text bounded; trim very large pages

# Batching: pack several pages' text into a single Gemini request to minimise the
# number of API calls (the free tier caps requests/day, not tokens/day). Bounded
# so we stay under the tokens-per-minute limit and keep extraction accurate.
MAX_BATCH_CHARS = int(os.getenv("SCRAPER_MAX_BATCH_CHARS", "180000"))
MAX_BATCH_PAGES = int(os.getenv("SCRAPER_MAX_BATCH_PAGES", "12"))

SYSTEM_PROMPT = """You are a data extraction agent. You will receive text from ONE OR MORE web pages of Czech animal shelters. Each page is introduced by a marker line like "===== PAGE 3 =====". Extract ALL cats from ALL pages and return ONLY a valid JSON array, no other text.
Each cat object must have these fields:
- page (integer: the PAGE number from the "===== PAGE N =====" marker of the page where this cat appears)
- name (string)
- gender (string: "female" or "male")
- age_text (string or null: NORMALIZED age estimate in short English, derived from any age/birth info on the page — e.g. "~2 years", "6 months", "born 2021", "born spring 2024". NEVER output bare or truncated words like "years", "Roky", "Let", "Rok". If no age info exists, use null.)
- age_category (string: "kitten" if <1 year, "adult" if 1-7 years, "senior" if 7+ years)
- description (string or null: a natural 1-4 sentence description of the cat's personality, story and situation, TRANSLATED INTO FLUENT ENGLISH from the original Czech text. Preserve the meaning faithfully; do not invent details not on the page. Return null only if the page has no descriptive text for the cat.)
- tags (array of strings IN ENGLISH: personality traits, suitability – e.g. "friendly", "indoor", "good with kids")
- image_url (string or null: full URL of the cat's image)
- source_url (string: URL of the cat's profile page, if available)
- status (string: "available" or "reserved")

If a field is not available, use null. Do NOT invent data."""


async def _generate_anthropic(prompt: str) -> str:
    """One extraction call via the Anthropic API (SDK auto-retries 429/5xx)."""
    from anthropic import AsyncAnthropic

    if not os.getenv("ANTHROPIC_API_KEY"):
        raise RuntimeError(
            "No Anthropic API key found. Set ANTHROPIC_API_KEY (get one at "
            "https://console.anthropic.com)."
        )
    client = AsyncAnthropic(max_retries=MAX_RETRIES)
    message = await client.messages.create(
        model=MODEL,
        max_tokens=MAX_OUTPUT_TOKENS,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(
        block.text for block in message.content if block.type == "text"
    )


async def _generate_gemini(prompt: str) -> str:
    """One extraction call via Gemini, retrying transient 429/5xx ourselves."""
    from google import genai
    from google.genai import errors, types

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "No Google API key found. Set GEMINI_API_KEY (get one at "
            "https://aistudio.google.com/apikey)."
        )
    client = genai.Client(api_key=api_key)

    delay = 5.0
    last_exc: Exception | None = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                ),
            )
            return response.text or ""
        except errors.APIError as exc:
            code = getattr(exc, "code", None)
            if code not in RETRYABLE_STATUS or attempt == MAX_RETRIES:
                raise
            last_exc = exc
            await asyncio.sleep(delay)
            delay = min(delay * 2, 60.0)
    assert last_exc is not None
    raise last_exc


async def _generate_text(prompt: str) -> str:
    """Route one extraction call to the configured provider."""
    if PROVIDER == "anthropic":
        return await _generate_anthropic(prompt)
    return await _generate_gemini(prompt)


def clean_html(html: str, base_url: str) -> str:
    """Strip scripts/styles/chrome and return the main textual content.

    Image and link URLs are resolved to absolute and inlined as readable
    annotations so the model can still recover image_url / source_url.
    """
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
        tag.decompose()

    # Inline absolute image URLs so they survive text extraction.
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src")
        if src:
            absolute = httpx.URL(base_url).join(src)
            img.replace_with(f" [IMAGE: {absolute}] ")

    # Inline absolute hrefs so profile (source) URLs survive.
    for a in soup.find_all("a", href=True):
        absolute = httpx.URL(base_url).join(a["href"])
        text = a.get_text(strip=True)
        a.replace_with(f" {text} [LINK: {absolute}] ")

    body = soup.body or soup
    text = body.get_text(separator="\n", strip=True)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text[:MAX_CONTENT_CHARS]


def _extract_json_array(raw: str) -> list[dict]:
    """Best-effort parse of the model's response into a list of dicts."""
    raw = raw.strip()
    # Strip ```json ... ``` fences if present.
    fenced = re.match(r"^```(?:json)?\s*(.*?)\s*```$", raw, re.DOTALL)
    if fenced:
        raw = fenced.group(1).strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # Fall back to grabbing the first [...] block.
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if not match:
            return []
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError:
            return []

    if isinstance(data, dict):
        data = [data]
    if not isinstance(data, list):
        return []
    return [item for item in data if isinstance(item, dict)]


async def fetch_html(url: str) -> str:
    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        headers={"User-Agent": "MeowIndexBot/1.0 (+https://meowindex.cz)"},
    ) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.text


def _chunk_pages(
    pages: list[tuple[str, str]],
) -> list[list[tuple[str, str]]]:
    """Group (url, text) pages into batches bounded by page count and char size."""
    chunks: list[list[tuple[str, str]]] = []
    current: list[tuple[str, str]] = []
    size = 0
    for url, text in pages:
        if current and (
            len(current) >= MAX_BATCH_PAGES or size + len(text) > MAX_BATCH_CHARS
        ):
            chunks.append(current)
            current, size = [], 0
        current.append((url, text))
        size += len(text)
    if current:
        chunks.append(current)
    return chunks


async def extract_cats(
    pages: list[tuple[str, str]],
    source_name: str,
    *,
    force_source_url: bool,
) -> list[dict]:
    """Extract cats from many (url, cleaned_text) pages in as few calls as possible.

    Pages are packed into batches (one LLM request each). Each returned cat
    carries the page it came from; we use that to set its source_url:
      - force_source_url=True  -> always the page URL (profile pages: 1 cat = 1 page)
      - force_source_url=False -> the model's per-cat profile link, page URL as fallback
    """
    if not pages:
        return []
    results: list[dict] = []

    for chunk in _chunk_pages(pages):
        blocks = [
            f"===== PAGE {i} (url: {url}) =====\n{text}"
            for i, (url, text) in enumerate(chunk)
        ]
        contents = f"Source: {source_name}\n\n" + "\n\n".join(blocks)

        raw = await _generate_text(contents)

        for cat in _extract_json_array(raw):
            idx = cat.pop("page", None)
            page_url = (
                chunk[idx][0]
                if isinstance(idx, int) and 0 <= idx < len(chunk)
                else None
            )
            if force_source_url and page_url:
                cat["source_url"] = page_url
            elif not cat.get("source_url"):
                cat["source_url"] = page_url or chunk[0][0]
            cat["listing_url"] = page_url or chunk[0][0]
            results.append(cat)

    return results


async def scrape_source(source_url: str, source_name: str) -> list[dict]:
    """Fetch one listing page and extract its cats (thin wrapper over extract_cats)."""
    content = clean_html(await fetch_html(source_url), source_url)
    if not content.strip():
        return []
    return await extract_cats(
        [(source_url, content)], source_name, force_source_url=False
    )


def is_real_image(url: object) -> bool:
    """True only for a usable absolute image URL.

    Listing pages often lazy-load images, leaving a base64 `data:` placeholder
    (or nothing) in the markup — those are not real images.
    """
    if not isinstance(url, str):
        return False
    url = url.strip()
    return bool(url) and not url.lower().startswith("data:")


async def scrape_profile(profile_url: str, source_name: str) -> dict | None:
    """Fetch a single cat's own profile page and extract its full data.

    Used as a fallback for cats whose listing entry had no usable image — the
    profile page typically carries the real photo and the full description.
    Returns one cat dict, or None if nothing could be extracted.
    """
    content = clean_html(await fetch_html(profile_url), profile_url)
    if not content.strip():
        return None
    cats = await extract_cats(
        [(profile_url, content)], source_name, force_source_url=True
    )
    return cats[0] if cats else None
