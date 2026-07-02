/** Display helpers shared by catalog + detail. */

// Scraping artifacts that sometimes land in age_text (truncated units with no
// number). Hide them instead of showing a meaningless "Roky"/"Let".
const AGE_JUNK = /^(roky?|let|léta|years?|months?|měsíc(e|ů)?)$/i;

export function displayAge(ageText: string | null | undefined): string {
  const t = (ageText ?? "").trim();
  if (!t || AGE_JUNK.test(t)) return "";
  return t;
}

export function formatVerified(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
