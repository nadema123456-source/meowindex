"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Shelter } from "@/app/types";
import Dropdown, { type Option } from "./Dropdown";

const GENDERS: Option[] = [
  { value: "", label: "Any gender" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

const AGE_CATEGORIES: Option[] = [
  { value: "", label: "Any age" },
  { value: "kitten", label: "Kitten (<1y)" },
  { value: "adult", label: "Adult (1–7y)" },
  { value: "senior", label: "Senior (7y+)" },
];

const TAGS: Option[] = [
  { value: "", label: "Any tag" },
  { value: "urgent", label: "Urgent" },
  { value: "long-term", label: "Long-term resident" },
  { value: "friendly", label: "Friendly" },
  { value: "indoor", label: "Indoor" },
  { value: "good with cats", label: "Good with cats" },
  { value: "good with kids", label: "Good with kids" },
  { value: "playful", label: "Playful" },
  { value: "shy", label: "Shy" },
];

const SORTS: Option[] = [
  { value: "", label: "Newest first" },
  { value: "longest", label: "Longest waiting" },
  { value: "urgent", label: "Urgent first" },
];

export default function CatFilters({
  shelters,
  locations,
}: {
  shelters: Shelter[];
  locations: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  // Keep the input in sync when filters get cleared via URL.
  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset to first page on any filter change
    router.push(`/cats?${params.toString()}`);
  }

  const locationOptions: Option[] = [
    { value: "", label: "Any location" },
    ...locations.map((l) => ({ value: l, label: l })),
  ];
  const shelterOptions: Option[] = [
    { value: "", label: "Any shelter" },
    ...shelters.map((s) => ({ value: String(s.id), label: s.name })),
  ];

  const hasFilters = [
    "gender",
    "age_category",
    "location",
    "shelter_id",
    "tag",
    "sort",
    "search",
  ].some((k) => searchParams.get(k));

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* name search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update("search", query.trim());
        }}
        className="relative"
      >
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => {
            if (query.trim() !== (searchParams.get("search") ?? "")) {
              update("search", query.trim());
            }
          }}
          placeholder="Search by name…"
          aria-label="Search cats by name"
          className="w-52 rounded-2xl border border-black/5 bg-white py-3 pl-10 pr-4 text-sm font-medium text-ink shadow-soft placeholder:text-muted focus:border-blossom focus:outline-none"
        />
      </form>

      <Dropdown
        label="Gender"
        value={searchParams.get("gender") ?? ""}
        options={GENDERS}
        onChange={(v) => update("gender", v)}
      />
      <Dropdown
        label="Age"
        value={searchParams.get("age_category") ?? ""}
        options={AGE_CATEGORIES}
        onChange={(v) => update("age_category", v)}
      />
      <Dropdown
        label="Location"
        value={searchParams.get("location") ?? ""}
        options={locationOptions}
        onChange={(v) => update("location", v)}
      />
      <Dropdown
        label="Shelter"
        value={searchParams.get("shelter_id") ?? ""}
        options={shelterOptions}
        onChange={(v) => update("shelter_id", v)}
      />
      <Dropdown
        label="Tag"
        value={searchParams.get("tag") ?? ""}
        options={TAGS}
        onChange={(v) => update("tag", v)}
      />
      <Dropdown
        label="Sort"
        value={searchParams.get("sort") ?? ""}
        options={SORTS}
        onChange={(v) => update("sort", v)}
      />
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push("/cats")}
          className="cursor-pointer self-stretch rounded-2xl px-4 text-sm font-semibold text-muted underline-offset-4 transition hover:text-ink hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
