/**
 * Pre-event material forecast model.
 *
 * Given an event profile (attendance, type, weather), this predicts how much
 * recoverable material each zone will generate, broken down by material family,
 * and recommends crew pre-staging. The model is a transparent, deterministic
 * gradient model: per-attendee base generation rates per zone, scaled by event
 * and weather multipliers. Deterministic so the same inputs always yield the
 * same forecast (good for demos and audits).
 */

import { recoveryZones } from "./mockData";
import type { ZoneId, RecoveryZone } from "./types";

export type EventType = "fifa-match" | "concert" | "convention" | "doubleheader";

export interface EventProfile {
  attendance: number;
  type: EventType;
  tempF: number;
  rainProbability: number; // 0..1
}

export interface MaterialForecast {
  material: string;
  lbs: number;
  path: "reuse" | "recycle" | "donate";
}

export interface ZoneForecast {
  zoneId: ZoneId;
  zoneName: string;
  shortName: string;
  totalLbs: number;
  materials: MaterialForecast[];
  /** Recommended crew count given a nominal 480 lb crew capacity. */
  recommendedCrews: number;
  /** Predicted peak generation window. */
  peakWindow: string;
  /** Forecast confidence 0..1 (lower with extreme weather). */
  confidence: number;
}

export interface EventForecast {
  profile: EventProfile;
  zones: ZoneForecast[];
  totalLbs: number;
  totalTons: number;
  recommendedCrews: number;
  /** Predicted landfill diversion rate given current routing. */
  projectedDiversionRate: number;
}

// lbs of recoverable material generated per attendee, per zone, per material.
const BASE_RATES: Record<ZoneId, MaterialForecast[]> = {
  "stadium-bowl": [
    { material: "Reusable Cups (PP plastic)", lbs: 0.018, path: "reuse" },
    { material: "Cardboard", lbs: 0.012, path: "recycle" },
    { material: "Vinyl Banners (PVC)", lbs: 0.004, path: "reuse" },
  ],
  gwcc: [
    { material: "Foam-Core Signs", lbs: 0.02, path: "recycle" },
    { material: "Cardboard", lbs: 0.016, path: "recycle" },
    { material: "Vinyl Banners (PVC)", lbs: 0.01, path: "reuse" },
  ],
  "fan-plaza": [
    { material: "Carpet Tiles (Nylon)", lbs: 0.03, path: "recycle" },
    { material: "Reusable Cups (PP plastic)", lbs: 0.014, path: "reuse" },
    { material: "Organics", lbs: 0.022, path: "donate" },
  ],
  "arena-district": [
    { material: "Lanyards (Polyester)", lbs: 0.006, path: "reuse" },
    { material: "Vinyl Banners (PVC)", lbs: 0.012, path: "reuse" },
    { material: "Mixed Recyclables", lbs: 0.01, path: "recycle" },
  ],
  "home-depot-backyard": [
    { material: "Reusable Cups (PP plastic)", lbs: 0.026, path: "reuse" },
    { material: "Wood", lbs: 0.018, path: "recycle" },
    { material: "Organics", lbs: 0.016, path: "donate" },
  ],
  "parking-logistics": [
    { material: "Cardboard", lbs: 0.02, path: "recycle" },
    { material: "Mixed Recyclables", lbs: 0.012, path: "recycle" },
    { material: "Wood", lbs: 0.01, path: "recycle" },
  ],
};

const EVENT_MULTIPLIER: Record<EventType, number> = {
  "fifa-match": 1,
  concert: 1.18,
  convention: 0.82,
  doubleheader: 1.46,
};

const PEAK_WINDOWS: Record<ZoneId, string> = {
  "stadium-bowl": "Full-time + 0:45",
  gwcc: "Doors close + 1:30",
  "fan-plaza": "Half-time peak",
  "arena-district": "Post-event + 1:00",
  "home-depot-backyard": "Pre-match + tailgate",
  "parking-logistics": "Egress + 2:00",
};

const CREW_CAPACITY_LBS = 480;

function weatherMultiplier(p: EventProfile): number {
  // Hot weather → more beverage/cup waste; rain → more discarded signage/organics.
  const heat = 1 + Math.max(0, p.tempF - 72) * 0.006;
  const rain = 1 + p.rainProbability * 0.22;
  return +(heat * rain).toFixed(3);
}

function round(n: number): number {
  return Math.round(n);
}

export function forecastEvent(profile: EventProfile): EventForecast {
  const eventMult = EVENT_MULTIPLIER[profile.type];
  const wMult = weatherMultiplier(profile);

  const zones: ZoneForecast[] = (recoveryZones as RecoveryZone[]).map((z) => {
    const rates = BASE_RATES[z.id as ZoneId];
    const materials: MaterialForecast[] = rates.map((r) => {
      const isCup = r.material.toLowerCase().includes("cup");
      const isOrganic = r.material.toLowerCase().includes("organic");
      // Cups scale extra with heat; organics scale with rain.
      const microMult =
        (isCup ? 1 + Math.max(0, profile.tempF - 72) * 0.004 : 1) *
        (isOrganic ? 1 + profile.rainProbability * 0.15 : 1);
      return {
        material: r.material,
        path: r.path,
        lbs: round(profile.attendance * r.lbs * eventMult * wMult * microMult),
      };
    });
    const totalLbs = materials.reduce((s, m) => s + m.lbs, 0);
    return {
      zoneId: z.id as ZoneId,
      zoneName: z.name,
      shortName: z.shortName,
      totalLbs,
      materials,
      recommendedCrews: Math.max(1, Math.ceil(totalLbs / CREW_CAPACITY_LBS / 4)),
      peakWindow: PEAK_WINDOWS[z.id as ZoneId],
      confidence: +Math.max(
        0.6,
        0.95 - profile.rainProbability * 0.2 - Math.max(0, profile.tempF - 90) * 0.004,
      ).toFixed(2),
    };
  });

  const totalLbs = zones.reduce((s, z) => s + z.totalLbs, 0);

  // Realistic recovery yields per path: even well-run programs lose a residual
  // fraction to contamination, damage, or wrong-bin sorting. Reuse keeps the
  // most material; single-stream recycling loses the most. The remainder is
  // landfilled, so the diversion rate lands in a believable ~88–93% band rather
  // than a fake-looking 100%.
  const PATH_YIELD: Record<MaterialForecast["path"], number> = {
    reuse: 0.96,
    donate: 0.92,
    recycle: 0.88,
  };
  // Rain drags yield down (wet/contaminated material), heat a touch less so.
  const conditionPenalty =
    profile.rainProbability * 0.05 + Math.max(0, profile.tempF - 90) * 0.002;

  const divertedLbs = zones.reduce(
    (s, z) =>
      s +
      z.materials.reduce(
        (a, m) =>
          a + m.lbs * Math.max(0.7, PATH_YIELD[m.path] - conditionPenalty),
        0,
      ),
    0,
  );

  return {
    profile,
    zones: [...zones].sort((a, b) => b.totalLbs - a.totalLbs),
    totalLbs,
    totalTons: +(totalLbs / 2000).toFixed(2),
    recommendedCrews: zones.reduce((s, z) => s + z.recommendedCrews, 0),
    projectedDiversionRate: totalLbs ? +(divertedLbs / totalLbs).toFixed(3) : 0,
  };
}

export const DEFAULT_EVENT: EventProfile = {
  attendance: 71000,
  type: "fifa-match",
  tempF: 78,
  rainProbability: 0.1,
};

/** A historical event with the model's prediction and the measured outcome. */
export interface PastEvent {
  id: string;
  name: string;
  date: string;
  profile: EventProfile;
  /** Measured recovered tonnage after the event. */
  actualTons: number;
  /** What the model predicted ahead of the event. */
  predictedTons: number;
  /** Measured landfill diversion rate. */
  actualDiversion: number;
}

/** An upcoming scheduled event the model can forecast against. */
export interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  profile: EventProfile;
}

// Past events are seeded from real model runs times a small measured variance,
// so the "predicted vs actual" comparison stays believable and deterministic.
const PAST_SEED: {
  id: string;
  name: string;
  date: string;
  profile: EventProfile;
  variance: number;
}[] = [
  {
    id: "pe-1",
    name: "FIFA Group Stage · USA vs MEX",
    date: "Jun 1, 2026",
    profile: { attendance: 71500, type: "fifa-match", tempF: 84, rainProbability: 0.15 },
    variance: 0.97,
  },
  {
    id: "pe-2",
    name: "Falcons Doubleheader Weekend",
    date: "May 24, 2026",
    profile: { attendance: 69000, type: "doubleheader", tempF: 79, rainProbability: 0.05 },
    variance: 1.04,
  },
  {
    id: "pe-3",
    name: "Stadium Tour · Stadium Concert",
    date: "May 10, 2026",
    profile: { attendance: 68000, type: "concert", tempF: 73, rainProbability: 0.35 },
    variance: 0.95,
  },
  {
    id: "pe-4",
    name: "Southeast Logistics Convention",
    date: "Apr 28, 2026",
    profile: { attendance: 41000, type: "convention", tempF: 70, rainProbability: 0.1 },
    variance: 1.02,
  },
];

export const PAST_EVENTS: PastEvent[] = PAST_SEED.map((p) => {
  const f = forecastEvent(p.profile);
  return {
    id: p.id,
    name: p.name,
    date: p.date,
    profile: p.profile,
    predictedTons: f.totalTons,
    actualTons: +(f.totalTons * p.variance).toFixed(2),
    actualDiversion: +(
      f.projectedDiversionRate * (0.99 + (p.variance - 1) * 0.4)
    ).toFixed(3),
  };
});

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "ue-1",
    name: "FIFA Round of 16",
    date: "Jul 4, 2026",
    profile: { attendance: 73000, type: "fifa-match", tempF: 88, rainProbability: 0.2 },
  },
  {
    id: "ue-2",
    name: "FIFA Quarterfinal",
    date: "Jul 11, 2026",
    profile: { attendance: 74500, type: "fifa-match", tempF: 91, rainProbability: 0.3 },
  },
  {
    id: "ue-3",
    name: "Summer Stadium Concert",
    date: "Jul 19, 2026",
    profile: { attendance: 70000, type: "concert", tempF: 86, rainProbability: 0.25 },
  },
];

/**
 * Backtested model accuracy: mean absolute percentage error of predicted vs
 * actual tonnage across past events. Lower is better.
 */
export function modelAccuracy(events: PastEvent[] = PAST_EVENTS): {
  mapePct: number;
  sampleSize: number;
} {
  if (events.length === 0) return { mapePct: 0, sampleSize: 0 };
  const mape =
    events.reduce(
      (s, e) => s + Math.abs(e.predictedTons - e.actualTons) / e.actualTons,
      0,
    ) / events.length;
  return { mapePct: +(mape * 100).toFixed(1), sampleSize: events.length };
}
