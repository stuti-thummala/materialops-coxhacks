// Crowd-sourced "I spotted material here" reports for the mobile app.
// Each report is auto-classified by the on-device vision model into a
// material type, estimated weight, and recommended recovery path so dispatch
// can act on it immediately. The seed data below is demo content that mirrors
// what a real Mercedes-Benz Stadium event would generate.

import type { MaterialBatch } from "./types";

export type SpotKind =
  | "banner"
  | "cups"
  | "bottles"
  | "carpet"
  | "cardboard"
  | "lanyards"
  | "organics"
  | "other";

export type RecoveryPath =
  | "Clean & Reuse"
  | "Wash & Restock"
  | "Recycle"
  | "Compost"
  | "Sort On-Site";

export interface AiClassification {
  type: string;
  kind: SpotKind;
  estWeightLbs: number;
  path: RecoveryPath;
  confidence: number; // 0..1
  co2eLbs: number; // CO2e avoided if recovered on this path
  valueUsd: number; // recoverable resale/reuse value, USD
}

/** GPS fix attached to a field report — drives the live Street View drop. */
export interface GeoFix {
  lat: number;
  lng: number;
  /** Compass heading the reporter was facing, degrees (0 = north). */
  heading: number;
  /** Human label for the captured location. */
  label: string;
}

export interface SpotReport {
  id: string;
  kind: SpotKind;
  zoneId: string;
  zoneName: string;
  locationDetail: string;
  volume: "a few" | "a pile" | "a truckload";
  reporter: string;
  minutesAgo: number;
  status: "new" | "claimed" | "recovered";
  ai: AiClassification;
  photoTone: string; // tailwind gradient classes for the mock photo thumbnail
  /** Material passport id minted on capture. */
  passportId: string;
  /** Recovery batch id minted on capture — surfaces as a floating batch tab. */
  batchId?: string;
  /** Where the photo was taken — present for field captures, drives the map. */
  coords?: GeoFix;
  /** Captured photo as a data URL (mobile camera / file picker). */
  photoDataUrl?: string;
  /** Auto-generated disposal routing to a drop-off point. */
  disposal?: DisposalPlan;
}

/** A real-world facility a recovered material can be routed to. */
export interface DropOffPoint {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  blurb: string;
}

export interface DisposalStep {
  label: string;
  detail: string;
}

export interface DisposalPlan {
  dropOff: DropOffPoint;
  path: RecoveryPath;
  distanceMi: number;
  etaMin: number;
  steps: DisposalStep[];
}

interface KindMeta {
  type: string;
  unitLbs: number;
  path: RecoveryPath;
  baseConfidence: number;
  co2ePerLb: number;
  /** Small per-capture recoverable value, USD (not scaled by volume). */
  valueUsd: number;
  tone: string;
}

const KIND_META: Record<SpotKind, KindMeta> = {
  banner: {
    type: "Vinyl Banner",
    unitLbs: 38,
    path: "Clean & Reuse",
    baseConfidence: 0.95,
    co2ePerLb: 2.9,
    valueUsd: 4,
    tone: "from-emerald-500/70 to-teal-700/70",
  },
  cups: {
    type: "Reusable Cup",
    unitLbs: 0.3,
    path: "Wash & Restock",
    baseConfidence: 0.91,
    co2ePerLb: 1.4,
    valueUsd: 3,
    tone: "from-sky-400/70 to-blue-700/70",
  },
  bottles: {
    type: "PET Bottle",
    unitLbs: 0.05,
    path: "Recycle",
    baseConfidence: 0.88,
    co2ePerLb: 1.1,
    valueUsd: 1,
    tone: "from-cyan-400/70 to-sky-700/70",
  },
  carpet: {
    type: "Carpet Tile",
    unitLbs: 4.5,
    path: "Clean & Reuse",
    baseConfidence: 0.86,
    co2ePerLb: 1.8,
    valueUsd: 3,
    tone: "from-amber-500/70 to-orange-700/70",
  },
  cardboard: {
    type: "Cardboard",
    unitLbs: 1.2,
    path: "Recycle",
    baseConfidence: 0.93,
    co2ePerLb: 0.9,
    valueUsd: 1,
    tone: "from-yellow-600/70 to-amber-800/70",
  },
  lanyards: {
    type: "Fabric Lanyard",
    unitLbs: 0.08,
    path: "Clean & Reuse",
    baseConfidence: 0.84,
    co2ePerLb: 1.2,
    valueUsd: 1.5,
    tone: "from-fuchsia-500/70 to-purple-700/70",
  },
  organics: {
    type: "Food / Organics",
    unitLbs: 6,
    path: "Compost",
    baseConfidence: 0.79,
    co2ePerLb: 0.6,
    valueUsd: 1,
    tone: "from-lime-500/70 to-green-800/70",
  },
  other: {
    type: "Mixed Material",
    unitLbs: 2,
    path: "Sort On-Site",
    baseConfidence: 0.7,
    co2ePerLb: 0.7,
    valueUsd: 2,
    tone: "from-slate-400/70 to-slate-700/70",
  },
};

const VOLUME_UNITS: Record<SpotReport["volume"], number> = {
  "a few": 6,
  "a pile": 40,
  "a truckload": 220,
};

export const SPOT_KINDS: { kind: SpotKind; label: string }[] = [
  { kind: "banner", label: "Banners" },
  { kind: "cups", label: "Cups" },
  { kind: "bottles", label: "Bottles" },
  { kind: "carpet", label: "Carpet" },
  { kind: "cardboard", label: "Cardboard" },
  { kind: "lanyards", label: "Lanyards" },
  { kind: "organics", label: "Food" },
  { kind: "other", label: "Other" },
];

function round(n: number, dp = 0): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/**
 * Deterministic "on-device vision model" — turns a spotted material + volume
 * into a classification with estimated weight, recovery path, and CO2e impact.
 */
export function classifySpot(
  kind: SpotKind,
  volume: SpotReport["volume"],
): AiClassification {
  const meta = KIND_META[kind];
  const units = VOLUME_UNITS[volume];
  const estWeightLbs = round(meta.unitLbs * units, meta.unitLbs < 1 ? 1 : 0);
  // confidence dips slightly for larger, messier piles
  const volumePenalty = volume === "a truckload" ? 0.06 : 0;
  const confidence = round(meta.baseConfidence - volumePenalty, 2);
  return {
    type: meta.type,
    kind,
    estWeightLbs,
    path: meta.path,
    confidence,
    co2eLbs: round(estWeightLbs * meta.co2ePerLb, 1),
    valueUsd: meta.valueUsd,
  };
}

export function toneForKind(kind: SpotKind): string {
  return KIND_META[kind].tone;
}

/**
 * Representative capture photo per material kind (served from /public/props).
 * Field captures arriving over the phone→web relay only carry {kind, item}, so
 * we attach the matching material still here — the dashboard intake card then
 * shows a real photo of the recovered material instead of a flat placeholder.
 */
const PHOTO_FOR_KIND: Record<SpotKind, string> = {
  banner: "/props/banner-fifa.jpg",
  cups: "/props/cups.jpeg",
  bottles: "/props/bottles.jpeg",
  carpet: "/props/pallete.jpeg",
  cardboard: "/props/cardboard%20boxes.jpeg",
  lanyards: "/props/cups.jpeg",
  organics: "/props/compost.jpeg",
  other: "/props/cardboard%20boxes.jpeg",
};

export function captureForKind(kind: SpotKind): string {
  return PHOTO_FOR_KIND[kind];
}

let batchSeq = 500;
export function newBatchId(): string {
  batchSeq += 1;
  return `BM-${batchSeq}`;
}

let seq = 0;
export function newReportId(): string {
  seq += 1;
  return `SR-${Date.now().toString(36).toUpperCase()}-${seq}`;
}

let passportSeq = 0;
export function newPassportId(): string {
  passportSeq += 1;
  return `MP-${Date.now().toString(36).toUpperCase().slice(-4)}-${passportSeq}`;
}

/**
 * Default "current location" for the live demo — the Biltmore Innovation
 * Center in Midtown Atlanta. Used as the geolocation fallback so a photo taken
 * on stage always lands in the Street View scene in front of the venue. The
 * point is to prove the pipeline works from *any* coordinate, not a baked-in
 * zone.
 */
export const DEMO_ORIGIN: GeoFix = {
  lat: 33.78068,
  lng: -84.38786,
  heading: 295,
  label: "Biltmore Innovation Center · 817 W Peachtree St NW, Atlanta",
};

/** Real Atlanta-area recovery facilities, one preferred per recovery path. */
export const DROP_OFF_POINTS: Record<RecoveryPath, DropOffPoint> = {
  "Clean & Reuse": {
    id: "atl-graphics-reuse",
    name: "Atlanta Graphics Reuse",
    location: "Atlanta, GA",
    lat: 33.7516,
    lng: -84.3905,
    blurb: "Cleans and refurbishes banners & signage for resale.",
  },
  "Wash & Restock": {
    id: "cupcycle-atl",
    name: "CupCycle ATL",
    location: "Atlanta, GA",
    lat: 33.7702,
    lng: -84.3853,
    blurb: "Commercial wash line returns reusable cups to circulation.",
  },
  Recycle: {
    id: "pratt-recycling",
    name: "Pratt Recycling",
    location: "Atlanta, GA",
    lat: 33.7411,
    lng: -84.4123,
    blurb: "Bales cardboard, PET, and mixed recyclables for remanufacture.",
  },
  Compost: {
    id: "urban-compost",
    name: "Urban Compost",
    location: "Forest Park, GA",
    lat: 33.6221,
    lng: -84.3694,
    blurb: "Industrial composting for food and compostable fiber.",
  },
  "Sort On-Site": {
    id: "green-man-recycling",
    name: "Green Man Recycling",
    location: "Atlanta, GA",
    lat: 33.7361,
    lng: -84.4203,
    blurb: "Material recovery facility that sorts mixed loads.",
  },
};

function haversineMi(a: GeoFix, b: DropOffPoint): number {
  const R = 3958.8; // earth radius, miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

const PROCESS_VERB: Record<RecoveryPath, string> = {
  "Clean & Reuse": "Clean & refurbish for the next event",
  "Wash & Restock": "Wash and return to reusable inventory",
  Recycle: "Bale and recycle into new feedstock",
  Compost: "Process into compost",
  "Sort On-Site": "Sort the mixed load into recoverable streams",
};

/**
 * Turn a classified field report into a concrete disposal plan: which drop-off
 * point, how far, and the ordered steps a crew should take.
 */
export function planDisposal(
  ai: AiClassification,
  from: GeoFix,
  passportId: string,
): DisposalPlan {
  const dropOff = DROP_OFF_POINTS[ai.path];
  const distanceMi = round(haversineMi(from, dropOff), 1);
  // 22 mph effective city speed + 12 min stage/handling buffer.
  const etaMin = round((distanceMi / 22) * 60 + 12);
  return {
    dropOff,
    path: ai.path,
    distanceMi,
    etaMin,
    steps: [
      {
        label: "Tag & stage",
        detail: `Apply passport ${passportId} · ~${ai.estWeightLbs} lbs ${ai.type}`,
      },
      {
        label: "Crew pickup",
        detail: `Collect from ${from.label}`,
      },
      {
        label: "Haul",
        detail: `Route ${distanceMi} mi to ${dropOff.name} (${dropOff.location})`,
      },
      {
        label: "Process",
        detail: PROCESS_VERB[ai.path],
      },
    ],
  };
}

/** Build a Biltmore-origin field drop for the live demo pipeline. */
export function makeBiltmoreDrop(kind: SpotKind, itemLabel: string): SpotReport {
  const ai = classifySpot(kind, "a pile");
  const passportId = newPassportId();
  return {
    id: newReportId(),
    kind,
    zoneId: "fan-plaza",
    zoneName: DEMO_ORIGIN.label,
    locationDetail: `Recovered at the Biltmore Innovation Center — ${itemLabel}`,
    volume: "a pile",
    reporter: "Stuti Thummala",
    minutesAgo: 0,
    status: "new",
    ai,
    photoTone: toneForKind(kind),
    photoDataUrl: captureForKind(kind),
    passportId,
    batchId: newBatchId(),
    coords: DEMO_ORIGIN,
    disposal: planDisposal(ai, DEMO_ORIGIN, passportId),
  };
}

/**
 * Roll every live field capture (the Biltmore drop) up into ONE recovery batch
 * — a single passport for the whole drop, not a row per item. Item count is the
 * number of distinct materials scanned (lanyard, bottle, cup = 3), value/weight
 * are summed. Low priority + small value so it never jumps the dispatch queue.
 * Returns null when there are no field captures yet.
 */
export function buildLiveFieldBatch(
  reports: ReadonlyArray<SpotReport>,
): MaterialBatch | null {
  const drops = reports.filter((r) => r.coords);
  if (drops.length === 0) return null;

  const newest = drops[0];
  const uniqueTypes = Array.from(new Set(drops.map((r) => r.ai.type)));
  const weight = Math.round(
    drops.reduce((sum, r) => sum + (Number(r.ai.estWeightLbs) || 0), 0),
  );
  const value = Math.round(
    drops.reduce((sum, r) => sum + (Number(r.ai.valueUsd) || 0), 0),
  );

  return {
    id: newest.passportId,
    material: "Biltmore Field Recovery",
    materialType: uniqueTypes.join(", "),
    sourceZone: "fan-plaza",
    items: uniqueTypes.length,
    estimatedWeightLbs: weight,
    estimatedValueUsd: value,
    bestPath: "reuse",
    destination: "ReUse Hub ATL",
    eta: "Live · just now",
    status: "staging",
    priority: "low",
    contaminationScore: "low",
    reusePotential: "high",
    createdAt: "Just now",
  };
}

/** Total CO₂e avoided across the live field captures, rounded to 0.1 lb. */
export function liveFieldCo2eLbs(reports: ReadonlyArray<SpotReport>): number {
  const drops = reports.filter((r) => r.coords);
  return Math.round(drops.reduce((sum, r) => sum + (Number(r.ai.co2eLbs) || 0), 0) * 10) / 10;
}

/** Map a spotted material kind to the Street View sprite material string. */
export function kindToMaterial(kind: SpotKind): string {
  const map: Record<SpotKind, string> = {
    banner: "vinyl banner",
    cups: "reusable cups",
    bottles: "plastic bottle",
    carpet: "cardboard box",
    cardboard: "cardboard box",
    lanyards: "reusable",
    organics: "compost",
    other: "cardboard box",
  };
  return map[kind];
}

/** Approx real-world height (m) of a spotted pile, by volume — sprite scale. */
export function sizeForVolume(volume: SpotReport["volume"]): number {
  if (volume === "a truckload") return 3.4;
  if (volume === "a pile") return 2.6;
  return 1.8;
}

function seed(
  args: Readonly<{
    id: string;
    kind: SpotKind;
    zoneId: string;
    zoneName: string;
    locationDetail: string;
    volume: SpotReport["volume"];
    reporter: string;
    minutesAgo: number;
    status: SpotReport["status"];
  }>,
): SpotReport {
  const { kind, volume } = args;
  return {
    ...args,
    ai: classifySpot(kind, volume),
    photoTone: KIND_META[kind].tone,
    passportId: `MP-${args.id.replace("SR-DEMO-", "SEED")}`,
  };
}

// AI-generated demo reports — made-up but grounded in the event's real zones.
export const seedSpotReports: SpotReport[] = [
  seed({
    id: "SR-DEMO-1",
    kind: "banner",
    zoneId: "stadium-bowl",
    zoneName: "Stadium Bowl",
    locationDetail: "Section 122 rail — 4 sponsor banners zip-tied to the barrier",
    volume: "a few",
    reporter: "Aisha (Crew Alpha)",
    minutesAgo: 4,
    status: "new",
  }),
  seed({
    id: "SR-DEMO-2",
    kind: "cups",
    zoneId: "fan-plaza",
    zoneName: "Fan Plaza",
    locationDetail: "Pile of reusable cups by the beer garden exit gate",
    volume: "a pile",
    reporter: "Marcus (Volunteer)",
    minutesAgo: 9,
    status: "claimed",
  }),
  seed({
    id: "SR-DEMO-3",
    kind: "banner",
    zoneId: "gwcc",
    zoneName: "GWCC / Convention Campus",
    locationDetail:
      "Hall B sponsor activation — Mercedes-Benz step-and-repeat wall coming down",
    volume: "a few",
    reporter: "Priya (Event Staff)",
    minutesAgo: 13,
    status: "new",
  }),
  seed({
    id: "SR-DEMO-4",
    kind: "cardboard",
    zoneId: "parking-logistics",
    zoneName: "Parking / Logistics",
    locationDetail: "Loading dock 3 stacked with flattened vendor boxes",
    volume: "a truckload",
    reporter: "Diego (Logistics)",
    minutesAgo: 21,
    status: "new",
  }),
  seed({
    id: "SR-DEMO-5",
    kind: "carpet",
    zoneId: "home-depot-backyard",
    zoneName: "Home Depot Backyard",
    locationDetail: "VIP tent floor — modular carpet tiles being pulled up",
    volume: "a pile",
    reporter: "Sam (Crew Bravo)",
    minutesAgo: 27,
    status: "recovered",
  }),
  seed({
    id: "SR-DEMO-6",
    kind: "bottles",
    zoneId: "arena-district",
    zoneName: "State Farm Arena District",
    locationDetail: "Overflowing bottle bin near the rideshare pickup",
    volume: "a pile",
    reporter: "Fan report",
    minutesAgo: 33,
    status: "new",
  }),
  seed({
    id: "SR-DEMO-7",
    kind: "lanyards",
    zoneId: "gwcc",
    zoneName: "GWCC / Convention Campus",
    locationDetail: "Press check-in desk — bin of returned media lanyards",
    volume: "a few",
    reporter: "Lena (Press Ops)",
    minutesAgo: 44,
    status: "claimed",
  }),
];
