import Link from "next/link";
import { CatPeek } from "./CatDoodle";
import FavLink from "./FavLink";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/30 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex cursor-pointer items-end gap-1.5 font-display text-2xl font-extrabold text-ink"
        >
          <CatPeek className="h-7 w-11" body="#fde68a" accent="#fbcfe8" />
          Meow<span className="text-pink-400">Index</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/random"
            aria-label="Surprise me — random cat"
            title="Surprise me — random cat"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[3px] border-white bg-white/70 shadow-clay-sm transition duration-200 hover:-translate-y-0.5 hover:rotate-12 focus-visible:outline focus-visible:outline-4 focus-visible:outline-babyblue"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-sky-500"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              />
              <circle cx="8.4" cy="8.4" r="1.7" />
              <circle cx="15.6" cy="8.4" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="8.4" cy="15.6" r="1.7" />
              <circle cx="15.6" cy="15.6" r="1.7" />
            </svg>
          </Link>
          <FavLink />
          <Link
            href="/cats"
            className="cursor-pointer rounded-full border-[3px] border-white bg-blossom/70 px-5 py-2 font-display text-sm font-bold text-ink shadow-clay-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-babyblue"
          >
            Browse cats
          </Link>
        </div>
      </nav>
    </header>
  );
}
