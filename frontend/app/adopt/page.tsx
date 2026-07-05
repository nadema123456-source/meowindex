import type { Metadata } from "next";
import Link from "next/link";
import { CatLoaf, CatPeek, Heart, Paw } from "@/components/CatDoodle";

export const metadata: Metadata = {
  title: "Adopt responsibly",
  description:
    "What to think through before adopting a cat, and how to make the move as calm and stress-free for the cat as possible.",
};

const SECTIONS: {
  title: string;
  intro: string;
  points: string[];
  bg: string;
}[] = [
  {
    title: "Before you decide",
    intro: "A cat is a 15–20 year commitment, not an impulse.",
    points: [
      "Make sure the whole household agrees — including the landlord if you rent.",
      "Budget honestly: food, litter and routine vet care add up every month, and one emergency vet bill can cost thousands.",
      "Check for allergies — spend time around cats before adopting, not after.",
      "Think about your daily rhythm: who feeds, who cleans the litter box, what happens during holidays?",
      "Never gift an animal as a surprise. The adopter must choose their own cat.",
    ],
    bg: "bg-blossom/60",
  },
  {
    title: "Choosing the right cat",
    intro: "Personality fit matters far more than looks.",
    points: [
      "Adult cats are a known quantity — the shelter can tell you exactly how they behave. Kittens are adorable chaos that needs time and energy.",
      "Kittens do best in pairs — a lone kitten in an empty flat is a recipe for trouble.",
      "Quiet homes suit seniors and shy cats wonderfully; they're often the most grateful companions.",
      "Ask the shelter everything: health history, how the cat handles other animals, children, being alone.",
      "Trust the shelter's matching advice — they know their cats and want the adoption to stick.",
    ],
    bg: "bg-butter/60",
  },
  {
    title: "Prepare your home",
    intro: "Set the stage before the cat arrives, not after.",
    points: [
      "Prepare one quiet “safe room” where the cat will spend its first days — with a litter box, water, food and a hiding spot.",
      "Shopping list: litter box, scratching post, carrier, bowls, brush, toys, and the food the cat already knows from the shelter.",
      "Secure windows and balconies — tilted windows are a serious injury trap for cats.",
      "Remove toxic plants (lilies are outright deadly), lock away cleaning chemicals and medicines.",
      "If you have other pets, plan a slow, scent-first introduction — not a face-to-face meeting on day one.",
    ],
    bg: "bg-babyblue/60",
  },
  {
    title: "The first days — keep them calm",
    intro: "Moving is the most stressful event of a cat's life. Your job is patience.",
    points: [
      "Transport the cat in a closed carrier lined with a blanket that smells like its old place.",
      "Open the carrier in the safe room and… walk away. Let the cat come out on its own time.",
      "Hiding for days is completely normal. Don't drag the cat out — sit nearby, talk softly, let it choose.",
      "Keep food, litter and routine consistent with the shelter's setup for the first weeks.",
      "Introduce children calmly with clear rules: quiet voices, no chasing, no grabbing, let the cat approach first.",
      "Think in weeks, not days. A slow blink from across the room is a bigger win than a forced cuddle.",
    ],
    bg: "bg-mint/60",
  },
  {
    title: "Health from day one",
    intro: "A little admin protects the cat for years.",
    points: [
      "Ask the shelter for the vaccination record and any medical history — and register the microchip to your name.",
      "Schedule a get-to-know vet visit in the first weeks, unless the shelter advises sooner.",
      "Neutering isn't optional — shelters usually require it, and it prevents both suffering and more homeless kittens.",
      "Watch appetite, litter box habits and hiding time in the first weeks — changes are the earliest sign something's off.",
      "Consider keeping your cat indoors or building a secured balcony/catio — indoor cats live years longer.",
    ],
    bg: "bg-lilac/60",
  },
  {
    title: "Adopt, don't shop — and stay in touch",
    intro: "A good shelter is your ally for the cat's whole life.",
    points: [
      "Adoption contracts and home-check questions are a good sign — it means the shelter cares where its cats end up.",
      "The adoption fee doesn't “buy” the cat — it covers a fraction of vet costs and helps the next cat in line.",
      "If problems appear, contact the shelter first. They'd much rather help than see the cat returned or abandoned.",
      "Can't adopt right now? Shelters always welcome donations, foster homes and shares of their cats online.",
    ],
    bg: "bg-peach/60",
  },
];

export default function AdoptGuidePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <section className="relative pt-6 text-center">
        <CatPeek
          className="mx-auto h-16 w-28"
          body="#fbcfe8"
          accent="#bfdbfe"
        />
        <h1 className="mt-3 font-display text-4xl font-extrabold text-ink sm:text-5xl">
          Adopt responsibly
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink/70">
          Adoption changes two lives — yours and the cat&apos;s. These few
          rules make the change joyful instead of stressful, especially for
          the cat.
        </p>
      </section>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s, i) => (
          <section
            key={s.title}
            className={`rounded-4xl border-[3px] border-white p-7 shadow-clay ${s.bg}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-display text-base font-extrabold text-ink shadow-clay-sm">
                {i + 1}
              </span>
              <h2 className="font-display text-2xl font-extrabold text-ink">
                {s.title}
              </h2>
            </div>
            <p className="mt-2 font-medium italic text-ink/70">{s.intro}</p>
            <ul className="mt-4 space-y-2.5">
              {s.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <Paw
                    className="mt-1 h-4 w-4 shrink-0"
                    fill="rgba(64,61,77,0.7)"
                  />
                  <span className="leading-relaxed text-ink/90">{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="relative overflow-hidden rounded-5xl border-[3px] border-white bg-gradient-to-r from-blossom via-butter to-babyblue p-9 text-center shadow-clay">
        <CatLoaf
          className="absolute -bottom-1 right-6 hidden h-14 w-22 sm:block"
          body="#fffdf8"
          accent="#fbcfe8"
        />
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-6 w-6" fill="#f9a8d4" />
          <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Ready to meet your match?
          </h2>
        </div>
        <Link
          href="/cats"
          className="mt-5 inline-block cursor-pointer rounded-full border-[3px] border-white bg-ink px-8 py-3.5 font-display font-bold text-white shadow-clay transition duration-200 hover:-translate-y-0.5 hover:bg-ink/90"
        >
          Browse cats →
        </Link>
      </section>
    </div>
  );
}
