/**
 * Decorative simplified map of Czechia with shelter pins.
 * Shapes are approximate on purpose — it sells "shelters across the country",
 * it is not a GIS product.
 */

const PINS: { name: string; x: number; y: number; color: string }[] = [
  { name: "Šanta kočičí — Praha", x: 253, y: 148, color: "#f472b6" },
  { name: "Chlupaví v nouzi — Středočeský kraj", x: 280, y: 178, color: "#60a5fa" },
  { name: "Fousky z.s. — Plzeň", x: 165, y: 195, color: "#fbbf24" },
  { name: "Catky z.s. — Poděbrady", x: 318, y: 142, color: "#34d399" },
  { name: "Catky z.s. — Praha", x: 240, y: 132, color: "#a78bfa" },
  { name: "Pesweb + Lucky Cats — celá ČR", x: 380, y: 205, color: "#fb923c" },
];

export default function CzechMap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 620 340" className={className} role="img" aria-label="Map of shelters across Czechia">
      {/* Czechia silhouette (simplified) */}
      <path
        d="M56 178
           C 48 158, 66 140, 88 132
           C 100 110, 130 96, 158 100
           C 176 82, 208 74, 232 84
           C 252 70, 284 66, 306 78
           C 326 68, 356 70, 372 84
           C 396 76, 428 82, 442 98
           C 468 94, 500 104, 512 122
           C 538 126, 560 144, 558 166
           C 574 182, 572 206, 552 218
           C 548 240, 524 256, 498 252
           C 486 272, 456 282, 430 272
           C 410 288, 376 290, 354 276
           C 330 288, 298 286, 280 270
           C 252 278, 220 272, 204 254
           C 176 258, 146 248, 136 228
           C 108 226, 82 212, 78 194
           C 66 190, 58 184, 56 178 Z"
        fill="#ffffff"
        stroke="#fbcfe8"
        strokeWidth="5"
        opacity="0.95"
      />
      <path
        d="M56 178
           C 48 158, 66 140, 88 132
           C 100 110, 130 96, 158 100
           C 176 82, 208 74, 232 84
           C 252 70, 284 66, 306 78
           C 326 68, 356 70, 372 84
           C 396 76, 428 82, 442 98
           C 468 94, 500 104, 512 122
           C 538 126, 560 144, 558 166
           C 574 182, 572 206, 552 218
           C 548 240, 524 256, 498 252
           C 486 272, 456 282, 430 272
           C 410 288, 376 290, 354 276
           C 330 288, 298 286, 280 270
           C 252 278, 220 272, 204 254
           C 176 258, 146 248, 136 228
           C 108 226, 82 212, 78 194
           C 66 190, 58 184, 56 178 Z"
        fill="url(#czgrad)"
        opacity="0.35"
      />
      <defs>
        <linearGradient id="czgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="50%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
      </defs>

      {/* pins: paw-dot with a little stem */}
      {PINS.map((pin) => (
        <g key={pin.name}>
          <title>{pin.name}</title>
          <line
            x1={pin.x}
            y1={pin.y}
            x2={pin.x}
            y2={pin.y - 14}
            stroke={pin.color}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={pin.x} cy={pin.y - 20} r="9" fill={pin.color} />
          <circle cx={pin.x} cy={pin.y - 20} r="3.5" fill="#fffdf8" />
          <ellipse cx={pin.x} cy={pin.y + 2} rx="6" ry="2.5" fill="#403d4d" opacity="0.12" />
        </g>
      ))}
    </svg>
  );
}
