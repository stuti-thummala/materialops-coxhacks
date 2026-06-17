import type { ZoneId } from "@/lib/types";
import { siteZones } from "./siteZones";

/**
 * A simulated piece of recoverable material "placed" in the real Street View
 * scene. Each anchor lives at a fixed world bearing + ground distance, so the
 * projection layer can keep it glued to its real-world spot as the camera pans
 * — the Orca-style "real panorama + simulated objects" effect.
 */
export interface TrashAnchor {
  id: string;
  label: string;
  /** Drives which sprite renders. */
  material: string;
  /** Absolute compass bearing in degrees (0 = north, clockwise). */
  bearing: number;
  /** Ground distance from the camera in metres (controls perspective scale). */
  distance: number;
  /** Approx real-world height of the object in metres (controls sprite size). */
  size: number;
  /** Detection confidence shown on the bounding box. */
  conf: number;
  /** Material batch this floating marker represents, if any. */
  batchId?: string;
  /** Inline batch details for a live field recovery (no seeded MaterialBatch). */
  fieldDetail?: {
    materialType: string;
    weightLbs: number;
    destination: string;
    path: string;
    stage: string;
    eta: string;
    origin: string;
    /** Public passport id for this live drop, if minted. */
    passportId?: string;
    /** Human label for how many distinct items were scanned (e.g. "3 items"). */
    items?: string;
    /** Recoverable resale/reuse value across the whole batch, USD. */
    valueUsd?: number;
  };
}

function headingOf(zoneId: ZoneId): number {
  return siteZones.find((z) => z.id === zoneId)?.sv.heading ?? 0;
}

/**
 * Build a cluster of anchors fanned around the zone's initial camera heading so
 * they're visible on entry but spread naturally across the ground plane.
 */
function clusterFor(
  zoneId: ZoneId,
  specs: ReadonlyArray<{
    label: string;
    material: string;
    /** Offset from the zone's initial heading, in degrees. */
    offset: number;
    distance: number;
    size: number;
    conf: number;
    /** Material batch this marker represents. */
    batchId?: string;
  }>,
): TrashAnchor[] {
  const base = headingOf(zoneId);
  return specs.map((s, i) => ({
    id: `${zoneId}-${i}`,
    label: s.label,
    material: s.material,
    bearing: (base + s.offset + 360) % 360,
    distance: s.distance,
    size: s.size,
    conf: s.conf,
    batchId: s.batchId,
  }));
}

export const trashAnchors: Record<ZoneId, TrashAnchor[]> = {
  // Stadium bowl is intentionally left clean — no simulated material here.
  "stadium-bowl": [],
  gwcc: clusterFor("gwcc", [
    { label: "Vinyl Banners", material: "vinyl banner", offset: -30, distance: 8.5, size: 3, conf: 95, batchId: "VB-104" },
    { label: "Foam-Core Signs", material: "foam sign", offset: 43, distance: 13, size: 3.2, conf: 91, batchId: "FS-058" },
  ]),
  "fan-plaza": clusterFor("fan-plaza", [
    { label: "Water Bottles", material: "plastic bottle", offset: -22, distance: 8, size: 2.4, conf: 95, batchId: "WB-210" },
    { label: "Carpet Tiles", material: "carpet tile", offset: 26, distance: 9, size: 2.8, conf: 90, batchId: "CT-033" },
  ]),
  "arena-district": clusterFor("arena-district", [
    { label: "Lanyards", material: "lanyard", offset: 0, distance: 8, size: 2.4, conf: 93, batchId: "LY-072" },
  ]),
  "home-depot-backyard": clusterFor("home-depot-backyard", [
    { label: "Reusable Cups", material: "reusable cups", offset: 0, distance: 7.5, size: 2.2, conf: 94, batchId: "CU-091" },
  ]),
  "parking-logistics": clusterFor("parking-logistics", [
    { label: "Cardboard", material: "cardboard box", offset: -28, distance: 7, size: 2.6, conf: 95 },
    { label: "LDPE Film", material: "plastic film", offset: 22, distance: 9, size: 2.8, conf: 88 },
  ]),
};
