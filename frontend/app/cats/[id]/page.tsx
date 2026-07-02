import Link from "next/link";
import { notFound } from "next/navigation";
import { getCat } from "../../api";
import type { Cat } from "../../types";
import { CatSitting } from "@/components/CatDoodle";

export const dynamic = "force-dynamic";

const TAG_STYLES = [
  "bg-butter/70 text-amber-900",
  "bg-blossom/70 text-pink-900",
  "bg-babyblue/70 text-sky-900",
  "bg-mint/70 text-emerald-900",
];

export default async function CatDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let cat: Cat | null = null;
  try {
    cat = await getCat(params.id);
  } catch {
    cat = null;
  }

  if (!cat || !cat.id) notFound();

  const meta = [
    cat.age_text && { label: "Age", value: cat.age_text },
    cat.gender && { label: "Gender", value: cat.gender },
    cat.shelter?.name && { label: "Shelter", value: cat.shelter.name },
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
        <div className="overflow-hidden rounded-4xl border border-black/5 bg-white shadow-soft">
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
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
              {cat.name}
            </h1>
            {cat.status === "reserved" && (
              <span className="rounded-full bg-blossom/60 px-3 py-1 text-xs font-semibold text-pink-800">
                reserved
              </span>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-4xl bg-white p-5 shadow-soft">
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
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    TAG_STYLES[i % TAG_STYLES.length]
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {cat.description && (
            <p className="leading-relaxed text-ink/80">{cat.description}</p>
          )}

          {cat.source_url && (
            <a
              href={cat.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block w-fit rounded-full bg-ink px-6 py-3.5 font-semibold text-white shadow-soft transition hover:bg-ink/90"
            >
              View on shelter website →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
