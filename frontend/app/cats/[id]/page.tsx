import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCat, getCats, getShelters } from "../../api";
import type { Cat } from "../../types";
import { displayAge, formatVerified } from "../../format";
import { CatSitting, Paw } from "@/components/CatDoodle";
import CatCard from "@/components/CatCard";
import FavoriteButton from "@/components/FavoriteButton";
import MotionCard from "@/components/MotionCard";
import ShareButton from "@/components/ShareButton";
import { tagStyle } from "@/components/tagStyle";

export const dynamic = "force-dynamic";

async function fetchCat(id: string): Promise<Cat | null> {
  try {
    const cat = await getCat(id);
    return cat && cat.id ? cat : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const cat = await fetchCat(params.id);
  if (!cat) return { title: "Cat not found" };

  const bits = [displayAge(cat.age_text), cat.gender, cat.location].filter(
    Boolean,
  );
  const description =
    cat.description ??
    `${cat.name}${bits.length ? ` (${bits.join(", ")})` : ""} is looking for a home. Found via MeowIndex, the Czech cat adoption catalog.`;

  return {
    title: `${cat.name} — cat for adoption`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${cat.name} — cat for adoption`,
      description: description.slice(0, 200),
      images: cat.image_url ? [{ url: cat.image_url }] : undefined,
    },
    twitter: {
      card: cat.image_url ? "summary_large_image" : "summary",
    },
  };
}

export default async function CatDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cat = await fetchCat(params.id);
  if (!cat) notFound();

  // "More cats from this shelter" — fetch a few siblings, excluding this cat.
  let siblings: Cat[] = [];
  let shelterName: string | undefined;
  try {
    const [list, shelters] = await Promise.all([
      getCats({ shelter_id: String(cat.shelter_id), per_page: "5" }),
      getShelters(),
    ]);
    const shelterMap = new Map(shelters.map((s) => [s.id, s]));
    shelterName = shelterMap.get(cat.shelter_id)?.name;
    siblings = list.cats
      .filter((c) => c.id !== cat.id)
      .slice(0, 4)
      .map((c) => ({ ...c, shelter: shelterMap.get(c.shelter_id) ?? null }));
    cat.shelter = cat.shelter ?? shelterMap.get(cat.shelter_id) ?? null;
  } catch {
    siblings = [];
  }

  const age = displayAge(cat.age_text);
  const verified = formatVerified(cat.scraped_at);

  const meta = [
    age && { label: "Age", value: age },
    cat.gender && { label: "Gender", value: cat.gender },
    (cat.shelter?.name ?? shelterName) && {
      label: "Shelter",
      value: cat.shelter?.name ?? shelterName!,
    },
    cat.location && { label: "Location", value: cat.location },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link
        href="/cats"
        className="text-sm font-medium text-muted transition hover:text-ink"
      >
        ← Back to catalog
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-4xl border-[3px] border-white bg-white shadow-clay">
          {cat.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cat.image_url}
              alt={cat.name}
              className="h-full max-h-[480px] w-full object-cover"
            />
          ) : (
            <div className="flex h-80 w-full items-end justify-center bg-gradient-to-br from-blossom/40 via-butter/30 to-babyblue/40">
              <CatSitting className="h-64 w-64" body="#fde68a" accent="#fbcfe8" />
            </div>
          )}
          <div className="absolute right-3 top-3">
            <FavoriteButton catId={cat.id} size="lg" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
              {cat.name}
            </h1>
            {cat.status === "reserved" && (
              <span className="rounded-full bg-blossom/60 px-3 py-1 text-xs font-semibold text-pink-800">
                reserved
              </span>
            )}
          </div>

          <dl className="grid cursor-default grid-cols-2 gap-4 rounded-4xl border-[3px] border-white bg-white p-5 shadow-clay-sm">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="text-xs font-bold uppercase tracking-wider text-muted">
                  {m.label}
                </dt>
                <dd className="mt-0.5 text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>

          {cat.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cat.tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`cursor-default rounded-full px-3 py-1 text-sm font-medium ${tagStyle(tag, i)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {cat.description && (
            <p className="leading-relaxed text-ink/80">{cat.description}</p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-3">
            {cat.source_url && (
              <a
                href={cat.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-fit cursor-pointer rounded-full border-[3px] border-white bg-ink px-6 py-3 font-display font-bold text-white shadow-clay transition duration-200 hover:-translate-y-0.5 hover:bg-ink/90"
              >
                View on shelter website →
              </a>
            )}
            <ShareButton title={`${cat.name} — cat for adoption`} />
          </div>

          {verified && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-emerald-500"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 8.2-5.2 5.2a1 1 0 0 1-1.4 0l-2.3-2.3a1 1 0 1 1 1.4-1.4l1.6 1.6 4.5-4.5a1 1 0 0 1 1.4 1.4Z"
                  clipRule="evenodd"
                />
              </svg>
              Listing verified on the shelter site: {verified}
            </p>
          )}
        </div>
      </div>

      {siblings.length > 0 && (
        <section className="mt-6">
          <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink">
            <Paw className="h-6 w-6" fill="#f9a8d4" />
            More cats from {cat.shelter?.name ?? shelterName ?? "this shelter"}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.map((c, i) => (
              <MotionCard key={c.id} index={i}>
                <CatCard cat={c} />
              </MotionCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
