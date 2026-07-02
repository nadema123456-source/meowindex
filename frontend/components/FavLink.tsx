"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FAVS_EVENT, getFavorites } from "./favorites";

export default function FavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getFavorites().length);
    sync();
    window.addEventListener(FAVS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link
      href="/favorites"
      aria-label={`My favorites (${count})`}
      className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[3px] border-white bg-white/70 shadow-clay-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-babyblue"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 text-pink-500"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 20.3s-7-4.4-9.3-8.6C1.3 8.3 3.2 5 6.5 5c2 0 3.5 1.1 4.3 2.6h2.4C14 6.1 15.5 5 17.5 5c3.3 0 5.2 3.3 3.8 6.7C19 15.9 12 20.3 12 20.3Z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 font-display text-[0.65rem] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
