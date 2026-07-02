import { Paw } from "./CatDoodle";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl items-start gap-3 px-4 py-8 text-sm text-muted">
        <Paw className="mt-0.5 h-5 w-5 shrink-0" fill="#f9a8d4" />
        <div>
          <p className="font-display text-base font-bold text-ink">MeowIndex</p>
          <p className="mt-1">
            Cats aggregated from public Czech shelter websites. Please adopt
            responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
