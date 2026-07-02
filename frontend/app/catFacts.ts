/** Pool of true cat facts — a random handful is shown on each page load. */

export const CAT_FACTS: string[] = [
  "Cats sleep 12–16 hours a day — that's about 70% of their life spent napping.",
  "A group of cats is called a “clowder”, and a group of kittens a “kindle”.",
  "A cat's purr vibrates at 25–150 Hz — frequencies shown to promote healing.",
  "Cats have 32 muscles in each ear and can rotate them 180 degrees.",
  "Adult cats meow almost exclusively at humans — not at other cats.",
  "A cat's nose print is unique, just like a human fingerprint.",
  "Cats can't taste sweetness — they're missing the receptor for it.",
  "Whiskers are roughly as wide as the cat's body — a built-in gap gauge.",
  "A cat can jump five to six times its own body length.",
  "Cats hear up to ~64 kHz — three times higher than humans.",
  "Cats spend 30–50% of their waking hours grooming themselves.",
  "A slow blink is a cat's way of saying “I trust you”. Try slow-blinking back.",
  "Cats walk like camels and giraffes: both right legs, then both left legs.",
  "The oldest known pet cat was buried with its human ~9,500 years ago in Cyprus.",
  "Cats have a third eyelid in the inner corner of each eye.",
  "Most adult cats are lactose intolerant — milk is not a treat, water is best.",
  "Cats have around 230 bones — about 24 more than humans.",
  "A cat's collarbone isn't attached to other bones — that's how they squeeze through gaps.",
  "Kittens develop their famous mid-air righting reflex by about 7 weeks old.",
  "Cats can't climb down trees headfirst — their claws all curve the same way.",
  "Cats sweat through their paw pads — tiny damp footprints on a hot vet table are real.",
  "A house cat can sprint at about 48 km/h in short bursts.",
  "Kneading (“making biscuits”) is a leftover comfort behavior from kittenhood.",
  "That chattering sound at birds? A mix of excitement and hunting frustration.",
  "A tail held straight up is a friendly greeting — often with a little hook on top.",
  "When a cat rubs its cheeks on you, it's marking you as family with scent glands.",
  "Calico and tortoiseshell cats are almost always female.",
  "Cats purr not only when happy — also to soothe themselves when stressed or healing.",
  "Indoor cats commonly live 12–18 years; many reach their twenties.",
  "Cats can make over 100 different vocal sounds — dogs manage about 10.",
];

/** Fisher–Yates shuffle → first `count` facts, fresh on every render. */
export function pickFacts(count: number): string[] {
  const pool = [...CAT_FACTS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
