/**
 * AI field-guide generator for the stadium walk-through.
 *
 * Produces grounded, zone-specific recovery guidance — material hotspots, what
 * to look for, safety notes, and a recommended next action — by combining the
 * pre-event forecast, the live batches in a zone, and the agent orchestration.
 * Deterministic so the same zone always narrates consistently in a demo.
 */

import type { ZoneId } from "./types";
import { materialBatches, zoneById } from "./mockData";
import { forecastEvent, DEFAULT_EVENT } from "./forecast";
import { orchestrate } from "./orchestrator";
import { computeImpact } from "./warm";

export interface FieldHotspot {
  label: string;
  /** Approx clock/landmark direction for the worker. */
  bearing: string;
  material: string;
  note: string;
}

export interface FieldGuide {
  zoneId: ZoneId;
  /** One-line situational summary, spoken-word style. */
  headline: string;
  /** 2–4 scannable guidance bullets. */
  tips: string[];
  hotspots: FieldHotspot[];
  safety: string;
  /** Recommended next action + the batch it concerns. */
  action: { text: string; batchId?: string };
  /** Predicted recoverable lbs in this zone for the event. */
  forecastLbs: number;
  /** Estimated CO2e avoided if the zone's material is recovered (lbs). */
  co2eLbs: number;
  confidence: number;
}

const BEARINGS = ["ahead", "to your left", "to your right", "behind you", "north end", "south tunnel"];

function bearingFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + (seed.codePointAt(i) ?? 0)) % 997;
  return BEARINGS[h % BEARINGS.length];
}

const ZONE_SAFETY: Record<ZoneId, string> = {
  "stadium-bowl": "Watch for wet seating rows and trip hazards on stair aisles.",
  gwcc: "Forklift traffic on the loading concourse — stay in the marked lane.",
  "fan-plaza": "High foot traffic; flag heavy banner rolls before lifting.",
  "arena-district": "Vendor pallets stacked along the curb — keep the fire lane clear.",
  "home-depot-backyard": "Uneven turf and tent stakes; two-person lift on wood.",
  "parking-logistics": "Active dock — high-vis required, spotter for reversing trucks.",
};

export function fieldGuide(zoneId: ZoneId): FieldGuide {
  const zone = zoneById[zoneId];
  const forecast = forecastEvent(DEFAULT_EVENT);
  const zf = forecast.zones.find((z) => z.zoneId === zoneId);
  const batches = materialBatches.filter((b) => b.sourceZone === zoneId);

  const hotspots: FieldHotspot[] = (zf?.materials ?? [])
    .slice(0, 3)
    .map((m) => ({
      label: m.material.split(" (")[0],
      bearing: bearingFor(zoneId + m.material),
      material: m.material,
      note: `~${m.lbs.toLocaleString()} lbs expected · route to ${m.path}`,
    }));

  const co2e = batches.reduce(
    (s, b) =>
      s +
      computeImpact(`${b.material} ${b.materialType}`, b.estimatedWeightLbs, b.bestPath)
        .co2eAvoidedLbs,
    0,
  );

  const topBatch = [...batches].sort(
    (a, b) => b.estimatedWeightLbs - a.estimatedWeightLbs,
  )[0];

  const tips: string[] = [];
  if (zf) {
    tips.push(
      `Peak generation here is at ${zf.peakWindow} — stage bins before then.`,
    );
  }
  if (topBatch) {
    const o = orchestrate(topBatch);
    tips.push(
      `${topBatch.material} (${topBatch.id}) → ${o.finalPath} at ${Math.round(
        o.finalConfidence * 100,
      )}% confidence. ${o.decisions[o.decidedBy].agentName} leads the call.`,
    );
  }
  if (hotspots[0]) {
    tips.push(
      `Start ${hotspots[0].bearing}: ${hotspots[0].label} clusters fastest.`,
    );
  }
  tips.push(
    `Keep contamination low — separate liquids before bagging to protect reuse value.`,
  );

  return {
    zoneId,
    headline: zf
      ? `${zone?.name ?? zoneId}: expect ~${zf.totalLbs.toLocaleString()} lbs recoverable, ${zf.recommendedCrews} crew${
          zf.recommendedCrews > 1 ? "s" : ""
        } recommended.`
      : `${zone?.name ?? zoneId}: ${batches.length} active batches in this zone.`,
    tips,
    hotspots,
    safety: ZONE_SAFETY[zoneId],
    action: topBatch
      ? { text: `Prioritize ${topBatch.id} — heaviest recoverable load here.`, batchId: topBatch.id }
      : { text: "Sweep the zone and group items into a new batch as you scan." },
    forecastLbs: zf?.totalLbs ?? 0,
    co2eLbs: co2e,
    confidence: zf?.confidence ?? 0.8,
  };
}
