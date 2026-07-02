import Link from "next/link";
import { CatPeek } from "./CatDoodle";
import FavLink from "./FavLink";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/30 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 cursor-pointer items-end gap-1 font-display text-xl font-extrabold text-ink sm:gap-1.5 sm:text-2xl"
        >
          <CatPeek className="h-6 w-9 sm:h-7 sm:w-11" body="#fde68a" accent="#fbcfe8" />
          Meow<span className="text-pink-400">Index</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/random"
            aria-label="Surprise me — random cat"
            title="Surprise me — random cat"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-[3px] border-white bg-white/70 shadow-clay-sm transition duration-200 hover:-translate-y-0.5 hover:rotate-12 focus-visible:outline focus-visible:outline-4 focus-visible:outline-babyblue sm:h-10 sm:w-10"
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
            className="cursor-pointer whitespace-nowrap rounded-full border-[3px] border-white bg-blossom/70 px-4 py-2 font-display text-sm font-bold text-ink shadow-clay-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-babyblue sm:px-5"
          >
            <span className="hidden sm:inline">Browse cats</span>
            <span className="sm:hidden">Cats</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
