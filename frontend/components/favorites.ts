"use client";

/** localStorage-backed favorites — no login needed. */

const KEY = "meowindex-favorites";
export const FAVS_EVENT = "meowindex-favs-changed";

export function getFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: number): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: number): boolean {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(FAVS_EVENT));
  return next.includes(id);
}
