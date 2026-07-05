# Architecture

## System overview

```
                       ┌─────────────────────────────────────────────┐
                       │              Shelter websites               │
                       │  fousky.cz · santakocici.cz · catky.cz ·    │
                       │  luckycats.cz · pesweb.cz · chlupacivnouzi  │
                       └───────────────┬─────────────────────────────┘
                                       │ plain HTTP fetch (httpx, free)
                                       ▼
┌──────────────┐  POST /scrape  ┌─────────────────────────────────────┐
│  cron / user │ ─────────────► │        FastAPI backend (Railway)    │
└──────────────┘   X-API-Key    │                                     │
                                │  scraper/runner.py  ── orchestrates │
                                │  scraper/agent.py   ── LLM extract  │──► Anthropic API
                                │  (BeautifulSoup clean → batch →     │    (claude-haiku-4-5)
                                │   fingerprint diff → upsert)        │    or Gemini fallback
                                │                                     │
                                │  routers/  ── REST API (read side)  │
                                └───────────────┬─────────────────────┘
                                                │ SQLAlchemy async (asyncpg)
                                                ▼
                                ┌─────────────────────────────────────┐
                                │        PostgreSQL 16 (Railway)      │
                                │  cats · shelters · page_snapshots   │
                                └───────────────┬─────────────────────┘
                                                │ JSON over HTTPS
                                                ▼
                                ┌─────────────────────────────────────┐
                                │     Next.js frontend (Vercel)       │
                                │  SSR pages fetch the API per request│
                                └─────────────────────────────────────┘
```

Three deployable parts:

1. **AI scraper** — lives inside the backend, triggered via `POST /api/v1/scrape`.
   Fetches shelter pages over plain HTTP (free), fingerprints them, and only sends
   *changed* content to the LLM in batches. See [scraper.md](scraper.md).
2. **REST API** — read-only public endpoints over the same database, plus the
   key-protected scrape trigger. CORS is fully open by design. See [api.md](api.md).
3. **Frontend** — server-rendered Next.js catalog. Every page is `force-dynamic`
   and fetches the API at request time (no build-time data, no mock data).
   See [frontend.md](frontend.md).

## Data flow (one scrape run)

1. Runner iterates `scraper/sources.py` (6 shelters, 8 listing URLs).
2. Every listing page is downloaded and cleaned (`clean_html`), then hashed
   (SHA-256). Unchanged pages (hash matches `page_snapshots`) skip the LLM —
   their cats just get a `scraped_at` freshness bump.
3. Changed pages are packed into batches (≤ 12 pages / ≤ 180 k chars) and sent to
   the LLM with a strict JSON extraction prompt (name, gender, normalized English
   age, English-translated description, English tags, image URL, profile URL,
   status).
4. Cats whose listing entry has no usable photo get a **profile fallback**: their
   own profile pages are fetched and batch-extracted too — but only if the DB
   doesn't already hold an enriched row for them.
5. Everything is upserted with a case-insensitive dedup key
   `(source_url, lower(name))`. Enrichment fields never downgrade (COALESCE).
6. Cats missing from a successfully re-extracted page are marked
   `status = "adopted"` (hidden from the catalog, revived if they reappear).

## Tech stack

| Layer | Technology |
|---|---|
| API framework | FastAPI (async), uvicorn |
| ORM / DB | SQLAlchemy 2.0 async + asyncpg → PostgreSQL 16 |
| HTML processing | httpx (fetch), BeautifulSoup4 (clean) |
| LLM extraction | Anthropic `claude-haiku-4-5` (default) or Google `gemini-2.5-flash` |
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS, framer-motion |
| Typography | Baloo 2 (display) via `next/font` |
| Hosting | Railway (backend + Postgres), Vercel (frontend) |
| CI/CD | Push to `main` on GitHub → both platforms auto-deploy |

## Key design decisions

- **LLM instead of per-site parsers.** Every shelter site has different markup;
  one extraction prompt replaces N brittle scrapers. Adding a shelter = adding a
  URL to `sources.py`.
- **Request-frugal scraping.** LLM calls are the only real cost, so the pipeline
  minimizes them at three levels: page fingerprints (skip unchanged pages
  entirely), batching (many pages per call), and profile-fetch memoization
  (never re-extract an already-enriched cat).
- **Startup migrations, not Alembic (for now).** Idempotent SQL in
  `db/database.py::init_db()` runs on every boot; the same code migrates local
  Docker and Railway with zero manual steps. The Alembic scaffold exists for
  when the schema outgrows this.
- **Statuses instead of deletes.** Cats that disappear from a shelter page become
  `adopted` rather than being deleted — history is preserved and a cat that
  reappears is automatically revived by the next upsert.
- **SSR-only frontend.** All pages are dynamic so the catalog is always live;
  there is no cache-invalidation problem to solve at this scale.
