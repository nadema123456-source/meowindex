import Link from "next/link";
import { CatPeek } from "./CatDoodle";

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
        <Link
          href="/cats"
          className="cursor-pointer rounded-full border-[3px] border-white bg-blossom/70 px-5 py-2 font-display text-sm font-bold text-ink shadow-clay-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-babyblue"
        >
          Browse cats
        </Link>
      </nav>
    </header>
  );
}
