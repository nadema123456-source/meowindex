# MeowIndex 🐱

AI-powered cat adoption aggregator. It scrapes Czech animal-shelter websites,
uses Google Gemini to turn messy HTML into structured data, and serves it through a
public REST API and a web frontend.

## Architecture

```
meowindex/
├── backend/      FastAPI + SQLAlchemy (async) + PostgreSQL
│   ├── scraper/  AI scraper: fetch HTML → clean → Gemini → structured JSON
│   ├── db/       async engine, ORM models, seed
│   └── routers/  REST API endpoints
├── frontend/     Next.js 14 (App Router) + Tailwind
└── docker-compose.yml   backend + PostgreSQL for local dev
```

The project has three parts: the **AI scraper**, the **REST API**, and the
**frontend**.

## Quick start

### 1. Backend + database (Docker)

```bash
cp .env.example .env          # set SCRAPE_API_KEY (and optionally ANTHROPIC_API_KEY)
docker-compose up --build
```

The API comes up at <http://localhost:8000>. Tables are created automatically
on startup. Interactive docs: <http://localhost:8000/docs>.

### 2. Run a scrape

This is admin-only and protected by the `X-API-Key` header (`SCRAPE_API_KEY`):

```bash
curl -X POST http://localhost:8000/api/v1/scrape \
  -H "X-API-Key: $SCRAPE_API_KEY"
# → { "cats_scraped": 123, "errors": [] }
```

Each shelter page is fetched, stripped to its main text, and sent to Gemini with
a strict extraction prompt. Results are upserted (deduped on `source_url`).

### Gemini API key

The scraper uses the **Google Gemini API**. Get a key (free tier available) at
<https://aistudio.google.com/apikey>, then set it in `.env`:

```bash
GEMINI_API_KEY=AIza...
```

Override the model with `SCRAPER_MODEL` if you like (default `gemini-2.5-flash`).

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Open <http://localhost:3000>.

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET  | `/api/v1/cats` | List cats. Filters: `gender`, `age_category`, `shelter_id`, `location`, `status`, `page`, `per_page`. |
| GET  | `/api/v1/cats/{id}` | Cat detail (with shelter). |
| GET  | `/api/v1/shelters` | Shelters with cat counts. |
| GET  | `/api/v1/stats` | Totals + last scrape time. |
| POST | `/api/v1/scrape` | Trigger a scrape. Requires `X-API-Key`. |

CORS is open (public API). OpenAPI docs at `/docs`.

Example:

```
GET http://localhost:8000/api/v1/cats?location=Praha&age_category=kitten
```

## Environment variables

| Variable | Where | Purpose |
| -------- | ----- | ------- |
| `DATABASE_URL` | backend | async Postgres DSN (`postgresql+asyncpg://…`) |
| `GEMINI_API_KEY` | backend | Google Gemini API key for the scraper |
| `SCRAPE_API_KEY` | backend | shared secret for `POST /api/v1/scrape` |
| `SCRAPER_MODEL` | backend (optional) | override the Gemini model (default `gemini-2.5-flash`) |
| `NEXT_PUBLIC_API_URL` | frontend | base URL of the backend API |

## Database migrations

Tables are auto-created on startup for local dev. Alembic is configured for
production migrations:

```bash
cd backend
alembic revision --autogenerate -m "message"
alembic upgrade head
```

## Optional seed

To populate shelters (and one demo cat) without a live scrape:

```bash
cd backend
python -m db.seed
```
