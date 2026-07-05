# Frontend

Next.js 14 (App Router) + TypeScript + Tailwind CSS + framer-motion, in
`frontend/`. Every data page is `export const dynamic = "force-dynamic"` — the
UI always renders live API data, there is no mock data anywhere.

## Routes

| Route | File | What it does |
|---|---|---|
| `/` | `app/page.tsx` | Landing: hero with real cat photos (urgent-first collage), Cat of the Day, "Adopting is easy" steps, Czechia shelter map, rotating cat facts, final CTA |
| `/cats` | `app/cats/page.tsx` | Catalog: search + 6 filters + sort, urgent/longest quick chips, fixed-column responsive grid, pagination (24/page) |
| `/cats/[id]` | `app/cats/[id]/page.tsx` | Detail: photo, meta card, tags, description, share button, "verified on" date, "More cats from this shelter" |
| `/favorites` | `app/favorites/page.tsx` | Client page listing hearts saved in `localStorage` |
| `/adopt` | `app/adopt/page.tsx` | Six-section responsible-adoption guide |
| `/random` | `app/random/route.ts` | Route handler → 302 to a random available cat (`total` → random page of size 1) |
| — | `app/template.tsx` | Page-transition wrapper (fade + 8 px rise, 180 ms) |
| — | `app/cats/loading.tsx` | Skeleton grid streamed while the catalog fetches |

### Data helpers

- `app/api.ts` — thin typed fetch client (`getCats`, `getCat`, `getStats`,
  `getShelters`), `cache: "no-store"`, base URL from `NEXT_PUBLIC_API_URL`.
- `app/types.ts` — `Cat`, `Shelter`, `CatList`, `Stats` interfaces mirroring the
  API schemas.
- `app/format.ts` — `displayAge` (hides truncated age artifacts like `"Roky"`),
  `formatVerified` (scraped_at → `2 Jul 2026`).
- `app/catFacts.ts` — pool of 30 true cat facts + `pickFacts(n)`
  (Fisher–Yates, server-side per request → different six facts every load).

## Components

| Component | Purpose |
|---|---|
| `CatCard` | Grid card: photo (hover zoom), name, age, shelter, semantic tag badges, heart overlay, reserved badge |
| `MotionCard` | Client wrapper adding staggered fade-in + `whileHover`/`whileTap` to any card |
| `Reveal` | Once-only `whileInView` fade/rise for landing sections |
| `CatFilters` | Search input + Dropdowns (gender, age, location, shelter, tag, sort) writing to URL query params |
| `Dropdown` | Custom accessible select (click-outside close, active highlight) |
| `FavoriteButton` / `FavLink` / `favorites.ts` | `localStorage`-backed hearts (`meowindex-favorites` key, cross-component sync via a custom `meowindex-favs-changed` event + `storage` event) |
| `ShareButton` | Web Share API with clipboard fallback ("Link copied!") |
| `CatDoodle` | Hand-drawn inline SVG cats (`CatSitting`, `CatLoaf`, `CatPeek`) + `Paw`, `Heart` icons — no emoji, no external assets |
| `CzechMap` | Decorative simplified SVG map of Czechia with shelter pins |
| `PastelBackground` | Full-viewport fixed gradient + 7 blurred pastel blobs, shared by every page via the root layout |
| `Navbar` | Logo, dice → `/random`, heart-with-count → `/favorites`, Browse CTA (label collapses to "Cats" on mobile) |
| `Footer` | Blurb + `/adopt` link + public API (Swagger) links |
| `tagStyle.ts` | Semantic badge colors: urgent → orange with ring, long-term → purple, rest cycle calm pastels |

## Design system

Defined in `tailwind.config.ts`:

- **Palette**: `cream` #fffdf8 (bg), `ink` #403d4d (text), `muted`, and pastels
  `butter` / `blossom` / `babyblue` / `mint` / `lilac` / `peach`.
- **Claymorphism**: chunky 3 px white borders, `shadow-clay` /`shadow-clay-sm`
  (outer drop + inner top-light/bottom-shade), radii up to `rounded-5xl`.
- **Type**: Baloo 2 (`font-display`, loaded via `next/font`) for headings/CTAs;
  system sans for body.
- **Affordance rule**: clickable elements get `cursor-pointer` + hover
  lift/scale + often a `→`; purely informational chips/cards are flat with
  `cursor-default` and no hover state.

### Grid layout

Cat grids use **fixed column counts** per breakpoint (`grid-cols-1 sm:2 md:3
xl:4 2xl:5`) rather than `auto-fit` — this keeps every card the same size, so a
single favorite doesn't stretch across the screen and incomplete last rows look
like a normal catalog.

## Motion

All animation is opacity/transform only (no layout shift) and every animated
component checks `useReducedMotion()` — with `prefers-reduced-motion: reduce`
it renders a plain, non-animated DOM.

- `template.tsx` — page transition, 180 ms fade + 8 px rise.
- `MotionCard` — per-card entrance stagger (40 ms/card, capped 0.4 s),
  hover scale 1.02 / tap 0.98.
- `Reveal` — landing sections fade/rise on first scroll into view.

## Metadata & SEO

- Root layout sets a title template (`%s | MeowIndex`), description and
  OpenGraph defaults; `metadataBase` comes from `NEXT_PUBLIC_SITE_URL`.
- `/cats/[id]` implements `generateMetadata`: per-cat title
  (`Martin — cat for adoption`), description from the cat's story, and **OG
  image = the cat's photo**, so shared links preview the actual cat.

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (no trailing slash) |
| `NEXT_PUBLIC_SITE_URL` | Public site origin for absolute OG URLs |

## Conventions

- Cat photos use plain `<img>` (remote shelter domains, no optimization proxy) —
  each usage carries an eslint disable for `@next/next/no-img-element`.
- ESLint: `next/core-web-vitals` (`.eslintrc.json`); `npm run lint`.
- No emoji as UI icons — inline SVGs only (`CatDoodle`, hand-rolled icons).
