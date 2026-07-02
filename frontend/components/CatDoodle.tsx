/**
 * Hand-drawn style cartoon cat + paw SVGs (inline, no external assets).
 * Cats are decorative — mark aria-hidden where used unless given a title.
 */

interface DoodleProps {
  className?: string;
  body?: string; // fill color of the cat
  accent?: string; // inner ears / blush
}

/** Sitting cat with a happy face and a curled tail. */
export function CatSitting({
  className = "",
  body = "#fde68a",
  accent = "#fbcfe8",
}: DoodleProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* tail */}
      <path
        d="M158 158 C192 150 196 112 176 100"
        fill="none"
        stroke={body}
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* body */}
      <ellipse cx="100" cy="146" rx="52" ry="42" fill={body} />
      {/* head */}
      <circle cx="100" cy="78" r="44" fill={body} />
      {/* ears */}
      <path d="M66 56 L56 18 L90 38 Z" fill={body} />
      <path d="M134 56 L144 18 L110 38 Z" fill={body} />
      <path d="M68 48 L63 29 L81 40 Z" fill={accent} />
      <path d="M132 48 L137 29 L119 40 Z" fill={accent} />
      {/* belly */}
      <ellipse cx="100" cy="156" rx="26" ry="22" fill="#fffdf8" opacity="0.75" />
      {/* eyes */}
      <circle cx="84" cy="74" r="6" fill="#403d4d" />
      <circle cx="116" cy="74" r="6" fill="#403d4d" />
      <circle cx="86" cy="72" r="2" fill="#fffdf8" />
      <circle cx="118" cy="72" r="2" fill="#fffdf8" />
      {/* blush */}
      <circle cx="72" cy="88" r="6" fill={accent} opacity="0.9" />
      <circle cx="128" cy="88" r="6" fill={accent} opacity="0.9" />
      {/* nose + mouth */}
      <path d="M96 86 L104 86 L100 92 Z" fill="#403d4d" />
      <path
        d="M100 92 Q100 98 92 98 M100 92 Q100 98 108 98"
        fill="none"
        stroke="#403d4d"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* whiskers */}
      <path
        d="M60 80 L38 76 M60 88 L40 90 M140 80 L162 76 M140 88 L160 90"
        stroke="#403d4d"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* front paws */}
      <ellipse cx="82" cy="184" rx="14" ry="8" fill={body} />
      <ellipse cx="118" cy="184" rx="14" ry="8" fill={body} />
    </svg>
  );
}

/** Loafing cat (bread pose), eyes closed, very content. */
export function CatLoaf({
  className = "",
  body = "#bfdbfe",
  accent = "#fbcfe8",
}: DoodleProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden="true">
      {/* tail wrapped */}
      <path
        d="M186 130 C210 126 210 100 192 96"
        fill="none"
        stroke={body}
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* body loaf */}
      <ellipse cx="118" cy="112" rx="76" ry="44" fill={body} />
      {/* head */}
      <circle cx="66" cy="74" r="38" fill={body} />
      {/* ears */}
      <path d="M38 54 L30 22 L60 38 Z" fill={body} />
      <path d="M94 54 L102 22 L72 38 Z" fill={body} />
      <path d="M41 47 L37 31 L53 40 Z" fill={accent} />
      <path d="M91 47 L95 31 L79 40 Z" fill={accent} />
      {/* sleepy eyes */}
      <path
        d="M48 72 Q54 78 60 72 M74 72 Q80 78 86 72"
        fill="none"
        stroke="#403d4d"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* blush */}
      <circle cx="42" cy="86" r="5" fill={accent} opacity="0.9" />
      <circle cx="92" cy="86" r="5" fill={accent} opacity="0.9" />
      {/* nose + mouth */}
      <path d="M63 84 L71 84 L67 90 Z" fill="#403d4d" />
      <path
        d="M67 90 Q67 95 60 95 M67 90 Q67 95 74 95"
        fill="none"
        stroke="#403d4d"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* stripes */}
      <path
        d="M130 74 Q136 86 130 96 M150 76 Q156 88 150 98 M170 82 Q176 92 170 102"
        fill="none"
        stroke="#403d4d"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  );
}

/** Cat peeking over an edge (paws + head). */
export function CatPeek({
  className = "",
  body = "#fbcfe8",
  accent = "#bfdbfe",
}: DoodleProps) {
  return (
    <svg viewBox="0 0 200 110" className={className} aria-hidden="true">
      {/* head */}
      <circle cx="100" cy="72" r="42" fill={body} />
      {/* ears */}
      <path d="M68 50 L58 14 L92 34 Z" fill={body} />
      <path d="M132 50 L142 14 L108 34 Z" fill={body} />
      <path d="M70 43 L65 25 L83 36 Z" fill={accent} />
      <path d="M130 43 L135 25 L117 36 Z" fill={accent} />
      {/* eyes looking up */}
      <circle cx="84" cy="66" r="6" fill="#403d4d" />
      <circle cx="116" cy="66" r="6" fill="#403d4d" />
      <circle cx="86" cy="64" r="2" fill="#fffdf8" />
      <circle cx="118" cy="64" r="2" fill="#fffdf8" />
      {/* nose */}
      <path d="M96 78 L104 78 L100 84 Z" fill="#403d4d" />
      {/* paws on the edge */}
      <ellipse cx="66" cy="104" rx="16" ry="9" fill={body} />
      <ellipse cx="134" cy="104" rx="16" ry="9" fill={body} />
      <path
        d="M60 104 L60 98 M66 106 L66 99 M72 104 L72 98 M128 104 L128 98 M134 106 L134 99 M140 104 L140 98"
        stroke="#403d4d"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

/** Small paw print, used as a bullet/icon. */
export function Paw({
  className = "",
  fill = "#403d4d",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <ellipse cx="12" cy="15.5" rx="5" ry="4.5" fill={fill} />
      <ellipse cx="5.5" cy="10.5" rx="2.4" ry="3" fill={fill} />
      <ellipse cx="18.5" cy="10.5" rx="2.4" ry="3" fill={fill} />
      <ellipse cx="9.2" cy="6.8" rx="2.3" ry="3" fill={fill} />
      <ellipse cx="14.8" cy="6.8" rx="2.3" ry="3" fill={fill} />
    </svg>
  );
}

/** Tiny heart. */
export function Heart({
  className = "",
  fill = "#fbcfe8",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.7-10-9.3C.5 8 2.6 4.5 6.1 4.5c2 0 3.6 1.1 4.4 2.7h3c.8-1.6 2.4-2.7 4.4-2.7 3.5 0 5.6 3.5 4.1 7.2C19.5 16.3 12 21 12 21z"
        fill={fill}
        transform="scale(0.92) translate(1,1)"
      />
    </svg>
  );
}
