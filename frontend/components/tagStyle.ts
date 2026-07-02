/**
 * Semantic tag colors: urgent pops in warning orange/red, long-term resident
 * in purple, everything else cycles through calm pastels.
 */

const NEUTRAL_STYLES = [
  "bg-butter/70 text-amber-900",
  "bg-babyblue/70 text-sky-900",
  "bg-mint/70 text-emerald-900",
  "bg-blossom/60 text-pink-900",
];

export function tagStyle(tag: string, index: number): string {
  const t = tag.toLowerCase();
  if (/urgent|naléhav/.test(t)) {
    return "bg-orange-200 text-orange-950 ring-2 ring-orange-300";
  }
  if (/long[- ]?term|dlouhodob/.test(t)) {
    return "bg-lilac text-purple-900";
  }
  return NEUTRAL_STYLES[index % NEUTRAL_STYLES.length];
}
