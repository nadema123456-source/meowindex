import { Paw } from "./CatDoodle";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-start justify-between gap-6 px-4 py-8 text-sm text-muted">
        <div className="flex items-start gap-3">
          <Paw className="mt-0.5 h-5 w-5 shrink-0" fill="#f9a8d4" />
          <div>
            <p className="font-display text-base font-bold text-ink">
              MeowIndex
            </p>
            <p className="mt-1 max-w-sm">
              Cats aggregated from public Czech shelter websites. Please adopt
              responsibly.
            </p>
          </div>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-ink">Developers</p>
          <ul className="mt-1 space-y-1">
            <li className="flex items-center gap-1.5">
              <Paw className="h-3 w-3 shrink-0" fill="#bfdbfe" />
              <a
                href={`${API_BASE}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer underline-offset-4 transition hover:text-ink hover:underline"
              >
                Public REST API docs (Swagger)
              </a>
            </li>
            <li className="flex items-center gap-1.5">
              <Paw className="h-3 w-3 shrink-0" fill="#fde68a" />
              <span>
                Free to use:{" "}
                <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">
                  GET /api/v1/cats
                </code>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
