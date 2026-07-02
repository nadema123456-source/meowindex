import Link from "next/link";
import { getCats, getShelters } from "../api";
import type { Cat, CatList, Shelter } from "../types";
import CatCard from "@/components/CatCard";
import CatFilters from "@/components/CatFilters";
import { CatLoaf } from "@/components/CatDoodle";

export const dynamic = "force-dynamic";

const FILTER_KEYS = [
  "gender",
  "age_category",
  "shelter_id",
  "location",
  "status",
] as const;

function buildParams(
  searchParams: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const key of FILTER_KEYS) {
    const v = searchParams[key];
    if (typeof v === "string" && v) params[key] = v;
  }
  const page = searchParams.page;
  params.page = typeof page === "string" && page ? page : "1";
  params.per_page = "24";
  return params;
}

export default async function CatsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = buildParams(searchParams);

  let data: CatList = { total: 0, page: 1, per_page: 24, cats: [] };
  let shelters: Shelter[] = [];
  let error = false;
  try {
    [data, shelters] = await Promise.all([getCats(params), getShelters()]);
  } catch {
    error = true;
  }

  const shelterMap = new Map(shelters.map((s) => [s.id, s]));
  const cats: Cat[] = data.cats.map((c) => ({
    ...c,
    shelter: shelterMap.get(c.shelter_id) ?? null,
  }));

  const locations = Array.from(
    new Set(shelters.map((s) => s.location).filter(Boolean)),
  ).sort();

  const page = data.page;
  const totalPages = Math.max(1, Math.ceil(data.total / data.per_page));

  function pageHref(p: number): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k !== "page" && k !== "per_page" && v) sp.set(k, v);
    }
    sp.set("page", String(p));
    return `/cats?${sp.toString()}`;
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
            Meet the cats
          </h1>
          <p className="mt-1 text-muted">
            {error
              ? "Couldn't reach the catalog right now."
              : `${data.total} cat${data.total === 1 ? "" : "s"} looking for a home`}
          </p>
        </div>
        <CatFilters shelters={shelters} locations={locations} />
      </div>

      {cats.length === 0 ? (
        <div className="rounded-4xl bg-white p-16 text-center shadow-soft">
          <CatLoaf className="mx-auto h-24 w-36" body="#bfdbfe" accent="#fbcfe8" />
          <p className="mt-4 text-muted">No cats match these filters.</p>
        </div>
      ) : (
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {cats.map((cat) => (
            <CatCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:bg-blossom/40"
            >
              ← Prev
            </Link>
          )}
          <span className="text-sm font-medium text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:bg-blossom/40"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
