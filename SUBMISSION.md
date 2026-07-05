# 🐾 MeowIndex — Hackathon Submission

> **Reference ID:** `[YOUR-REFERENCE-ID]`
> **Live demo:** https://meowindex.vercel.app
> **Public API:** https://meowindex-production.up.railway.app/docs
> **Built from scratch during the hackathon.**

---

## The world-domination plan (wholesome edition)

Cats can't take over the world from a shelter cage. The bottleneck of feline
world domination isn't ambition — it's **visibility**: hundreds of wonderful
cats sit on dozens of small shelter websites with clunky UIs, Czech-only
descriptions, broken photos and zero reach.

**MeowIndex fixes the supply chain of cat domination.** It aggregates
adoptable cats from shelters across Czechia into one joyful, colorful catalog
— scraped, translated and kept fresh by an AI agent — so every cat gets seen,
and every human gets assimilated… adopted by a cat.

### How it ties to the theme (all four inspiration tracks)

| Track | How MeowIndex delivers |
|---|---|
| 🐱 **For the Cats** | An adoption platform that gives every shelter cat — even ones on tiny websites nobody visits — equal visibility, photos, and an English story. Urgent and longest-waiting cats get surfaced first. |
| ❤️ **For Cat Owners** | A built-in [Adopt Responsibly guide](https://meowindex.vercel.app/adopt): how to choose the right cat and make the move calm and stress-free. Favorites, filters and a "Cat of the Day" help humans find *their* cat. |
| 🌍 **For the Community** | Small shelters get a free distribution channel with zero integration work — adding a shelter is one URL in a config file. Every cat links straight back to its shelter, where adoption actually happens. |
| ✨ **For Developers** | The whole dataset is a **free, documented, public REST API** ([Swagger](https://meowindex-production.up.railway.app/docs)) — cat data as a service for the next cat project. |

---

## What makes it interesting (not just another CRUD app)

**One LLM prompt replaces N scrapers.** Every shelter site has different
markup; instead of brittle per-site parsers, an LLM (Claude Haiku) reads the
cleaned page text and returns structured cats — and while it's at it, it
**translates each cat's story into English** and **normalizes messy ages**
("jaro 2024" → "born spring 2024").

**A cost-aware incremental pipeline** makes it sustainable on pocket money:

- 🧾 Every scraped page is **fingerprinted (SHA-256)** — unchanged pages never
  reach the LLM. A day where nothing changed costs **$0.00**.
- 📦 Changed pages are **batched** (up to 12 pages per request) instead of one
  call per page.
- 🖼️ Cats without photos get a **profile-page fallback** — fetched once,
  remembered forever (enriched data is never re-extracted or downgraded).
- 🏠 Cats that disappear from a shelter page are automatically marked
  **adopted** — and revived if they ever come back.

Real numbers: a full first scrape ≈ **$0.25**; a typical daily refresh ≈
**$0.02–0.05**. Feline world domination, fiscally responsible.

**Resilient by design:** exponential-backoff retries, idempotent upserts with
a case-insensitive dedup key, per-source error isolation (one broken shelter
never kills a run), dual-provider failover (Anthropic → Gemini), and
idempotent startup migrations — the same code migrates local Docker and
production automatically.

---

## Architecture at a glance

```
shelter sites ──httpx──► FastAPI backend (Railway) ──► PostgreSQL 16
                          │  BeautifulSoup clean          ▲
                          │  SHA-256 page fingerprints    │ SQLAlchemy async
                          │  batched LLM extraction ──► Claude Haiku 4.5
                          └─ public REST API ◄──────── Next.js 14 (Vercel)
```

Full documentation in [`docs/`](docs/README.md): architecture, API reference,
scraper internals, frontend, deployment and development guides.

## Security

- **Independent Aikido Security audit: top 10 % of Aikido accounts** — full
  report in [docs/security-report-aikido.pdf](docs/security-report-aikido.pdf),
  threat model and hardening notes in [docs/security.md](docs/security.md).
- The only write endpoint (`POST /api/v1/scrape`) is API-key gated with a
  constant-time comparison; everything else is read-only by design.
- ORM-parameterized queries (no raw SQL), Pydantic validation on every input,
  security headers (frame-ancestors, nosniff, referrer/permissions policy) on
  every frontend response.
- No secrets in the repository — the entire git history was audited (and
  scanned by Aikido: 0 findings) before going public.
- Open CORS is intentional: a public, read-only dataset with no cookies or PII.

## A 60-second tour for judges

1. **https://meowindex.vercel.app** — the landing page: live stats, Cat of the
   Day, shelter map, rotating cat facts.
2. Hit the **🎲 dice** in the navbar — a random cat, translated story and all.
3. **[/cats](https://meowindex.vercel.app/cats)** — search "Mourek", filter by
   *urgent*, sort by *longest waiting*, heart a few cats (no login needed).
4. **[/adopt](https://meowindex.vercel.app/adopt)** — the responsible-adoption
   guide.
5. **[API docs](https://meowindex-production.up.railway.app/docs)** — try
   `GET /api/v1/cats?location=Praha` yourself.

---

*Cats already run the internet. MeowIndex just gives them the keys to the
front door — one adoption at a time.* 🐈‍⬛
