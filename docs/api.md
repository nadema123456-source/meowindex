# REST API Reference

Base URL (production): `https://meowindex-production.up.railway.app`
Interactive docs: `/docs` (Swagger UI), `/redoc`.
Postman: import [meowindex.postman_collection.json](meowindex.postman_collection.json).

- All responses are JSON. CORS is open to all origins (public API).
- No authentication for read endpoints; `POST /api/v1/scrape` requires the
  `X-API-Key` header.

## GET /api/v1/cats

Paginated, filterable cat listing.

| Query param | Type | Default | Notes |
|---|---|---|---|
| `gender` | string | — | `female` \| `male` |
| `age_category` | string | — | `kitten` \| `adult` \| `senior` |
| `shelter_id` | int | — | Filter by shelter |
| `location` | string | — | Case-insensitive substring match |
| `status` | string | `available` | `available` \| `reserved` \| `adopted`; pass empty to disable |
| `search` | string | — | Case-insensitive substring match on the cat's name |
| `tag` | string | — | Case-insensitive substring match inside the tags array |
| `sort` | string | `newest` | `newest` (scraped_at desc) \| `longest` (created_at asc — longest in catalog) \| `urgent` (urgent-tagged first, then newest) |
| `page` | int | 1 | ≥ 1 |
| `per_page` | int | 20 | 1–100 |

```bash
curl "https://meowindex-production.up.railway.app/api/v1/cats?location=Praha&age_category=kitten&sort=urgent&per_page=5"
```

Response:

```json
{
  "total": 42,
  "page": 1,
  "per_page": 5,
  "cats": [
    {
      "id": 71,
      "name": "Martin",
      "gender": "male",
      "age_text": "born 2021",
      "age_category": "adult",
      "shelter_id": 5,
      "location": "Poděbrady / Praha",
      "description": "Martin appeared in the center of Poděbrady…",
      "tags": ["independent", "single cat household"],
      "image_url": "https://www.catky.cz/wp-content/…jpg",
      "source_url": "https://www.catky.cz/nase-kocka/martin/",
      "listing_url": "https://www.catky.cz/nase-kocky/adopce-podebrady/",
      "status": "available",
      "scraped_at": "2026-07-02T14:26:21.075793Z",
      "created_at": "2026-07-02T12:53:23.054465Z",
      "updated_at": "2026-07-02T14:26:21.075793Z"
    }
  ]
}
```

## GET /api/v1/cats/{id}

Single cat joined with its shelter. `404` if not found.

```json
{
  "id": 71,
  "name": "Martin",
  "…": "…all fields as above…",
  "shelter": {
    "id": 5,
    "name": "Catky z.s.",
    "website": "https://www.catky.cz",
    "location": "Poděbrady / Praha"
  }
}
```

## GET /api/v1/shelters

All shelters with their **row counts** (includes reserved/adopted rows).

```json
[
  { "id": 1, "name": "Fousky z.s.", "website": "https://www.fousky.cz",
    "location": "Plzeň", "cat_count": 20 }
]
```

## GET /api/v1/stats

Aggregate numbers used by the frontend landing page. `total_cats` counts
**available cats only** so it matches the catalog's default view.

```json
{ "total_cats": 97, "total_shelters": 6, "last_scrape": "2026-07-02T14:26:21Z" }
```

## POST /api/v1/scrape

Triggers a full incremental scrape run. Admin/cron only.

- Header: `X-API-Key: <SCRAPE_API_KEY>` — `401` on mismatch, `500` if the server
  has no key configured.
- Synchronous: the response returns after the run finishes (seconds when nothing
  changed, a few minutes on a full extraction).
- `cats_scraped` counts **upserts**, not unique new cats. `errors` contains
  per-source/per-page failure strings; a single failing source never aborts the
  run.

```bash
curl -X POST https://meowindex-production.up.railway.app/api/v1/scrape \
  -H "X-API-Key: $SCRAPE_API_KEY"
# → {"cats_scraped": 97, "errors": []}
```

## Utility endpoints

| Endpoint | Purpose |
|---|---|
| `GET /` | Service banner (`{"service": "MeowIndex API", …}`) |
| `GET /health` | Liveness probe (`{"status": "ok"}`) |
| `GET /docs`, `GET /redoc` | Auto-generated OpenAPI documentation |

## Error shape

FastAPI's standard envelope:

```json
{ "detail": "Cat not found" }
```

| Status | When |
|---|---|
| 401 | Missing/invalid `X-API-Key` on `/scrape` |
| 404 | Unknown cat id |
| 422 | Invalid query/path parameter types |
| 500 | `SCRAPE_API_KEY` not configured on the server |
