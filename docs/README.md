# MeowIndex — Technical Documentation

MeowIndex is an AI-powered cat adoption aggregator: it scrapes Czech animal-shelter
websites, uses an LLM to turn messy HTML into structured, English-translated data,
and serves it through a public REST API and a Next.js frontend.

| Live | URL |
|---|---|
| Frontend | https://meowindex.vercel.app |
| API | https://meowindex-production.up.railway.app |
| API docs (Swagger) | https://meowindex-production.up.railway.app/docs |
| Repository | https://github.com/nadema123456-source/meowindex |

## Documentation map

New to the project? Start with **[development.md](development.md)** to run it
locally, or **[architecture.md](architecture.md)** for the big picture.

| Document | What it covers |
|---|---|
| [architecture.md](architecture.md) | System overview, components, data flow, tech stack |
| [api.md](api.md) | Complete REST API reference with examples |
| [backend.md](backend.md) | FastAPI app, data model, startup migrations |
| [scraper.md](scraper.md) | The AI scraping pipeline — batching, incremental fingerprints, adopted detection, dedup, costs |
| [frontend.md](frontend.md) | Next.js app structure, routes, components, design system, animations |
| [security.md](security.md) | Threat model, hardening, Aikido audit report |
| [deployment.md](deployment.md) | Railway + Vercel setup, environment variables, deploy flow |
| [development.md](development.md) | Local setup, everyday commands, verification workflow, known pitfalls |

## Repository layout

```
meowindex/
├── backend/                 FastAPI + SQLAlchemy (async) + AI scraper
│   ├── main.py              App entry point (CORS, routers, lifespan)
│   ├── schemas.py           Pydantic response models
│   ├── db/                  Engine, ORM models, startup migrations, seed
│   ├── routers/             cats, shelters, stats, scrape endpoints
│   ├── scraper/             agent (LLM), runner (orchestration), sources
│   └── alembic/             Migration scaffold (startup migrations are primary)
├── frontend/                Next.js 14 App Router + Tailwind + framer-motion
│   ├── app/                 Routes, API client, helpers
│   └── components/          UI components (cards, filters, doodles, motion)
├── docs/                    ← you are here
├── docker-compose.yml       Local dev: backend + PostgreSQL
└── README.md                Quick start
```
