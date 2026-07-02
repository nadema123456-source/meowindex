"use client";

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

export default function CatFilters({
  shelters,
  locations,
}: {
  shelters: Shelter[];
  locations: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const hasFilters = ["gender", "age_category", "location", "shelter_id"].some(
    (k) => searchParams.get(k),
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
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
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push("/cats")}
          className="self-stretch rounded-2xl px-4 text-sm font-semibold text-muted underline-offset-4 transition hover:text-ink hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
