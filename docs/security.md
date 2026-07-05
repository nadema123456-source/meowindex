# Security

MeowIndex is a public, read-only data product with a single privileged
operation. The security posture follows from that shape: minimize what can be
written, protect the one write path, and never hold data worth stealing.

## Independent audit — Aikido Security

The repository and its dependencies are continuously monitored by
[Aikido Security](https://www.aikido.dev). The full generated report is
committed here: **[security-report-aikido.pdf](security-report-aikido.pdf)**
(July 2026).

Highlights:

- **Benchmark: top 10 % of Aikido accounts** (code repositories: top 20 %).
- Active measures across the **OWASP Top 10 (2025)** — access control,
  misconfiguration, supply chain (lockfile-pinned dependencies), cryptographic
  failures, injection (SQLi/XSS/CSRF/command), insecure design,
  authentication, integrity, exceptional conditions.
- **Secrets scan of the entire git history: 0 findings.**
- Scan cadence: dependencies, SAST, IaC and secret scans run **daily**;
  446 OSS licenses monitored weekly.

## Threat model

| Asset | Threat | Mitigation |
|---|---|---|
| Database contents | Unauthorized writes | Only one write endpoint exists (`POST /api/v1/scrape`); it is API-key gated. All other endpoints are read-only. |
| `SCRAPE_API_KEY` | Timing attacks on comparison | Key check uses `hmac.compare_digest` (constant-time), not `==`. |
| Secrets (LLM keys, DB URL) | Leakage via repo | Secrets live only in environment variables (`.env` is gitignored, only empty `.env.example` files are committed). Full git history was audited before the repo went public — including a history rewrite that removed personal metadata. |
| SQL layer | Injection | No raw SQL in request paths — SQLAlchemy ORM with bound parameters everywhere; user inputs validated/coerced by FastAPI + Pydantic (typed query params, enum whitelists, bounded pagination). |
| Scraped content | Stored XSS via cat data | React escapes all rendered strings by default; no `dangerouslySetInnerHTML` anywhere. LLM output is parsed as JSON and normalized (enum whitelists, URL fields only rendered as `src`/`href` values). |
| Frontend users | Clickjacking / MIME sniffing / data leaks | Security headers on every response: `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict `Referrer-Policy`, locked-down `Permissions-Policy`. |
| Outbound scraping | Abusive crawling | Identified User-Agent (`MeowIndexBot/1.0`), 30 s timeouts, and page fingerprinting that avoids re-processing unchanged content. |

## Design decisions worth explaining

- **Open CORS (`*`) is intentional.** The API serves public, non-personal data
  (cats listed on public shelter websites) and is explicitly offered as a free
  public API. There are no cookies, sessions or credentials to protect —
  cross-origin reads are the feature, not a bug.
- **No user accounts, no PII.** Favorites live in the visitor's own
  `localStorage`; the backend stores nothing about visitors. The only personal
  data anywhere is what shelters publish publicly (a contact e-mail inside a
  cat's story, at most).
- **Fail-closed key handling.** If `SCRAPE_API_KEY` is unset, the scrape
  endpoint returns 500 rather than allowing unauthenticated access.
- **Per-source error isolation.** A malicious or broken shelter page can fail
  its own extraction but cannot abort the run or corrupt other sources' data;
  upserts are idempotent and enrichment fields never downgrade.

## Known limitations / accepted risks

- **No rate limiting** on the API — acceptable for a hackathon-scale public
  read API behind Railway's edge; the write path is key-protected. Production
  hardening would add a reverse-proxy rate limit.
- **Scrape endpoint is synchronous** — a long run holds a connection open.
  A queue/background worker would be the production approach.
- **LLM prompt injection**: scraped pages are untrusted input to the LLM. The
  blast radius is bounded by design — the model can only influence *cat data
  fields*, which are schema-validated, enum-whitelisted and HTML-escaped on
  render; it cannot trigger tools or writes beyond the cat upsert itself.
