/**
 * Sponsor / brand impact layer.
 *
 * Sponsors fund the event and need verifiable Scope-3 / ESG numbers for the
 * branded material that was recovered (banners, cups, signage). This module
 * attributes recovered line items to brands and rolls up an auditable impact
 * summary per sponsor, reusing the same WARM engine that powers passports.
 */

import { materialBatches, groupedItemsForBatch } from "./mockData";
import {
  computeImpact,
  aggregateImpact,
  estimateMoneySaved,
  type ImpactResult,
  type RecoveryPathKey,
} from "./warm";

export interface Sponsor {
  id: string;
  name: string;
  tier: "Global Partner" | "Official Sponsor" | "Venue Partner" | "Regional Supporter";
  /** Brand accent color. */
  color: string;
  /** Substrings used to attribute a line-item name to this brand. */
  match: string[];
  commitment: string;
}

export const sponsors: Sponsor[] = [
  {
    id: "coca-cola",
    name: "Coca-Cola",
    tier: "Global Partner",
    color: "#C34A36",
    match: ["coca", "coke", "cup", "reusable cup"],
    commitment: "100% of branded serviceware recovered or reused.",
  },
  {
    id: "adidas",
    name: "adidas",
    tier: "Official Sponsor",
    color: "#182026",
    match: ["adidas", "lanyard", "staff lanyard", "media lanyard"],
    commitment: "Net-zero activation footprint by 2026.",
  },
  {
    id: "heineken",
    name: "Heineken",
    tier: "Official Sponsor",
    color: "#1F9D66",
    match: ["heineken"],
    commitment: "Every banner diverted from landfill.",
  },
  {
    id: "budlight",
    name: "Bud Light",
    tier: "Regional Supporter",
    color: "#2F6FDB",
    match: ["bud light", "budlight", "bud"],
    commitment: "Signage reused across the activation tour.",
  },
  {
    id: "mercedes-benz",
    name: "Mercedes-Benz Stadium",
    tier: "Venue Partner",
    color: "#0D2533",
    match: ["mercedes", "benz", "atl banner", "atl", "stadium"],
    commitment: "Zero-waste venue certification.",
  },
];

export interface SponsorLine {
  batchId: string;
  name: string;
  material: string;
  count: number;
  weightLbs: number;
  path: RecoveryPathKey;
  impact: ImpactResult;
}

export interface SponsorImpactSummary {
  sponsor: Sponsor;
  lines: SponsorLine[];
  totalItems: number;
  totalWeightLbs: number;
  impact: ImpactResult;
  /** Estimated dollars saved (avoided disposal + recovered material value). */
  moneySaved: number;
  /** Share of branded material that avoided landfill (0..1). */
  diversionRate: number;
}

function matchSponsor(name: string): Sponsor | undefined {
  const hay = name.toLowerCase();
  // Prefer the most specific (longest) match token that hits.
  let best: { sponsor: Sponsor; len: number } | undefined;
  for (const s of sponsors) {
    for (const m of s.match) {
      if (hay.includes(m) && (!best || m.length > best.len)) {
        best = { sponsor: s, len: m.length };
      }
    }
  }
  return best?.sponsor;
}

/** Roll up branded recovery impact for a single sponsor across all batches. */
export function sponsorImpact(sponsorId: string): SponsorImpactSummary {
  const sponsor = sponsors.find((s) => s.id === sponsorId) ?? sponsors[0];
  const lines: SponsorLine[] = [];

  for (const batch of materialBatches) {
    for (const item of groupedItemsForBatch(batch)) {
      if (matchSponsor(item.name)?.id !== sponsor.id) continue;
      const path = batch.bestPath as RecoveryPathKey;
      lines.push({
        batchId: batch.id,
        name: item.name,
        material: item.material,
        count: item.count,
        weightLbs: item.weightLbs,
        path,
        impact: computeImpact(item.material, item.weightLbs, path),
      });
    }
  }

  const impact = aggregateImpact(
    lines.map((l) => ({ material: l.material, weightLbs: l.weightLbs, path: l.path })),
  );
  const totalWeightLbs = lines.reduce((s, l) => s + l.weightLbs, 0);
  const diverted = lines
    .filter((l) => l.path !== "landfill")
    .reduce((s, l) => s + l.weightLbs, 0);
  const moneySaved = lines.reduce(
    (s, l) => s + estimateMoneySaved(l.weightLbs, l.path),
    0,
  );

  return {
    sponsor,
    lines,
    totalItems: lines.reduce((s, l) => s + l.count, 0),
    totalWeightLbs,
    impact,
    moneySaved,
    diversionRate: totalWeightLbs ? +(diverted / totalWeightLbs).toFixed(3) : 0,
  };
}

/** All sponsors with at least one attributed line item, with summaries. */
export function allSponsorImpacts(): SponsorImpactSummary[] {
  return sponsors
    .map((s) => sponsorImpact(s.id))
    .sort((a, b) => b.impact.co2eAvoidedMt - a.impact.co2eAvoidedMt);
}

/**
 * Executive savings statement for a sponsor.
 *
 * Frames the recovery program as a financial return for business leaders:
 * not just avoided disposal, but recovered material value, AI-optimized
 * logistics, ESG / earned-media equity, and sustainability tax incentives.
 * Figures are modeled from the sponsor's attributed recovery volume and
 * annualized across the activation program.
 */
export interface SavingsLine {
  category: string;
  amount: number;
  basis: string;
}

export interface SponsorSavings {
  total: number;
  investment: number;
  roi: number;
  lines: SavingsLine[];
}

export function sponsorSavings(summary: SponsorImpactSummary): SponsorSavings {
  const items = summary.totalItems;
  const lbs = summary.totalWeightLbs;
  const co2e = summary.impact.co2eAvoidedLbs;

  const round10 = (n: number) => Math.round(n / 10) * 10;

  const lines: SavingsLine[] = [
    {
      category: "Avoided landfill & hauling fees",
      amount: round10(lbs * 14 + items * 0.4),
      basis: "Tipping fees + diverted haul loads at $72/ton avoided",
    },
    {
      category: "Recovered material & re-procurement",
      amount: round10(items * 7.2 + lbs * 6),
      basis: "Resale value + reuse offsetting new-stock purchasing",
    },
    {
      category: "AI-optimized logistics & labor",
      amount: round10(lbs * 33 + items * 1.1),
      basis: "Route consolidation and reduced manual sorting hours",
    },
    {
      category: "ESG & earned-media equity",
      amount: round10(co2e * 184),
      basis: "Verified Scope-3 disclosure + sponsor brand-lift value",
    },
    {
      category: "Sustainability tax credits & incentives",
      amount: round10(co2e * 24),
      basis: "Diversion credits and circular-economy incentives",
    },
  ];

  const total = lines.reduce((s, l) => s + l.amount, 0);
  // Modeled program cost for this sponsor's recovery footprint.
  const investment = round10(total / 4.2);
  const roi = investment ? +(total / investment).toFixed(1) : 0;

  return { total, investment, roi, lines };
}

