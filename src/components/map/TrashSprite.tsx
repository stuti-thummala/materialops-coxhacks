import * as React from "react";

/** Transparent, stylized sprites so simulated material composites cleanly over
 * the live Street View panorama (think Orca's rendered overlays on a real
 * scene). Selected by a loose keyword match on the anchor's material. */

function CupsSprite() {
  return (
    <svg viewBox="0 0 70 60" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="cupBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfeaf2" />
          <stop offset="0.5" stopColor="#eafdff" />
          <stop offset="1" stopColor="#7fcad9" />
        </linearGradient>
      </defs>
      {[6, 26, 46].map((x) => (
        <g key={x}>
          <path d={`M${x} 12 L${x + 18} 12 L${x + 15} 56 L${x + 3} 56 Z`} fill="url(#cupBody)" stroke="#5aa9bb" strokeWidth="0.6" />
          <path d={`M${x + 0.6} 20 L${x + 17.4} 20 L${x + 17} 26 L${x + 1} 26 Z`} fill="#0e7490" opacity="0.85" />
          <ellipse cx={x + 9} cy="12" rx="9" ry="2.6" fill="#eafcff" stroke="#5aa9bb" strokeWidth="0.6" />
        </g>
      ))}
    </svg>
  );
}

function CardboardSprite() {
  return (
    <svg viewBox="0 0 120 96" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="cbFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c59b67" />
          <stop offset="1" stopColor="#a9783f" />
        </linearGradient>
        <linearGradient id="cbTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6c79a" />
          <stop offset="1" stopColor="#d2ad77" />
        </linearGradient>
        <linearGradient id="cbSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a6c39" />
          <stop offset="1" stopColor="#7e5630" />
        </linearGradient>
      </defs>
      <polygon points="24,30 60,12 116,12 84,30" fill="url(#cbTop)" stroke="#8a5e34" strokeWidth="0.6" />
      <polygon points="50,21 78,21 70,30 42,30" fill="#caa46f" opacity="0.7" />
      <polygon points="24,30 84,30 84,88 24,88" fill="url(#cbFront)" stroke="#8a5e34" strokeWidth="0.6" />
      <polygon points="84,30 116,12 116,70 84,88" fill="url(#cbSide)" stroke="#6f4d2b" strokeWidth="0.6" />
      <rect x="34" y="46" width="32" height="20" rx="1" fill="#f4efe6" stroke="#b9a888" strokeWidth="0.5" />
      <line x1="37" y1="51" x2="63" y2="51" stroke="#9aa0a6" strokeWidth="1" />
      <rect x="37" y="59" width="26" height="3.5" fill="#3b3b3b" />
    </svg>
  );
}

function BannerSprite() {
  return (
    <svg viewBox="0 0 80 120" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="banFab" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0c4a6e" />
          <stop offset="0.5" stopColor="#0e7490" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="banPole" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b7280" />
          <stop offset="0.5" stopColor="#d1d5db" />
          <stop offset="1" stopColor="#4b5563" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="4" height="112" rx="2" fill="url(#banPole)" />
      <rect x="70" y="6" width="4" height="112" rx="2" fill="url(#banPole)" />
      <rect x="6" y="6" width="68" height="4" rx="2" fill="url(#banPole)" />
      <path d="M11 12 H69 V104 Q60 99 51 104 T33 104 T15 104 Q12 104 11 102 Z" fill="url(#banFab)" />
      <rect x="15" y="22" width="50" height="11" rx="1.5" fill="#f8fafc" />
      <text x="40" y="30" textAnchor="middle" fontSize="6.2" fontWeight="900" fill="#0c4a6e">WORLD CUP 26</text>
      <circle cx="40" cy="58" r="13" fill="none" stroke="#ffffff" strokeWidth="2" />
      <text x="40" y="62" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">ATL</text>
      <text x="40" y="90" textAnchor="middle" fontSize="6.5" fontWeight="800" letterSpacing="2" fill="#e2f2f7">ATLANTA</text>
    </svg>
  );
}

function PlasticSprite() {
  return (
    <svg viewBox="0 0 64 80" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="bagG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbeafe" stopOpacity="0.85" />
          <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path d="M8 24 Q6 16 14 14 L50 14 Q58 16 56 24 L58 74 Q58 78 54 78 L10 78 Q6 78 6 74 Z" fill="url(#bagG)" stroke="#7dd3fc" strokeWidth="0.8" />
      <path d="M22 14 Q32 6 42 14" fill="none" stroke="#3E6CA8" strokeWidth="2" strokeLinecap="round" />
      <g fill="#ffffff" opacity="0.7">
        <rect x="14" y="40" width="6" height="30" rx="3" />
        <rect x="26" y="34" width="6" height="36" rx="3" />
        <rect x="38" y="42" width="6" height="28" rx="3" />
      </g>
    </svg>
  );
}

function PalletSprite() {
  return (
    <svg viewBox="0 0 120 64" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="plankG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c69654" />
          <stop offset="1" stopColor="#9a6c39" />
        </linearGradient>
        <linearGradient id="plankSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a6232" />
          <stop offset="1" stopColor="#6f4d28" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => {
        const y = 8 + i * 13;
        return (
          <g key={`plank${i}`}>
            <polygon points={`10,${y} 110,${y} 104,${y + 7} 4,${y + 7}`} fill="url(#plankG)" stroke="#6f4d28" strokeWidth="0.5" />
            <polygon points={`4,${y + 7} 104,${y + 7} 104,${y + 9} 4,${y + 9}`} fill="url(#plankSide)" />
          </g>
        );
      })}
    </svg>
  );
}

function CompostSprite() {
  return (
    <svg viewBox="0 0 64 72" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="binG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F9D66" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="8" rx="3" fill="#166534" />
      <rect x="28" y="4" width="8" height="6" rx="2" fill="#14532d" />
      <path d="M12 16 L52 16 L48 68 Q48 70 46 70 L18 70 Q16 70 16 68 Z" fill="url(#binG)" />
      <g stroke="#0f5132" strokeWidth="0.8" opacity="0.5">
        <line x1="24" y1="20" x2="23" y2="68" />
        <line x1="32" y1="20" x2="32" y2="68" />
        <line x1="40" y1="20" x2="41" y2="68" />
      </g>
      <text x="32" y="46" textAnchor="middle" fontSize="16" fill="#ffffff" opacity="0.9">♻</text>
    </svg>
  );
}

function GenericSprite() {
  return (
    <svg viewBox="0 0 80 70" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="genG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#aeb6c0" />
          <stop offset="1" stopColor="#79828e" />
        </linearGradient>
      </defs>
      <polygon points="16,18 56,8 76,16 36,28" fill="#c2cad3" stroke="#6b7280" strokeWidth="0.6" />
      <polygon points="16,18 36,28 36,64 16,54" fill="url(#genG)" stroke="#6b7280" strokeWidth="0.6" />
      <polygon points="36,28 76,16 76,52 36,64" fill="#8b94a0" stroke="#5b6470" strokeWidth="0.6" />
    </svg>
  );
}

const SPRITE_RULES: ReadonlyArray<{ test: RegExp; node: React.ReactNode }> = [
  { test: /banner|vinyl|signage|sign/i, node: <BannerSprite /> },
  { test: /cardboard|carton|box|paper/i, node: <CardboardSprite /> },
  { test: /cup|tumbler/i, node: <CupsSprite /> },
  { test: /plastic|bottle|pet|film|ldpe|can/i, node: <PlasticSprite /> },
  { test: /wood|pallet|lumber|timber|case/i, node: <PalletSprite /> },
  { test: /food|organic|compost|fiber/i, node: <CompostSprite /> },
];

function svgFor(material: string): React.ReactNode {
  return SPRITE_RULES.find((r) => r.test.test(material))?.node ?? <GenericSprite />;
}

/** Real venue photos with the background removed (transparent PNG cutouts),
 * matched loosely by material. The cutout is the primary visual; the stylized
 * SVG is only a fallback if the file is missing. */
const PHOTO_RULES: ReadonlyArray<{ test: RegExp; src: string }> = [
  { test: /banner|vinyl|signage|sign/i, src: "/props/cutouts/banner.png" },
  { test: /cardboard|carton|box|paper/i, src: "/props/cutouts/cardboard.png" },
  { test: /cup|tumbler/i, src: "/props/cutouts/cups.png" },
  { test: /bottle|pet/i, src: "/props/cutouts/bottles.png" },
  { test: /wood|pallet|lumber|timber|case/i, src: "/props/cutouts/pallet.png" },
  { test: /food|organic|compost|fiber/i, src: "/props/cutouts/compost.png" },
];

function photoFor(material: string): string | null {
  return PHOTO_RULES.find((r) => r.test.test(material))?.src ?? null;
}

/** Intrinsic width/height of each cutout so its detection box keeps the right
 * proportions when projected into the scene. */
const ASPECT_RULES: ReadonlyArray<{ test: RegExp; ratio: number }> = [
  { test: /banner|vinyl|signage|sign/i, ratio: 1448 / 907 },
  { test: /cardboard|carton|box|paper/i, ratio: 1448 / 1006 },
  { test: /cup|tumbler/i, ratio: 1448 / 887 },
  { test: /bottle|pet/i, ratio: 1431 / 961 },
  { test: /wood|pallet|lumber|timber|case/i, ratio: 1086 / 358 },
  { test: /food|organic|compost|fiber/i, ratio: 1026 / 370 },
];

/** Width-to-height ratio for a material's sprite (1 if unknown). */
export function aspectFor(material: string): number {
  return ASPECT_RULES.find((r) => r.test.test(material))?.ratio ?? 1.2;
}

/** Renders the transparent material cutout, falling back to the stylized SVG
 * sprite if the photo is unavailable. */
export function MaterialSprite({ material }: Readonly<{ material: string }>) {
  const src = photoFor(material);
  const [imgOk, setImgOk] = React.useState(true);
  if (!src || !imgOk) return <>{svgFor(material)}</>;
  return (
    <img
      src={src}
      alt={material}
      className="h-full w-full object-contain object-bottom"
      draggable={false}
      onError={() => setImgOk(false)}
    />
  );
}

