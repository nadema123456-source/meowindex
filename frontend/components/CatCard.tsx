import Link from "next/link";
import type { Cat } from "@/app/types";
import { displayAge } from "@/app/format";
import { CatSitting } from "./CatDoodle";
import FavoriteButton from "./FavoriteButton";
import { tagStyle } from "./tagStyle";

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
  const age = displayAge(cat.age_text);

  // Surface the important badges first: urgent, then long-term, then the rest.
  const sortedTags = [...cat.tags].sort((a, b) => {
    const rank = (t: string) =>
      /urgent/i.test(t) ? 0 : /long[- ]?term/i.test(t) ? 1 : 2;
    return rank(a) - rank(b);
  });

  return (
    <Link
      href={`/cats/${cat.id}`}
      className="group flex flex-col overflow-hidden rounded-4xl border border-black/5 bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative overflow-hidden">
        {cat.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.image_url}
            alt={cat.name}
            loading="lazy"
            className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Placeholder seed={cat.id} />
        )}
        <div className="absolute left-3 top-3">
          <FavoriteButton catId={cat.id} />
        </div>
        {cat.status === "reserved" && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-pink-700 shadow">
            reserved
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold text-ink">{cat.name}</h3>
        <p className="mt-0.5 text-sm text-muted">
          {[age, cat.gender].filter(Boolean).join(" · ")}
        </p>
        <p className="text-sm text-muted">
          {[cat.shelter?.name, cat.location].filter(Boolean).join(" · ")}
        </p>
        {sortedTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sortedTags.slice(0, 3).map((tag, i) => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tagStyle(tag, i)}`}
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
