/**
 * Event recovery economics — the commercial layer on top of the impact engine.
 *
 * Translates recovered tonnage into the operator's financial return
 * (cost-avoidance + recovered value), states the platform's pricing model, and
 * benchmarks this event's diversion against the industry baseline and the
 * venue's own prior match. Figures stay consistent with the verified $42,180
 * value and 87.3% diversion reported on the Impact dashboard.
 */

export interface CostLine {
  readonly label: string;
  readonly amount: number; // USD value returned to the operator
  readonly basis: string;
}

/** Value the recovery program returned to the operator, by category. */
export const COST_LINES: readonly CostLine[] = [
  { label: "Avoided landfill & hauling fees", amount: 6420, basis: "Tipping fees + diverted haul loads" },
  { label: "Recovered material & resale value", amount: 11950, basis: "Resale + reuse offsetting new stock" },
  { label: "AI-optimized logistics & labor", amount: 9380, basis: "Route consolidation, less manual sort" },
  { label: "ESG & earned-media equity", amount: 10240, basis: "Verified disclosure + sponsor brand lift" },
  { label: "Tax credits & incentives", amount: 4190, basis: "Diversion + circular-economy credits" },
];

const GROSS_VALUE = COST_LINES.reduce((s, l) => s + l.amount, 0); // $42,180

/** What the operator pays MaterialOps to run this single activation. */
const PLATFORM_FEE = 7500;

export interface RoiModel {
  readonly tonsRecovered: number;
  readonly grossValue: number;
  readonly platformFee: number;
  readonly netBenefit: number;
  readonly roiMultiple: number;
  readonly laborHoursSaved: number;
}

export const EVENT_ROI: RoiModel = {
  tonsRecovered: 18.7,
  grossValue: GROSS_VALUE,
  platformFee: PLATFORM_FEE,
  netBenefit: GROSS_VALUE - PLATFORM_FEE,
  roiMultiple: +(GROSS_VALUE / PLATFORM_FEE).toFixed(1),
  // AI-optimized logistics & labor line ÷ loaded crew rate (~$28/hr).
  laborHoursSaved: Math.round(9380 / 28),
};

export interface PricingTier {
  readonly name: string;
  readonly price: string;
  readonly unit: string;
  readonly detail: string;
  readonly recommended?: boolean;
}

/** How MaterialOps is sold — surfaced so buyers see the model immediately. */
export const PRICING_TIERS: readonly PricingTier[] = [
  {
    name: "Per Event",
    price: "$7,500",
    unit: "/ activation",
    detail: "Single match or concert. Full platform, crews, passports, and reports.",
  },
  {
    name: "Venue Annual",
    price: "$85,000",
    unit: "/ year",
    detail: "Unlimited events at one venue. Season-long trends and sponsor rollups.",
    recommended: true,
  },
  {
    name: "Recovered Value",
    price: "15%",
    unit: "of recovered value",
    detail: "Performance-based. We earn a share only of the value we return.",
  },
];

export interface DiversionBenchmark {
  readonly label: string;
  readonly diversion: number; // 0..1
  readonly note: string;
  readonly highlight?: boolean;
}

/** This event vs. the counterfactual — the proof the program works. */
export const DIVERSION_BENCHMARKS: readonly DiversionBenchmark[] = [
  { label: "Industry baseline", diversion: 0.12, note: "Typical large-venue event diversion" },
  { label: "This venue · last match", diversion: 0.58, note: "Mercedes-Benz Stadium, prior activation" },
  { label: "This event", diversion: 0.873, note: "FIFA World Cup 2026™ activation", highlight: true },
];

/** Tons kept out of landfill vs. running this event at the industry baseline. */
export const TONS_VS_BASELINE = +(
  EVENT_ROI.tonsRecovered *
  (DIVERSION_BENCHMARKS[2].diversion - DIVERSION_BENCHMARKS[0].diversion)
).toFixed(1);
