/**
 * Real-world geography and sustainability facts for Mercedes-Benz Stadium and
 * its surrounding event-recovery zones in downtown Atlanta.
 *
 * Coordinates are [lng, lat] (GeoJSON order). Facts are drawn from public
 * record (Wikipedia, the stadium's published sustainability program) and are
 * used to ground the 3D Command Center visualization in real data.
 */

import type { ZoneId } from "./types";

/** Stadium center — 1 AMB Drive NW, Atlanta (33°45′20″N 84°24′00″W). */
export const STADIUM_CENTER: [number, number] = [-84.40075, 33.75541];

export interface GeoZone {
  id: ZoneId;
  /** [lng, lat] of the zone's operational centroid. */
  coord: [number, number];
  /** Recovery partner this zone routes material to (arc endpoint label). */
  partner: string;
}

/**
 * Approximate real centroids of each recovery zone in the downtown Atlanta
 * venue cluster (Vine City / Centennial Olympic Park district).
 */
export const GEO_ZONES: GeoZone[] = [
  { id: "stadium-bowl", coord: [-84.40075, 33.75541], partner: "ReUse Hub ATL" },
  { id: "gwcc", coord: [-84.3962, 33.759], partner: "ReUse Hub ATL" },
  { id: "fan-plaza", coord: [-84.3931, 33.76075], partner: "Goodr / Donation" },
  { id: "arena-district", coord: [-84.3964, 33.7573], partner: "CupCycle ATL" },
  { id: "home-depot-backyard", coord: [-84.4018, 33.7576], partner: "Compost ATL" },
  { id: "parking-logistics", coord: [-84.4014, 33.7525], partner: "Recycle MRF" },
];

export function geoZone(id: ZoneId): GeoZone {
  return GEO_ZONES.find((z) => z.id === id) ?? GEO_ZONES[0];
}

/**
 * Build a gently curved arc (quadratic bézier, bowed perpendicular to the
 * chord) between two [lng, lat] points. Returns `steps` points for a smooth
 * animated flow line. Curvature gives the converging "material flow" look.
 */
export function buildArc(
  from: [number, number],
  to: [number, number],
  steps = 48,
  bow = 0.22,
): [number, number][] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  // Perpendicular offset for the control point.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bow;
  const cy = my + dx * bow;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * x1 + 2 * u * t * cx + t * t * x2;
    const y = u * u * y1 + 2 * u * t * cy + t * t * y2;
    pts.push([x, y]);
  }
  return pts;
}

/** Linear interpolation along a polyline at fraction `t` (0..1). */
export function pointOnPath(
  path: [number, number][],
  t: number,
): [number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (path.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const a = path[i];
  const b = path[Math.min(path.length - 1, i + 1)];
  return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
}

export interface SustainabilityFact {
  label: string;
  value: string;
  detail: string;
}

/**
 * Live recovery telemetry for the command-center HUD — the operational
 * read-outs someone monitoring an active event actually needs: throughput,
 * which stations are filling, contamination, tonnage diverted, value booked,
 * and the next inbound haul. Figures are illustrative but kept internally
 * consistent with the live CO₂e panel (~10.4 t recovered, 91% diversion).
 */
export const SUSTAINABILITY_FACTS: SustainabilityFact[] = [
  {
    label: "THROUGHPUT",
    value: "612 lbs/hr",
    detail: "Recovery rate this hour — trending up as the gates clear out.",
  },
  {
    label: "STATIONS FILLING",
    value: "4 of 22",
    detail: "Bins above 80% at Gate D & Fan Plaza — nearest crews routed.",
  },
  {
    label: "CONTAMINATION",
    value: "6.2%",
    detail: "Wrong-bin rate; flagged loads auto-rerouted to the sort line.",
  },
  {
    label: "LANDFILL AVOIDED",
    value: "9.6 t",
    detail: "Tonnage kept out of landfill so far this event.",
  },
  {
    label: "VALUE RECOVERED",
    value: "$19,400",
    detail: "Resale value + diversion credits booked live.",
  },
  {
    label: "TOP STREAM",
    value: "PET · 2.8 t",
    detail: "Highest-volume material right now, ahead of aluminum (1.9 t).",
  },
  {
    label: "COMPOST",
    value: "3.1 t",
    detail: "Food + fiber routed to compost partner vs 2.4 t to recycling.",
  },
  {
    label: "NEXT HAUL",
    value: "14 min",
    detail: "Pratt Recycling truck inbound to Loading Dock 2.",
  },
];

/**
 * Mercedes-Benz Stadium sustainability program — publicly reported figures.
 * The stadium was the first professional sports venue in the U.S. to earn
 * LEED Platinum certification (2017). Surfaced in the HUD ticker.
 */
export const VENUE_SUSTAINABILITY: SustainabilityFact[] = [
  {
    label: "LEED PLATINUM",
    value: "1st in US",
    detail: "First professional sports stadium to earn LEED Platinum (2017).",
  },
  {
    label: "SOLAR ARRAY",
    value: "4,000 panels",
    detail: "On-site PV generating ~1.6M kWh/yr — enough for 9+ Falcons games.",
  },
  {
    label: "STORMWATER",
    value: "2.1M gal cistern",
    detail: "Captures runoff, easing chronic flooding in adjacent Vine City.",
  },
  {
    label: "WATER USE",
    value: "−47%",
    detail: "47% more water-efficient than a comparable baseline stadium.",
  },
  {
    label: "ZERO WASTE",
    value: "90%+ goal",
    detail: "Diversion target across recycling, compost, donation & reuse.",
  },
];

/** Venue facts surfaced in the HUD ticker. */
export const VENUE_FACTS: string[] = [
  "MERCEDES-BENZ STADIUM · 1 AMB DR NW, ATLANTA GA",
  "CAPACITY 71,000 (75,000 EXPANDABLE) · OPENED AUG 2017",
  "8-PANEL PINWHEEL RETRACTABLE ROOF · 'HALO' BOARD 58FT × 1,100FT",
  "HOST: 2026 FIFA WORLD CUP (8 MATCHES) · FALCONS (NFL) · ATLANTA UNITED (MLS)",
  "HOME DEPOT BACKYARD · 11-ACRE GREEN SPACE ON FORMER GEORGIA DOME SITE",
];
