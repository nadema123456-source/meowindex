import Link from "next/link";
import type { Cat } from "@/app/types";
import { CatSitting } from "./CatDoodle";

const TAG_STYLES = [
  "bg-butter/70 text-amber-900",
  "bg-blossom/70 text-pink-900",
  "bg-babyblue/70 text-sky-900",
  "bg-mint/70 text-emerald-900",
];

const PLACEHOLDER_BODIES = ["#fde68a", "#fbcfe8", "#bfdbfe", "#bbf7d0"];

function Placeholder({ seed }: { seed: number }) {
  return (
    <div className="flex h-52 w-full items-end justify-center bg-gradient-to-br from-blossom/40 via-butter/30 to-babyblue/40">
      <CatSitting
        className="h-40 w-40"
        body={PLACEHOLDER_BODIES[seed % PLACEHOLDER_BODIES.length]}
        accent="#fffdf8"
      />
    </div>
  );
}

export default function CatCard({ cat }: { cat: Cat }) {
  return (
    <Link
      href={`/cats/${cat.id}`}
      className="group flex flex-col overflow-hidden rounded-4xl border border-black/5 bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative">
        {cat.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.image_url}
            alt={cat.name}
            className="h-52 w-full object-cover"
          />
        ) : (
          <Placeholder seed={cat.id} />
        )}
        {cat.status === "reserved" && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-pink-700 shadow">
            reserved
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-ink">{cat.name}</h3>
        <p className="mt-0.5 text-sm text-muted">
          {[cat.age_text, cat.gender].filter(Boolean).join(" · ")}
        </p>
        <p className="text-sm text-muted">
          {[cat.shelter?.name, cat.location].filter(Boolean).join(" · ")}
        </p>
        {cat.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cat.tags.slice(0, 3).map((tag, i) => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  TAG_STYLES[i % TAG_STYLES.length]
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
