import type { ZoneId } from "@/lib/types";

/**
 * Real-world geography for the Mercedes-Benz Stadium recovery district.
 *
 * Coordinates are actual lat/lng for the stadium and the surrounding venues
 * that make up the FIFA World Cup 2026™ Atlanta footprint. Street View camera
 * points (`sv`) drive the keyless Google Street View embed so users can walk
 * each zone; polygons approximate each venue's footprint for the satellite map.
 */
export interface SiteZone {
  id: ZoneId;
  name: string;
  short: string;
  color: string;
  /** Marker / fl-to centre. */
  lat: number;
  lng: number;
  /** Street View pano position + heading (degrees, 0 = north). */
  sv: { lat: number; lng: number; heading: number };
  /** Footprint polygon for the satellite overlay. */
  polygon: [number, number][];
  batches: number;
  items: number;
  value: number;
}

export const siteZones: SiteZone[] = [
  {
    id: "stadium-bowl",
    name: "Mercedes-Benz Stadium — Bowl",
    short: "Stadium Bowl",
    color: "#34D399",
    lat: 33.755489,
    lng: -84.400906,
    sv: { lat: 33.7547, lng: -84.4009, heading: 0 },
    polygon: [
      [33.75668, -84.40166],
      [33.75666, -84.40016],
      [33.75586, -84.39949],
      [33.75446, -84.39979],
      [33.7541, -84.40123],
      [33.75486, -84.40205],
    ],
    batches: 8,
    items: 3120,
    value: 4210,
  },
  {
    id: "gwcc",
    name: "Georgia World Congress Center",
    short: "GWCC",
    color: "#38BDF8",
    lat: 33.7589,
    lng: -84.3954,
    sv: { lat: 33.7589, lng: -84.3958, heading: 250 },
    polygon: [
      [33.7603, -84.3975],
      [33.7606, -84.3935],
      [33.7575, -84.3931],
      [33.7572, -84.3971],
    ],
    batches: 6,
    items: 1840,
    value: 5620,
  },
  {
    id: "fan-plaza",
    name: "Centennial Olympic Park — Fan Plaza",
    short: "Fan Plaza",
    color: "#2DD4BF",
    lat: 33.7605,
    lng: -84.3933,
    sv: { lat: 33.7605, lng: -84.3929, heading: 200 },
    polygon: [
      [33.7619, -84.3942],
      [33.7621, -84.3918],
      [33.7591, -84.3916],
      [33.7589, -84.394],
    ],
    batches: 4,
    items: 2120,
    value: 3380,
  },
  {
    id: "arena-district",
    name: "State Farm Arena District",
    short: "Arena District",
    color: "#22D3EE",
    lat: 33.7573,
    lng: -84.3963,
    sv: { lat: 33.7575, lng: -84.3967, heading: 120 },
    polygon: [
      [33.7584, -84.3976],
      [33.7586, -84.3951],
      [33.7561, -84.3949],
      [33.7559, -84.3974],
    ],
    batches: 5,
    items: 2560,
    value: 3180,
  },
  {
    id: "home-depot-backyard",
    name: "The Home Depot Backyard",
    short: "HD Backyard",
    color: "#4ADE80",
    lat: 33.7572,
    lng: -84.4035,
    sv: { lat: 33.7572, lng: -84.4031, heading: 110 },
    polygon: [
      [33.7585, -84.4048],
      [33.7586, -84.4022],
      [33.756, -84.402],
      [33.7559, -84.4046],
    ],
    batches: 3,
    items: 2450,
    value: 2860,
  },
  {
    id: "parking-logistics",
    name: "Northside Dr Logistics",
    short: "Logistics",
    color: "#818CF8",
    lat: 33.7541,
    lng: -84.4045,
    sv: { lat: 33.7541, lng: -84.4041, heading: 70 },
    polygon: [
      [33.7552, -84.4058],
      [33.7553, -84.4033],
      [33.753, -84.4031],
      [33.7529, -84.4056],
    ],
    batches: 6,
    items: 1640,
    value: 2980,
  },
];

/** Keyless Google Street View embed URL for a zone's camera point. */
export function streetViewUrl(z: SiteZone): string {
  const { lat, lng, heading } = z.sv;
  return `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=11,${heading},0,0,0&output=svembed`;
}
