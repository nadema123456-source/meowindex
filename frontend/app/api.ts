import type { Cat, CatList, Shelter, Stats } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getCats(
  params: Record<string, string>
): Promise<CatList> {
  // Drop empty values so we don't send blank filters.
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v != null)
  );
  const searchParams = new URLSearchParams(clean);
  const res = await fetch(`${API_BASE}/api/v1/cats?${searchParams}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch cats: ${res.status}`);
  return res.json();
}

export async function getCat(id: string): Promise<Cat> {
  const res = await fetch(`${API_BASE}/api/v1/cats/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch cat ${id}: ${res.status}`);
  return res.json();
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/api/v1/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json();
}

export async function getShelters(): Promise<Shelter[]> {
  const res = await fetch(`${API_BASE}/api/v1/shelters`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch shelters: ${res.status}`);
  return res.json();
}
