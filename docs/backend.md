# Backend

FastAPI application in `backend/`, served by uvicorn. Everything is async
end-to-end (FastAPI → SQLAlchemy 2.0 async → asyncpg).

## Entry point — `main.py`

- Loads `.env` (python-dotenv), creates the app with title/description/version.
- **Lifespan**: `init_db()` runs on startup — creates tables and applies the
  idempotent startup migrations (below), retrying while Postgres boots.
- **CORS**: `allow_origins=["*"]` — the API is intentionally public.
- Routers mounted: `cats`, `shelters`, `stats`, `scrape` plus `/` and `/health`.
- The Dockerfile honors `$PORT` (`uvicorn --port ${PORT:-8000}`) so Railway's
  injected port works; local default is 8000.

## Data model — `db/models.py`

### `shelters`

| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| name | varchar(255) | unique |
| website | varchar(512) | |
| location | varchar(255) | city/region, may be empty |
| created_at / updated_at | timestamptz | server defaults |

### `cats`

| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| name | varchar(255) | ALL-CAPS source names are normalized to Title Case |
| gender | varchar(16) | `female` \| `male` \| `""` (unknown) |
| age_text | varchar(128) | normalized English estimate (`"~2 years"`, `"born spring 2024"`) |
| age_category | varchar(32) | `kitten` \| `adult` \| `senior` (default `adult`) |
| shelter_id | FK → shelters | `ON DELETE CASCADE` |
| location | varchar(255) | falls back to the shelter's location |
| description | text, nullable | LLM-translated English story |
| tags | JSONB | English trait/suitability strings |
| image_url | varchar(1024), nullable | absolute URL; lazy-load `data:` placeholders are rejected |
| source_url | varchar(1024) | the cat's own profile page (or the listing page if none exists) |
| listing_url | varchar(1024) | which listing page the cat was found on — drives incremental refresh & adopted detection |
| status | varchar(32) | `available` \| `reserved` (from the site) \| `adopted` (set by the pipeline when a cat disappears) |
| scraped_at | timestamptz | last time this row was confirmed on the site |
| created_at / updated_at | timestamptz | |

Indexes: `gender`, `age_category`, `status`, `shelter_id`, `listing_url`, and the
dedup key — a **unique expression index** `uq_cats_source_lower_name` on
`(source_url, lower(name))`. Case-insensitive because shelter sites and LLM runs
disagree on casing (`"OSKAR"` vs `"Oskar"`).

### `page_snapshots`

| Column | Type | Notes |
|---|---|---|
| url | varchar(1024) PK | scraped page URL |
| content_hash | varchar(64) | SHA-256 of the cleaned page text |
| fetched_at | timestamptz | |

If a page's hash matches the stored one, the scrape skips the LLM for that page
entirely.

## Startup migrations — `db/database.py::init_db()`

Runs inside one transaction on every boot, with **10 retries × 3 s** while the
database comes up (each attempt logs the connection target, so a missing
`DATABASE_URL` is obvious in deploy logs — it would say `localhost`).

1. `Base.metadata.create_all` — creates missing tables.
2. `DROP INDEX IF EXISTS` for the two legacy dedup indexes
   (`uq_cats_source_url`, `uq_cats_source_url_name`).
3. Dedup cleanup: deletes older rows that differ only by name casing.
4. `CREATE UNIQUE INDEX IF NOT EXISTS uq_cats_source_lower_name (source_url, lower(name))`.
5. `ALTER TABLE cats ADD COLUMN IF NOT EXISTS listing_url …` + its index
   (`create_all` cannot add columns to existing tables).
6. One-off Python pass that Title-Cases SHOUTY names (done in Python, not SQL
   `initcap`, so Czech diacritics survive C-locale databases).

All steps are idempotent — safe to run on every deploy, everywhere.
`DATABASE_URL` scheme is normalized (`postgres://` / `postgresql://` →
`postgresql+asyncpg://`) so managed-Postgres URLs (Railway, Heroku) work as-is.

## Routers

| File | Endpoints | Notable logic |
|---|---|---|
| `routers/cats.py` | `GET /api/v1/cats`, `GET /api/v1/cats/{id}` | filter assembly, `ilike` search, JSONB tag match via `cast(tags, String)`, sort modes (`newest`/`longest`/`urgent` — urgent uses a `CASE WHEN tags ILIKE '%urgent%'` rank), pagination, `selectinload(shelter)` on detail |
| `routers/shelters.py` | `GET /api/v1/shelters` | outer join + `count(cats.id)` group-by |
| `routers/stats.py` | `GET /api/v1/stats` | counts **available** cats only (keeps landing == catalog), `max(scraped_at)` as last-scrape |
| `routers/scrape.py` | `POST /api/v1/scrape` | `X-API-Key` guard (compares to `SCRAPE_API_KEY` env), delegates to `scraper.runner.run_all_sources` |

## Pydantic schemas — `schemas.py`

`CatBase` (full cat), `CatDetail` (+ nested `ShelterBase`), `CatList`
(pagination envelope), `ShelterWithCount`, `Stats`, `ScrapeResult`. All use
`from_attributes` so ORM rows serialize directly.

## Seed script — `db/seed.py`

`python -m db.seed` creates the six shelters and one demo cat — handy for
exercising the API/frontend without spending LLM credit. Real data always comes
from `POST /api/v1/scrape`.

## Alembic

A working scaffold (`alembic/`, async `env.py` reading `DATABASE_URL`) is
included for future schema work, but the startup migrations above are currently
the single source of truth. If you adopt Alembic properly, port steps 2–6 into a
revision and drop them from `init_db()`.
