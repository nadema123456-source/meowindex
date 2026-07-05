# AI Scraper

The core of the project: `backend/scraper/`. One LLM extraction prompt replaces
per-site parsers; the pipeline around it is engineered to spend as few LLM
tokens as possible.

```
sources.py ──► runner.run_all_sources() ──► agent.extract_cats() ──► LLM
                    │                            ▲
                    │  fetch + clean + hash      │ batched pages
                    ▼                            │
              page_snapshots  ──unchanged──► skip LLM entirely
```

## Files

| File | Role |
|---|---|
| `sources.py` | Declarative source list: 6 shelters, 8 listing URLs. Adding a shelter = adding an entry here. |
| `agent.py` | Everything LLM-adjacent: HTML cleaning, batching, provider routing (Anthropic/Gemini), JSON parsing, profile scraping. |
| `runner.py` | Orchestration + persistence: fingerprint diffing, profile-fallback decisions, normalization, upserts, adopted-marking. |

## Step by step

### 1. Fetch & clean (free — no LLM)

`fetch_html` downloads with httpx (30 s timeout, redirects, UA
`MeowIndexBot/1.0`). `clean_html` then:

- drops `<script> <style> <nav> <footer> <header> <noscript>`,
- replaces every `<img>` with an inline ` [IMAGE: <absolute-url>] ` marker
  (using `src` or `data-src`, resolved against the page URL),
- replaces every `<a>` with ` text [LINK: <absolute-url>] `,
- extracts body text, collapses blank lines, caps at **60 000 chars**
  (`MAX_CONTENT_CHARS`).

The markers let the model recover `image_url` and `source_url` from plain text.

### 2. Fingerprint diff (free)

Each cleaned page is hashed (SHA-256) and compared with `page_snapshots`:

- **Unchanged** → skip the LLM; bulk-update `scraped_at = run_started` for all
  cats whose `listing_url` equals this page (they're still listed).
- **Changed** → queue for extraction. The snapshot is only overwritten after a
  *successful* extraction, so a failed run retries the page next time.

### 3. Batched extraction (the only paid step)

`extract_cats` packs changed pages into chunks bounded by
`SCRAPER_MAX_BATCH_PAGES` (12) and `SCRAPER_MAX_BATCH_CHARS` (180 000). Each
chunk = **one LLM request**. Pages inside a chunk are delimited with
`===== PAGE N (url: …) =====` markers and the system prompt requires every cat
to carry its `page` number, which maps it back to its `listing_url`.

The system prompt (see `agent.py::SYSTEM_PROMPT`) demands a pure JSON array
where each cat has:

- `name`, `gender` (`female`/`male`),
- `age_text` — **normalized short English** (`"~2 years"`, `"born spring 2024"`;
  bare junk like `"Roky"` is forbidden),
- `age_category` (`kitten` <1 y, `adult` 1–7 y, `senior` 7+ y),
- `description` — 1–4 sentences **translated into fluent English**, never
  invented,
- `tags` — English trait strings,
- `image_url`, `source_url`, `status` (`available`/`reserved`).

`_extract_json_array` parses defensively: strips code fences, falls back to the
first `[...]` block, tolerates a single object, filters non-dicts.

### 4. Profile fallback (only when needed)

Listing pages often lazy-load photos (leaving `data:image/gif;base64,…`
placeholders) and rarely contain full descriptions. For each extracted cat the
runner fetches its own profile page **only if**:

1. the listing gave no usable image (`is_real_image` rejects `data:` URIs), **and**
2. the cat's `source_url` is a distinct page (not the listing itself), **and**
3. the DB doesn't already hold an enriched row (image present) for
   `(source_url, name)` — enrichment is remembered between runs.

Profile pages are fetched free and batch-extracted the same way
(`force_source_url=True`, one cat per page). `_merge_profile` overlays non-empty
profile fields onto the listing cat while keeping the listing's `source_url` and
`listing_url`.

### 5. Normalize & upsert

`normalize_cat` validates enums (bad gender → `""`, bad age → `adult`, bad
status → `available`), Title-Cases ALL-CAPS names, drops placeholder images, and
requires a `source_url`.

`upsert_cat` inserts with `ON CONFLICT (source_url, lower(name)) DO UPDATE`.
Three guards make re-scrapes non-destructive:

- `description = COALESCE(excluded.description, cats.description)`
- `image_url = COALESCE(excluded.image_url, cats.image_url)`
- `tags` keep the stored value when the new array is empty

…so a listing-only pass never wipes data that a profile pass enriched earlier.

### 6. Adopted detection

After a page was **successfully** re-extracted, any cat with
`listing_url = page AND scraped_at < run_started` was not seen in the fresh
extraction → `status = "adopted"`. It disappears from the catalog (default
filter is `available`) but the row stays; if the cat reappears later, the upsert
sets its status straight back from the site. When *all* pages of a source were
extracted in one run, a source-wide sweep also retires legacy rows that predate
`listing_url` tracking.

## LLM providers

`_generate_text` routes to a provider chosen at startup:

| | Anthropic (default when `ANTHROPIC_API_KEY` is set) | Gemini (fallback) |
|---|---|---|
| Default model | `claude-haiku-4-5` | `gemini-2.5-flash` |
| Request shape | `messages.create` with `system` + user text, `max_tokens` 16 000 | `generate_content` with `system_instruction`, `response_mime_type: application/json` |
| Retries | SDK built-in (429/5xx), `max_retries` = `SCRAPER_MAX_RETRIES` | manual exponential backoff (5 s → 60 s) on 429/500/502/503/504 |
| Quota notes | pay-per-token, no request caps | free tier caps *requests per day per model* — the batching design exists because of this |

Force a provider with `SCRAPER_PROVIDER=anthropic|gemini`; override the model
with `SCRAPER_MODEL`.

## Configuration knobs (env)

| Variable | Default | Meaning |
|---|---|---|
| `SCRAPER_PROVIDER` | auto | `anthropic` if its key is set, else `gemini` |
| `SCRAPER_MODEL` | per provider | LLM model id |
| `SCRAPER_MAX_RETRIES` | 4 | transient-error retries |
| `SCRAPER_MAX_BATCH_PAGES` | 12 | pages per LLM request |
| `SCRAPER_MAX_BATCH_CHARS` | 180000 | char budget per LLM request |
| `SCRAPER_MAX_OUTPUT_TOKENS` | 16000 | Anthropic `max_tokens` per request |

## Cost profile (measured, claude-haiku-4-5)

| Scenario | LLM requests | Approx. cost |
|---|---|---|
| First run / everything changed | ~6–10 | ~$0.25–0.30 |
| Typical incremental run (1 page changed) | 1–2 | ~$0.02–0.05 |
| Nothing changed | 0 | $0.00 |

The run summary is logged by the backend:
`Scrape done: N upserts | pages extracted: X, skipped unchanged: Y`.

## Known trade-offs

- Two *different* cats sharing both a listing page and a name would merge into
  one row (accepted: far rarer than the casing collisions the composite key
  solves).
- Profile data is refreshed only while a cat lacks an image; a shelter editing
  a description later won't be picked up unless the row loses enrichment.
- Volatile page content (counters, rotating widgets) makes a page hash-unstable,
  which costs one extra small LLM call per run — never wrong data.
