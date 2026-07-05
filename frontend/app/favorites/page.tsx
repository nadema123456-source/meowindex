"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCat, getShelters } from "../api";
import type { Cat } from "../types";
import { FAVS_EVENT, getFavorites } from "@/components/favorites";
import CatCard from "@/components/CatCard";
import MotionCard from "@/components/MotionCard";
import { CatLoaf } from "@/components/CatDoodle";

export default function FavoritesPage() {
  const [cats, setCats] = useState<Cat[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const ids = getFavorites();
      if (ids.length === 0) {
        if (!cancelled) setCats([]);
        return;
      }
      try {
        const [shelters, ...results] = await Promise.all([
          getShelters().catch(() => []),
          ...ids.map((id) => getCat(String(id)).catch(() => null)),
        ]);
        const shelterMap = new Map(shelters.map((s) => [s.id, s]));
        const found = results
          .filter((c): c is Cat => Boolean(c && c.id))
          .map((c) => ({
            ...c,
            shelter: c.shelter ?? shelterMap.get(c.shelter_id) ?? null,
          }));
        if (!cancelled) setCats(found);
      } catch {
        if (!cancelled) setCats([]);
      }
    }

    load();
    const reload = () => load();
    window.addEventListener(FAVS_EVENT, reload);
    return () => {
      cancelled = true;
      window.removeEventListener(FAVS_EVENT, reload);
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
          My favorites
        </h1>
        <p className="mt-1 text-muted">
          Saved on this device — share the cats you love with your family.
        </p>
      </div>

      {cats === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-4xl bg-white/70 shadow-soft"
            />
          ))}
        </div>
      ) : cats.length === 0 ? (
        <div className="rounded-4xl border-[3px] border-white bg-white p-16 text-center shadow-clay">
          <CatLoaf className="mx-auto h-24 w-36" body="#fbcfe8" accent="#bfdbfe" />
          <p className="mt-4 font-display text-xl font-bold text-ink">
            No favorites yet
          </p>
          <p className="mt-1 text-muted">
            Tap the heart on any cat card to save it here.
          </p>
          <Link
            href="/cats"
            className="mt-5 inline-block cursor-pointer rounded-full border-[3px] border-white bg-blossom/70 px-6 py-2.5 font-display text-sm font-bold text-ink shadow-clay-sm transition hover:-translate-y-0.5"
          >
            Browse cats →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {cats.map((cat, i) => (
            <MotionCard key={cat.id} index={i}>
              <CatCard cat={cat} />
            </MotionCard>
          ))}
        </div>
      )}
    </div>
  );
}
