# Local Development

## Prerequisites

- Docker (backend + Postgres run in containers)
- Node.js 18+ (frontend dev server)
- An LLM API key only if you want to run real scrapes
  (Anthropic: console.anthropic.com · Gemini free tier: aistudio.google.com/apikey)

## First-time setup

```bash
git clone git@github.com:nadema123456-source/meowindex.git
cd meowindex

# 1. Environment
cp .env.example .env            # fill in SCRAPE_API_KEY (+ ANTHROPIC_API_KEY or GEMINI_API_KEY)

# 2. Backend + database
docker compose up -d --build    # API on :8000, tables auto-created on startup
curl localhost:8000/health      # {"status":"ok"}

# 3. Frontend
cd frontend
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                     # http://localhost:3000
```

### Getting data

```bash
# Option A — real scrape (needs an LLM key; ~$0.25 first run on Haiku, ~$0 when unchanged)
curl -X POST localhost:8000/api/v1/scrape -H "X-API-Key: $SCRAPE_API_KEY"

# Option B — free demo seed (6 shelters + 1 cat)
docker compose exec backend python -m db.seed
```

## Everyday commands

| Task | Command |
|---|---|
| Rebuild backend after Python changes | `docker compose up -d --build backend` (code is baked into the image) |
| Backend logs | `docker compose logs -f backend` |
| psql into the DB | `docker compose exec db psql -U postgres -d meowindex` |
| Frontend type check | `cd frontend && npx tsc --noEmit` |
| Frontend lint | `cd frontend && npm run lint` |
| Frontend prod build | `cd frontend && npm run build` — **stop `npm run dev` first!** |
| Byte-compile backend quickly | `python3 -m py_compile backend/**/*.py` |

## Verification workflow (no test suite yet)

The project relies on fast end-to-end checks instead of unit tests:

1. `npx tsc --noEmit` + `python3 -m py_compile …` for static sanity.
2. `curl` the API: `/health`, `/api/v1/stats`, a filtered `/api/v1/cats?…`.
3. `curl` the rendered pages (`/`, `/cats`, `/cats/<id>`) and grep for expected
   markers.
4. For scraper changes, prefer **synthetic DB tests** inside the container
   (calling `upsert_cat` etc. directly) before spending LLM credit; a single
   `scrape_profile(<one-url>)` call is a cheap live smoke test (~$0.005).

## Known pitfalls

- **Never run `next build` while `next dev` is running.** Both write to
  `frontend/.next` and corrupt it (symptom: `Error: Cannot find module
  './NNN.js'` server error). Recovery:
  `pkill -f "next dev" && rm -rf frontend/.next && npm run dev`.
  The same applies to running two dev-server instances against one checkout.
- **Backend code changes need an image rebuild** — `docker compose restart`
  is not enough (`COPY . .` bakes the code in).
- **Railway/Vercel deploy from `main`** — every push to `main` goes live.
  Commit author e-mail must match the GitHub account or Vercel blocks the build.
- **Gemini free tier caps requests/day per model** (`gemini-2.5-flash` is
  extremely low). The batching design keeps full scrapes to ~6–10 requests, but
  repeated testing in one day can still exhaust it — switch models
  (`SCRAPER_MODEL`) or use the Anthropic key.
- **`cats_scraped` counts upserts,** not unique cats — dedup on
  `(source_url, lower(name))` means the number can exceed distinct rows.
- **Adding a shelter**: append it to `backend/scraper/sources.py`
  (name, website, `scrape_urls`, location) and run a scrape — no other code
  changes needed.

## Secrets hygiene

`.env` (repo root) holds real keys and is gitignored — only `.env.example`
files are committed. Never put keys into compose files, code, or docs. The
production `SCRAPE_API_KEY` is intentionally different from the local one.
