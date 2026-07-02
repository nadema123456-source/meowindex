import Link from "next/link";
import { getCats, getStats } from "./api";
import type { Cat, Stats } from "./types";
import { displayAge } from "./format";
import {
  CatSitting,
  CatLoaf,
  CatPeek,
  Paw,
  Heart,
} from "@/components/CatDoodle";
import CzechMap from "@/components/CzechMap";

export const dynamic = "force-dynamic";

const CAT_FACTS = [
  {
    fact: "Cats sleep 12–16 hours a day — that's about 70% of their life spent napping.",
    bg: "bg-butter",
  },
  {
    fact: "A group of cats is called a “clowder”, and a group of kittens a “kindle”.",
    bg: "bg-blossom",
  },
  {
    fact: "A cat's purr vibrates at 25–150 Hz — frequencies shown to promote healing.",
    bg: "bg-babyblue",
  },
  {
    fact: "Cats have 32 muscles in each ear and can rotate them 180 degrees.",
    bg: "bg-mint",
  },
  {
    fact: "Adult cats meow almost exclusively at humans — not at other cats.",
    bg: "bg-lilac",
  },
  {
    fact: "A cat's nose print is unique, just like a human fingerprint.",
    bg: "bg-peach",
  },
];

const HERO_TILTS = ["-rotate-6", "rotate-3", "rotate-6"];

export default async function LandingPage() {
  let stats: Stats | null = null;
  let heroCats: Cat[] = [];
  let catOfDay: Cat | null = null;

  try {
    const [s, list] = await Promise.all([
      getStats(),
      getCats({ per_page: "100" }),
    ]);
    stats = s;

    const withPhoto = list.cats.filter((c) => c.image_url);
    // Urgent cats first in the hero collage — they need the visibility most.
    const urgentFirst = [
      ...withPhoto.filter((c) => c.tags.some((t) => /urgent/i.test(t))),
      ...withPhoto.filter((c) => !c.tags.some((t) => /urgent/i.test(t))),
    ];
    heroCats = urgentFirst.slice(0, 3);

    // Cat of the day: deterministic per calendar day, needs photo + story.
    const storyCats = withPhoto.filter((c) => c.description);
    if (storyCats.length > 0) {
      const dayIndex = Math.floor(Date.now() / 86_400_000) % storyCats.length;
      catOfDay = storyCats[dayIndex];
    }
  } catch {
    stats = null;
  }

  return (
    <div className="relative mx-auto max-w-6xl">
      {/* full-bleed colorful background — fixed to the viewport so it stretches
          to any window width and stays vivid while scrolling */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blossom/50 via-butter/40 to-babyblue/50" />
        <div className="absolute left-[-10%] top-[-12%] h-[34rem] w-[34rem] rounded-full bg-blossom/80 blur-3xl" />
        <div className="absolute right-[-8%] top-[-8%] h-[30rem] w-[30rem] rounded-full bg-babyblue/80 blur-3xl" />
        <div className="absolute left-[18%] top-[28%] h-[26rem] w-[26rem] rounded-full bg-butter/80 blur-3xl" />
        <div className="absolute right-[8%] top-[42%] h-[24rem] w-[24rem] rounded-full bg-mint/70 blur-3xl" />
        <div className="absolute left-[-8%] bottom-[-14%] h-[30rem] w-[30rem] rounded-full bg-lilac/70 blur-3xl" />
        <div className="absolute right-[22%] bottom-[-10%] h-[24rem] w-[24rem] rounded-full bg-peach/70 blur-3xl" />
        <div className="absolute left-[45%] top-[5%] h-72 w-72 rounded-full bg-mint/50 blur-3xl" />
      </div>

      {/* ============ HERO ============ */}
      <section className="grid items-center gap-10 px-4 pb-16 pt-12 sm:pt-16 md:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border-[3px] border-white bg-blossom/60 px-4 py-1.5 font-display text-sm font-semibold text-ink shadow-clay-sm">
            <Paw className="h-4 w-4" fill="#403d4d" />
            Czech cat adoption, all in one place
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
            Find your{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-pink-400 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                purrfect
              </span>
              <svg
                viewBox="0 0 200 14"
                className="absolute -bottom-2 left-0 w-full"
                aria-hidden="true"
              >
                <path
                  d="M4 10 Q50 2 100 8 T196 6"
                  fill="none"
                  stroke="#fbcfe8"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            match
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-ink/70 md:mx-0">
            MeowIndex gathers adoptable cats from shelters across Czechia into
            one happy, colorful catalog — updated automatically, free to
            browse.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link
              href="/cats"
              className="cursor-pointer rounded-full border-[3px] border-white bg-gradient-to-r from-pink-300 to-amber-200 px-8 py-4 font-display text-lg font-bold text-ink shadow-clay transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-babyblue"
            >
              Browse cats →
            </Link>
          </div>

          {/* stat pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 md:justify-start">
            <StatPill
              value={stats ? stats.total_cats : "—"}
              label="cats waiting"
              className="bg-butter"
            />
            <StatPill
              value={stats ? stats.total_shelters : "—"}
              label="shelters"
              className="bg-babyblue"
            />
            <StatPill value="100%" label="free to browse" className="bg-mint" />
          </div>
        </div>

        {/* hero: real cats above the fold */}
        <div className="relative mx-auto w-full max-w-md">
          {heroCats.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 p-6">
              {heroCats.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/cats/${cat.id}`}
                  className={`group relative cursor-pointer overflow-hidden rounded-3xl border-[4px] border-white shadow-clay transition duration-200 hover:z-10 hover:scale-105 ${HERO_TILTS[i % HERO_TILTS.length]} ${i === 2 ? "col-span-2 -mt-2 h-44" : "h-44"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image_url!}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-0.5 font-display text-sm font-bold text-ink shadow">
                    {cat.name}
                  </span>
                  {cat.tags.some((t) => /urgent/i.test(t)) && (
                    <span className="absolute right-2 top-2 rounded-full bg-orange-200 px-2.5 py-0.5 text-xs font-bold text-orange-950 shadow">
                      urgent
                    </span>
                  )}
                </Link>
              ))}
              <CatPeek
                className="absolute -top-8 right-2 h-16 w-28 motion-safe:animate-float-slow"
                body="#fbcfe8"
                accent="#bfdbfe"
              />
              <Heart
                className="absolute -left-4 top-1/3 h-8 w-8 motion-safe:animate-wiggle"
                fill="#f9a8d4"
              />
              <Paw className="absolute -right-3 bottom-8 h-7 w-7 rotate-12" fill="#bfdbfe" />
            </div>
          ) : (
            /* fallback when API is unreachable: keep the illustration */
            <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-butter/70 via-blossom/70 to-babyblue/70 shadow-clay" />
              <CatSitting
                className="absolute inset-x-0 bottom-2 mx-auto h-64 w-64 motion-safe:animate-float sm:h-72 sm:w-72"
                body="#fde68a"
                accent="#fbcfe8"
              />
            </div>
          )}
        </div>
      </section>

      {/* ============ CAT OF THE DAY ============ */}
      {catOfDay && (
        <section className="px-4 pb-16">
          <div className="relative overflow-hidden rounded-5xl border-[3px] border-white bg-gradient-to-r from-butter/80 via-blossom/70 to-babyblue/70 shadow-clay">
            <div className="grid items-center gap-6 p-7 sm:grid-cols-[auto_1fr] sm:p-9">
              <Link
                href={`/cats/${catOfDay.id}`}
                className="group relative mx-auto block h-48 w-48 shrink-0 cursor-pointer overflow-hidden rounded-4xl border-[4px] border-white shadow-clay sm:h-56 sm:w-56"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={catOfDay.image_url!}
                  alt={catOfDay.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="text-center sm:text-left">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 font-display text-sm font-bold text-ink shadow-clay-sm">
                  <Heart className="h-4 w-4" fill="#f9a8d4" />
                  Cat of the day
                </span>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
                  {catOfDay.name}
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-ink/75 sm:mx-0">
                  {catOfDay.description!.split(". ")[0]}.
                  {displayAge(catOfDay.age_text) &&
                    ` ${displayAge(catOfDay.age_text)}.`}
                </p>
                <Link
                  href={`/cats/${catOfDay.id}`}
                  className="mt-5 inline-block cursor-pointer rounded-full border-[3px] border-white bg-ink px-7 py-3 font-display font-bold text-white shadow-clay transition duration-200 hover:-translate-y-0.5 hover:bg-ink/90"
                >
                  Meet {catOfDay.name} →
                </Link>
              </div>
            </div>
            <CatLoaf
              className="absolute -bottom-2 right-6 hidden h-16 w-24 sm:block"
              body="#fffdf8"
              accent="#fbcfe8"
            />
          </div>
        </section>
      )}

      {/* ============ HOW IT WORKS ============ */}
      <section className="px-4 pb-16">
        <h2 className="flex items-center justify-center gap-3 text-center font-display text-3xl font-extrabold sm:text-4xl">
          Adopting is easy
          <Paw className="h-8 w-8" fill="#f9a8d4" />
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <StepCard
            step="1"
            title="Browse"
            text="Scroll a colorful catalog of real cats from Czech shelters."
            className="bg-blossom/70"
          />
          <StepCard
            step="2"
            title="Fall in love"
            text="Filters help you find the right age, place and personality."
            className="bg-butter/70"
          />
          <StepCard
            step="3"
            title="Meet them"
            text="Every cat links straight to its shelter page — reach out and visit."
            className="bg-babyblue/70"
          />
        </div>
      </section>

      {/* ============ SHELTER MAP ============ */}
      <section className="px-4 pb-16">
        <div className="rounded-5xl border-[3px] border-white bg-white/70 p-7 shadow-clay backdrop-blur sm:p-9">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_1.2fr]">
            <div className="text-center md:text-left">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                Shelters across Czechia
              </h2>
              <p className="mt-3 text-ink/70">
                {stats
                  ? `${stats.total_shelters} shelters and counting — from Plzeň to Poděbrady.`
                  : "From Plzeň to Poděbrady and beyond."}{" "}
                New sources are added as we grow.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                {["Praha", "Plzeň", "Poděbrady", "Středočeský kraj"].map(
                  (city) => (
                    <span
                      key={city}
                      className="rounded-full bg-babyblue/50 px-3 py-1 text-sm font-semibold text-ink"
                    >
                      {city}
                    </span>
                  ),
                )}
              </div>
            </div>
            <CzechMap className="w-full" />
          </div>
        </div>
      </section>

      {/* ============ CAT FACTS ============ */}
      <section className="px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Did you know?
          </h2>
          <CatLoaf className="h-16 w-24 shrink-0" body="#bbf7d0" accent="#fbcfe8" />
        </div>
        <p className="mt-1 text-ink/60">
          A few purr-fectly true cat facts while you browse.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAT_FACTS.map((f, i) => (
            <div
              key={i}
              className={`relative rounded-4xl border-[3px] border-white p-6 shadow-clay transition duration-200 hover:-translate-y-1 ${f.bg}`}
            >
              <Paw className="h-6 w-6" fill="rgba(64,61,77,0.8)" />
              <p className="mt-3 font-medium leading-relaxed text-ink">
                {f.fact}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="px-4 pb-20">
        <div className="relative overflow-hidden rounded-5xl border-[3px] border-white bg-gradient-to-r from-blossom via-butter to-babyblue p-10 text-center shadow-clay sm:p-14">
          <CatPeek
            className="absolute -top-1 right-8 hidden h-16 w-28 sm:block"
            body="#fffdf8"
            accent="#fbcfe8"
          />
          <h2 className="font-display text-3xl font-extrabold sm:text-5xl">
            Your new best friend is waiting
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink/70">
            {stats
              ? `${stats.total_cats} cats from ${stats.total_shelters} shelters are looking for a home right now.`
              : "Cats across Czechia are looking for a home right now."}
          </p>
          <Link
            href="/cats"
            className="mt-8 inline-block cursor-pointer rounded-full border-[3px] border-white bg-ink px-10 py-4 font-display text-lg font-bold text-white shadow-clay transition duration-200 hover:-translate-y-0.5 hover:bg-ink/90 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white"
          >
            Meet the cats →
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatPill({
  value,
  label,
  className,
}: {
  value: number | string;
  label: string;
  className: string;
}) {
  return (
    <div
      className={`rounded-3xl border-[3px] border-white px-5 py-3 shadow-clay-sm ${className}`}
    >
      <span className="font-display text-2xl font-extrabold text-ink">
        {value}
      </span>
      <span className="ml-2 text-sm font-medium text-ink/70">{label}</span>
    </div>
  );
}

function StepCard({
  step,
  title,
  text,
  className,
}: {
  step: string;
  title: string;
  text: string;
  className: string;
}) {
  return (
    <div
      className={`rounded-4xl border-[3px] border-white p-6 shadow-clay transition duration-200 hover:-translate-y-1 ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-display text-lg font-extrabold text-ink shadow-clay-sm">
        {step}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink/70">{text}</p>
    </div>
  );
}
