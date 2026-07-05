# Deployment

Production topology: **Railway** hosts the backend container + PostgreSQL,
**Vercel** hosts the Next.js frontend. Both auto-deploy from pushes to `main`
on GitHub (`nadema123456-source/meowindex`).

```
git push origin main
   ├──► Railway  builds backend/Dockerfile → runs startup migrations → live API
   └──► Vercel   builds frontend/ (Next.js preset) → live site
```

> Vercel matches the **commit author e-mail** to a GitHub account. Commits made
> with an unrecognized e-mail are built but **Blocked** — the repo's local git
> config pins `user.email` to the account e-mail for this reason.

## Railway (backend + database)

Project contains two services:

### `meowindex` (backend)

| Setting | Value |
|---|---|
| Source | GitHub repo, branch `main` |
| Root directory | `backend` (so the Dockerfile is found) |
| Build | `backend/Dockerfile` (python:3.12-slim) |
| Start | `uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}` — Railway injects `PORT` |
| Public domain | `meowindex-production.up.railway.app`, **target port must equal the injected `PORT`** (currently 8080) — a mismatch shows Railway's "Application failed to respond" |

Variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | reference `${{Postgres.DATABASE_URL}}` (internal `postgres.railway.internal`; the app normalizes the scheme to `postgresql+asyncpg://`) |
| `ANTHROPIC_API_KEY` | Anthropic key → scraper uses `claude-haiku-4-5` |
| `GEMINI_API_KEY` | optional fallback provider |
| `SCRAPE_API_KEY` | shared secret for `POST /api/v1/scrape` |
| `SCRAPER_*` | optional tuning (see [scraper.md](scraper.md)) |

> **Gotcha:** after adding/editing variables Railway stages the change — you must
> click **Apply changes / Deploy**, otherwise the running deployment keeps the
> old environment (symptom in logs: `DB connect … to localhost:5432 …`).

### `Postgres`

Stock Railway PostgreSQL plugin. No manual schema work is ever needed — the
backend's startup migrations create/upgrade everything on boot
(see [backend.md](backend.md)).

## Vercel (frontend)

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Framework preset | **Next.js** |
| Production domain | `meowindex.vercel.app` (deployment-hash URLs are login-protected; share the stable domain) |

Environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://meowindex-production.up.railway.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://meowindex.vercel.app` (absolute OG URLs) |

## Populating / refreshing production data

Scraping is currently triggered manually:

```bash
curl -X POST https://meowindex-production.up.railway.app/api/v1/scrape \
  -H "X-API-Key: $SCRAPE_API_KEY"
```

Runs are incremental (page fingerprints), so frequent triggering is cheap —
an unchanged day costs $0 in LLM tokens. A scheduled trigger (GitHub Actions
cron hitting the endpoint daily) is the natural next step; it only needs the
URL and the key as repo secrets.

## Deploy checklist for a new environment

1. Provision Postgres; put its URL in `DATABASE_URL` (any `postgres://` scheme).
2. Deploy `backend/` with `ANTHROPIC_API_KEY` (or `GEMINI_API_KEY`) and a strong
   `SCRAPE_API_KEY`; expose the port the platform injects.
3. Hit `/health` → `{"status":"ok"}`; logs must show
   `Database ready at <host>` (not `localhost`).
4. Deploy `frontend/` with `NEXT_PUBLIC_API_URL` pointing at step 2.
5. Run the scrape curl above; verify `/api/v1/stats` and the catalog page.
