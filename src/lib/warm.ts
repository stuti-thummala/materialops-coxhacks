/**
 * EPA WARM-derived environmental impact engine.
 *
 * Emission factors are expressed as **metric tons of CO2-equivalent avoided per
 * short ton of material** when the material is recovered (recycled / reused /
 * source-reduced) instead of landfilled, relative to the national-average
 * landfill baseline. Values are drawn from the EPA Waste Reduction Model
 * (WARM v15) material profiles and are intentionally conservative.
 *
 * These factors let MaterialOps turn a recovered batch into an *auditable*
 * climate number instead of a hard-coded constant. Every figure on a material
 * passport traces back to a factor here plus the batch weight.
 */

export type RecoveryPathKey =
  | "reuse"
  | "recycle"
  | "upcycle"
  | "donate"
  | "compost"
  | "landfill";

export interface WarmFactor {
  /** Canonical material family key. */
  key: string;
  /** Human-readable label. */
  label: string;
  /** MTCO2e avoided per short ton recycled vs. landfill baseline. */
  recycleMtco2ePerTon: number;
  /** MTCO2e avoided per short ton reused (source reduction) — typically higher. */
  reuseMtco2ePerTon: number;
  /** Energy avoided, in million BTU (mmBTU) per short ton recycled. */
  energyMmbtuPerTon: number;
  /** Water saved, in gallons per short ton recovered. */
  waterGalPerTon: number;
  /** Landfill volume avoided, in cubic yards per short ton. */
  landfillCydPerTon: number;
}

/**
 * Material family factors. Substrings of a batch's `materialType` /
 * `material` are matched against `match` to resolve a family.
 */
interface WarmProfile extends WarmFactor {
  match: string[];
}

const PROFILES: WarmProfile[] = [
  {
    key: "pet",
    label: "PET Plastic",
    match: ["pet", "polyester", "pvc", "vinyl"],
    recycleMtco2ePerTon: 1.13,
    reuseMtco2ePerTon: 2.18,
    energyMmbtuPerTon: 23.3,
    waterGalPerTon: 8600,
    landfillCydPerTon: 3.1,
  },
  {
    key: "hdpe",
    label: "Mixed Plastic (PP/HDPE)",
    match: ["pp", "hdpe", "polypropylene", "plastic", "cup"],
    recycleMtco2ePerTon: 0.89,
    reuseMtco2ePerTon: 1.94,
    energyMmbtuPerTon: 21,
    waterGalPerTon: 6900,
    landfillCydPerTon: 3.4,
  },
  {
    key: "cardboard",
    label: "Corrugated Cardboard",
    match: ["cardboard", "corrugated", "paper", "foam board", "foam-core", "foam core"],
    recycleMtco2ePerTon: 3.14,
    reuseMtco2ePerTon: 3.89,
    energyMmbtuPerTon: 15.7,
    waterGalPerTon: 7000,
    landfillCydPerTon: 2.5,
  },
  {
    key: "aluminum",
    label: "Aluminum",
    match: ["aluminum", "metal", "steel", "can"],
    recycleMtco2ePerTon: 8.14,
    reuseMtco2ePerTon: 9.1,
    energyMmbtuPerTon: 96,
    waterGalPerTon: 14000,
    landfillCydPerTon: 1.9,
  },
  {
    key: "wood",
    label: "Dimensional Wood",
    match: ["wood", "lumber", "pallet"],
    recycleMtco2ePerTon: 0.84,
    reuseMtco2ePerTon: 2.46,
    energyMmbtuPerTon: 8.4,
    waterGalPerTon: 1200,
    landfillCydPerTon: 2.8,
  },
  {
    key: "carpet",
    label: "Nylon Carpet / Textile",
    match: ["carpet", "nylon", "textile", "fabric", "lanyard"],
    recycleMtco2ePerTon: 1.71,
    reuseMtco2ePerTon: 3.02,
    energyMmbtuPerTon: 28.4,
    waterGalPerTon: 9100,
    landfillCydPerTon: 3,
  },
  {
    key: "organics",
    label: "Organics / Compostable",
    match: ["organic", "compost", "food", "bio"],
    recycleMtco2ePerTon: 0.42,
    reuseMtco2ePerTon: 0.42,
    energyMmbtuPerTon: 1.1,
    waterGalPerTon: 400,
    landfillCydPerTon: 2.2,
  },
];

const DEFAULT_PROFILE: WarmProfile = {
  key: "mixed",
  label: "Mixed Recyclables",
  match: [],
  recycleMtco2ePerTon: 1.02,
  reuseMtco2ePerTon: 1.85,
  energyMmbtuPerTon: 12,
  waterGalPerTon: 4200,
  landfillCydPerTon: 2.6,
};

const LBS_PER_SHORT_TON = 2000;

/** Resolves the WARM material profile for a free-text material descriptor. */
export function resolveWarmProfile(materialDescriptor: string): WarmFactor {
  const hay = materialDescriptor.toLowerCase();
  const hit = PROFILES.find((p) => p.match.some((m) => hay.includes(m)));
  const { match, ...factor } = hit ?? DEFAULT_PROFILE;
  return factor;
}

export interface ImpactResult {
  profile: WarmFactor;
  path: RecoveryPathKey;
  tons: number;
  /** Metric tons CO2e avoided. */
  co2eAvoidedMt: number;
  /** Equivalent lbs CO2e avoided (for compact UI). */
  co2eAvoidedLbs: number;
  energyMmbtu: number;
  waterGal: number;
  landfillCyd: number;
  /** Derived consumer-friendly equivalencies. */
  equivalents: {
    /** Passenger-vehicle miles not driven (EPA: 8.89 kg CO2/gal, 22.2 mpg). */
    carMiles: number;
    /** Smartphones charged equivalent. */
    phonesCharged: number;
    /** Tree-seedlings grown 10 years equivalent. */
    treeSeedlings: number;
    /** Homes' electricity for one day. */
    homeDays: number;
  };
}

/**
 * Computes the full environmental impact of recovering a quantity of a
 * material via a given path, using WARM factors.
 */
export function computeImpact(
  materialDescriptor: string,
  weightLbs: number,
  path: RecoveryPathKey,
): ImpactResult {
  const profile = resolveWarmProfile(materialDescriptor);
  const tons = weightLbs / LBS_PER_SHORT_TON;

  // Reuse / donation behave as source reduction (higher avoidance).
  const sourceReduction = path === "reuse" || path === "donate" || path === "upcycle";
  let factor: number;
  if (sourceReduction) factor = profile.reuseMtco2ePerTon;
  else if (path === "landfill") factor = 0;
  else factor = profile.recycleMtco2ePerTon;

  const co2eAvoidedMt = +(tons * factor).toFixed(3);
  const co2eAvoidedKg = co2eAvoidedMt * 1000;

  return {
    profile,
    path,
    tons: +tons.toFixed(3),
    co2eAvoidedMt,
    co2eAvoidedLbs: Math.round(co2eAvoidedKg * 2.20462),
    energyMmbtu: +(tons * profile.energyMmbtuPerTon).toFixed(2),
    waterGal: Math.round(tons * profile.waterGalPerTon),
    landfillCyd: +(tons * profile.landfillCydPerTon).toFixed(2),
    equivalents: {
      carMiles: Math.round(co2eAvoidedKg / 0.4),
      phonesCharged: Math.round(co2eAvoidedKg / 0.00822),
      treeSeedlings: +(co2eAvoidedKg / 60).toFixed(1),
      homeDays: +(co2eAvoidedKg / 12.7).toFixed(1),
    },
  };
}

/** Sums impact across many { material, weightLbs, path } line items. */
export function aggregateImpact(
  lines: { material: string; weightLbs: number; path: RecoveryPathKey }[],
): ImpactResult {
  const base = computeImpact("mixed", 0, "recycle");
  return lines.reduce<ImpactResult>((acc, l) => {
    const r = computeImpact(l.material, l.weightLbs, l.path);
    return {
      ...acc,
      tons: +(acc.tons + r.tons).toFixed(3),
      co2eAvoidedMt: +(acc.co2eAvoidedMt + r.co2eAvoidedMt).toFixed(3),
      co2eAvoidedLbs: acc.co2eAvoidedLbs + r.co2eAvoidedLbs,
      energyMmbtu: +(acc.energyMmbtu + r.energyMmbtu).toFixed(2),
      waterGal: acc.waterGal + r.waterGal,
      landfillCyd: +(acc.landfillCyd + r.landfillCyd).toFixed(2),
      equivalents: {
        carMiles: acc.equivalents.carMiles + r.equivalents.carMiles,
        phonesCharged: acc.equivalents.phonesCharged + r.equivalents.phonesCharged,
        treeSeedlings: +(acc.equivalents.treeSeedlings + r.equivalents.treeSeedlings).toFixed(1),
        homeDays: +(acc.equivalents.homeDays + r.equivalents.homeDays).toFixed(1),
      },
    };
  }, base);
}

/**
 * Estimated dollars saved by recovering material instead of landfilling it.
 *
 * Combines two avoided costs:
 *  1. Avoided landfill disposal — national-average tipping fee per short ton,
 *     incurred only when material would otherwise have been landfilled.
 *  2. Recovered material value — commodity resale (recycle/compost) or avoided
 *     re-procurement (reuse/donate/upcycle), per short ton by path.
 *
 * Intentionally conservative so the figure is defensible in a sponsor report.
 */
const LANDFILL_TIPPING_FEE_PER_TON = 55; // USD, US national average

const RECOVERED_VALUE_PER_TON: Record<RecoveryPathKey, number> = {
  reuse: 420,
  donate: 360,
  upcycle: 300,
  recycle: 110,
  compost: 35,
  landfill: 0,
};

export function estimateMoneySaved(
  weightLbs: number,
  path: RecoveryPathKey,
): number {
  const tons = weightLbs / LBS_PER_SHORT_TON;
  const disposalAvoided = path === "landfill" ? 0 : tons * LANDFILL_TIPPING_FEE_PER_TON;
  const recoveredValue = tons * (RECOVERED_VALUE_PER_TON[path] ?? 0);
  return Math.round(disposalAvoided + recoveredValue);
}
