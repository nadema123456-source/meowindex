"use client";

import { useEffect, useState } from "react";
import { FAVS_EVENT, isFavorite, toggleFavorite } from "./favorites";

export default function FavoriteButton({
  catId,
  size = "md",
}: {
  catId: number;
  size?: "md" | "lg";
}) {
  // Start false and sync after mount to avoid SSR/client hydration mismatch.
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const sync = () => setFav(isFavorite(catId));
    sync();
    window.addEventListener(FAVS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [catId]);

  const dim = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <button
      type="button"
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      onClick={(e) => {
        // Cards wrap this button in a Link — don't navigate on toggle.
        e.preventDefault();
        e.stopPropagation();
        setFav(toggleFavorite(catId));
      }}
      className={`${dim} flex cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white/90 shadow-clay-sm transition duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-4 focus-visible:outline-babyblue`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${icon} transition-colors ${fav ? "text-pink-500" : "text-ink/30"}`}
        fill={fav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 20.3s-7-4.4-9.3-8.6C1.3 8.3 3.2 5 6.5 5c2 0 3.5 1.1 4.3 2.6h2.4C14 6.1 15.5 5 17.5 5c3.3 0 5.2 3.3 3.8 6.7C19 15.9 12 20.3 12 20.3Z" />
      </svg>
    </button>
  );
}
