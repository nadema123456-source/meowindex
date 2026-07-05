import type { Metadata } from "next";
import Link from "next/link";
import { getCats, getShelters } from "../api";
import type { Cat, CatList, Shelter } from "../types";
import CatCard from "@/components/CatCard";
import CatFilters from "@/components/CatFilters";
import MotionCard from "@/components/MotionCard";
import { CatLoaf } from "@/components/CatDoodle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse cats",
  description:
    "Filterable catalog of adoptable cats from shelters across Czechia.",
};

const FILTER_KEYS = [
  "gender",
  "age_category",
  "shelter_id",
  "location",
  "status",
  "search",
  "tag",
  "sort",
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

function UrgentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 2s.7 2.6-1 5c-1.2 1.7-2.8 2.6-3.4 4.6-.5 1.6 0 3 .9 4-.2-1.5.4-2.9 1.6-3.6.5 2 2.6 2.4 2.9 4.6.1 1-.3 1.9-1 2.4 2.9-.6 5-3 5-6 0-2.2-1-3.6-2-5-.9-1.2-1.6-2.6-1.4-4.2-1 .4-1.6 1.2-1.6 1.2S14.4 3.4 13.5 2Z" />
      <path d="M9 4.5S9.4 6 8.4 7.4C7.6 8.5 6.5 9.2 6.1 10.5c-.9 2.8.6 5.6 3.1 6.9-.5-.8-.7-1.9-.4-2.9.4-1.7 1.8-2.6 2.4-4.2.3-.9.3-1.7.1-2.4C10.6 6.6 9.6 5.5 9 4.5Z" opacity="0.55" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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

  const urgentActive = params.tag === "urgent";
  const longestActive = params.sort === "longest";

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
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

          {/* emotional quick filters */}
          <div className="flex gap-3">
            <Link
              href={urgentActive ? "/cats" : "/cats?tag=urgent&sort=urgent"}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border-[3px] border-white px-4 py-2 text-sm font-bold shadow-clay-sm transition duration-200 hover:-translate-y-0.5 ${
                urgentActive
                  ? "bg-orange-300 text-orange-950"
                  : "bg-orange-100 text-orange-900"
              }`}
            >
              <UrgentIcon />
              Urgent
            </Link>
            <Link
              href={longestActive ? "/cats" : "/cats?sort=longest"}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border-[3px] border-white px-4 py-2 text-sm font-bold shadow-clay-sm transition duration-200 hover:-translate-y-0.5 ${
                longestActive
                  ? "bg-lilac text-purple-950"
                  : "bg-lilac/50 text-purple-900"
              }`}
            >
              <ClockIcon />
              Longest waiting
            </Link>
          </div>
        </div>
        <CatFilters shelters={shelters} locations={locations} />
      </div>

      {cats.length === 0 ? (
        <div className="rounded-4xl border-[3px] border-white bg-white p-16 text-center shadow-clay">
          <CatLoaf className="mx-auto h-24 w-36" body="#bfdbfe" accent="#fbcfe8" />
          <p className="mt-4 font-display text-xl font-bold text-ink">
            No cats match these filters
          </p>
          <p className="mt-1 text-muted">
            Try widening them — every cat deserves a look.
          </p>
          <Link
            href="/cats"
            className="mt-5 inline-block cursor-pointer rounded-full border-[3px] border-white bg-blossom/70 px-6 py-2.5 font-display text-sm font-bold text-ink shadow-clay-sm transition hover:-translate-y-0.5"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {cats.map((cat, i) => (
            <MotionCard key={cat.id} index={i}>
              <CatCard cat={cat} />
            </MotionCard>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:bg-blossom/40"
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
              className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:bg-blossom/40"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
