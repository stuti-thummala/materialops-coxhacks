import type {
  RecoveryZone,
  MaterialBatch,
  Crew,
  RecoveryTask,
  ScanResult,
} from "./types";

export const recoveryZones = [
  {
    id: "stadium-bowl",
    name: "Stadium Bowl",
    shortName: "Stadium",
    description: "Primary seating and field-level event recovery zone.",
    batchCount: 8,
    itemCount: 3120,
    estimatedValue: 4210,
    color: "emerald",
  },
  {
    id: "gwcc",
    name: "GWCC / Convention Campus",
    shortName: "GWCC",
    description: "Convention campus, sponsor activations, and expo buildout.",
    batchCount: 6,
    itemCount: 1840,
    estimatedValue: 5620,
    color: "blue",
  },
  {
    id: "fan-plaza",
    name: "Centennial Olympic Park / Fan Plaza",
    shortName: "Fan Plaza",
    description: "Outdoor fan activity and temporary event infrastructure.",
    batchCount: 4,
    itemCount: 2120,
    estimatedValue: 3380,
    color: "cyan",
  },
  {
    id: "arena-district",
    name: "State Farm Arena / Arena District",
    shortName: "Arena",
    description: "Adjacent arena district with signage and vendor materials.",
    batchCount: 5,
    itemCount: 2560,
    estimatedValue: 3180,
    color: "blue",
  },
  {
    id: "home-depot-backyard",
    name: "Home Depot Backyard",
    shortName: "Backyard",
    description: "Outdoor event lawn, vendor tents, and temporary flooring.",
    batchCount: 3,
    itemCount: 2450,
    estimatedValue: 2860,
    color: "teal",
  },
  {
    id: "parking-logistics",
    name: "Parking / Logistics",
    shortName: "Logistics",
    description: "Back-of-house staging, loading, and pickup coordination.",
    batchCount: 6,
    itemCount: 1640,
    estimatedValue: 2980,
    color: "cyan",
  },
] satisfies RecoveryZone[];

export const materialBatches = [
  {
    id: "VB-104",
    material: "Vinyl Banners",
    materialType: "PVC-coated polyester",
    sourceZone: "gwcc",
    items: 78,
    estimatedWeightLbs: 640,
    estimatedValueUsd: 840,
    bestPath: "reuse",
    destination: "ReUse Hub ATL",
    eta: "Today, 2:30 PM",
    status: "ready",
    priority: "high",
    contaminationScore: "low",
    reusePotential: "high",
    createdAt: "May 12, 2025 9:41 AM",
  },
  {
    id: "CU-091",
    material: "Reusable Cups",
    materialType: "PP plastic",
    sourceZone: "home-depot-backyard",
    items: 2450,
    estimatedWeightLbs: 285,
    estimatedValueUsd: 315,
    bestPath: "reuse",
    destination: "CupCycle ATL",
    eta: "Today, 3:15 PM",
    status: "ready",
    priority: "high",
    contaminationScore: "medium",
    reusePotential: "high",
    createdAt: "May 12, 2025 9:45 AM",
  },
  {
    id: "LY-072",
    material: "Lanyards",
    materialType: "Polyester",
    sourceZone: "arena-district",
    items: 1120,
    estimatedWeightLbs: 56,
    estimatedValueUsd: 210,
    bestPath: "reuse",
    destination: "ReUse Hub ATL",
    eta: "Today, 3:20 PM",
    status: "staging",
    priority: "medium",
    contaminationScore: "low",
    reusePotential: "medium",
    createdAt: "May 12, 2025 10:02 AM",
  },
  {
    id: "FS-058",
    material: "Foam-Core Signs",
    materialType: "Foam board",
    sourceZone: "gwcc",
    items: 410,
    estimatedWeightLbs: 520,
    estimatedValueUsd: 620,
    bestPath: "recycle",
    destination: "Atlanta Recycling",
    eta: "Today, 4:00 PM",
    status: "in-transit",
    priority: "medium",
    contaminationScore: "low",
    reusePotential: "low",
    createdAt: "May 12, 2025 10:12 AM",
  },
  {
    id: "WB-210",
    material: "Water Bottles",
    materialType: "PET plastic",
    sourceZone: "fan-plaza",
    items: 1840,
    estimatedWeightLbs: 92,
    estimatedValueUsd: 165,
    bestPath: "recycle",
    destination: "Pratt Recycling",
    eta: "Today, 3:40 PM",
    status: "staging",
    priority: "medium",
    contaminationScore: "low",
    reusePotential: "medium",
    createdAt: "May 12, 2025 10:18 AM",
  },
  {
    id: "CT-033",
    material: "Carpet Tiles",
    materialType: "Nylon carpet tile",
    sourceZone: "fan-plaza",
    items: 1860,
    estimatedWeightLbs: 2480,
    estimatedValueUsd: 670,
    bestPath: "recycle",
    destination: "Interface Flooring",
    eta: "Today, 3:30 PM",
    status: "scheduled",
    priority: "high",
    contaminationScore: "low",
    reusePotential: "medium",
    createdAt: "May 12, 2025 10:20 AM",
  },
] satisfies MaterialBatch[];

export const crews = [
  {
    id: "crew-alpha",
    name: "Crew Alpha",
    lead: "John Martinez",
    status: "available",
    currentZone: "gwcc",
    capacityLbs: 460,
    assignedTaskIds: [],
  },
  {
    id: "crew-bravo",
    name: "Crew Bravo",
    lead: "Tasha Reed",
    status: "available",
    currentZone: "stadium-bowl",
    capacityLbs: 300,
    assignedTaskIds: [],
  },
  {
    id: "crew-charlie",
    name: "Crew Charlie",
    lead: "Maya Chen",
    status: "in-progress",
    currentZone: "parking-logistics",
    capacityLbs: 520,
    assignedTaskIds: ["T-24781"],
  },
] satisfies Crew[];

export const recoveryTasks = [
  {
    id: "T-24781",
    batchIds: ["VB-104"],
    assignedCrewIds: ["crew-charlie"],
    fromZone: "stadium-bowl",
    destination: "Parking / Logistics",
    status: "assigned",
    priority: "high",
    estimatedPickupTime: "Today, 2:45 PM",
    estimatedDurationMinutes: 95,
    distanceMiles: 1.2,
    impactLbs: 320,
  },
  {
    id: "T-24782",
    batchIds: ["CU-091"],
    assignedCrewIds: [],
    fromZone: "home-depot-backyard",
    destination: "CupCycle ATL",
    status: "assigned",
    priority: "medium",
    estimatedPickupTime: "Today, 3:15 PM",
    estimatedDurationMinutes: 60,
    distanceMiles: 2.1,
    impactLbs: 285,
  },
  {
    id: "T-24783",
    batchIds: ["CT-033"],
    assignedCrewIds: [],
    fromZone: "fan-plaza",
    destination: "Interface Flooring",
    status: "suggested",
    priority: "low",
    estimatedPickupTime: "Today, 3:30 PM",
    estimatedDurationMinutes: 80,
    distanceMiles: 3.4,
    impactLbs: 2480,
  },
] satisfies RecoveryTask[];

export const scanResult = {
  detectedItem: "Vinyl Banner",
  materialType: "PVC-coated polyester",
  condition: "good",
  reusePotential: "high",
  recommendedPath: "reuse",
  suggestedBatchId: "VB-104",
  confidence: 0.94,
} satisfies ScanResult;

export interface GroupedItem {
  name: string;
  sourceZone: string;
  material: string;
  count: number;
  weightLbs: number;
}

export const groupedItemsVB104: GroupedItem[] = [
  {
    name: "ATL banner",
    sourceZone: "Stadium Bowl Section 120",
    material: "Mesh Vinyl",
    count: 12,
    weightLbs: 48,
  },
  {
    name: "Heineken banner",
    sourceZone: "Concourse North Hall",
    material: "Vinyl",
    count: 28,
    weightLbs: 112,
  },
  {
    name: "Bud Light banner",
    sourceZone: "Home Depot Backyard",
    material: "Vinyl",
    count: 18,
    weightLbs: 72,
  },
  {
    name: "Mercedes-Benz Stadium banner",
    sourceZone: "State Farm Arena District",
    material: "Vinyl",
    count: 20,
    weightLbs: 88,
  },
];

/// Per-batch grouped item breakdowns. Batches without an explicit breakdown
/// fall back to a single derived row (see groupedItemsForBatch).
export const groupedItemsByBatch: Record<string, GroupedItem[]> = {
  "VB-104": groupedItemsVB104,
  "CU-091": [
    {
      name: "Stadium reusable cup",
      sourceZone: "Home Depot Backyard",
      material: "PP plastic",
      count: 1450,
      weightLbs: 168,
    },
    {
      name: "Concourse reusable cup",
      sourceZone: "Concourse Vendor Stands",
      material: "PP plastic",
      count: 1000,
      weightLbs: 117,
    },
  ],
  "LY-072": [
    {
      name: "Staff lanyard",
      sourceZone: "State Farm Arena District",
      material: "Polyester",
      count: 720,
      weightLbs: 36,
    },
    {
      name: "Media lanyard",
      sourceZone: "GWCC Press Hall",
      material: "Polyester",
      count: 400,
      weightLbs: 20,
    },
  ],
};

/// Resolve the grouped item rows for a batch, generating a single summary row
/// when no explicit breakdown exists.
export function groupedItemsForBatch(batch: MaterialBatch): GroupedItem[] {
  const explicit = groupedItemsByBatch[batch.id];
  if (explicit) return explicit;
  const zone = zoneById[batch.sourceZone];
  return [
    {
      name: batch.material,
      sourceZone: zone?.name ?? "Mercedes-Benz Stadium",
      material: batch.materialType,
      count: batch.items,
      weightLbs: batch.estimatedWeightLbs,
    },
  ];
}

export interface ImpactCategory {
  label: string;
  tons: number;
  pct: number;
  color: string;
}

export const impactCategories: ImpactCategory[] = [
  { label: "Metal", tons: 7.2, pct: 38.5, color: "#3E6CA8" },
  { label: "Cardboard", tons: 4.1, pct: 21.9, color: "#C9831A" },
  { label: "Mixed Recyclables", tons: 3.6, pct: 19.3, color: "#1F9D66" },
  { label: "Wood", tons: 2.3, pct: 12.3, color: "#9C6B3F" },
  { label: "Organics", tons: 1.1, pct: 5.9, color: "#5E8C4A" },
  { label: "Other", tons: 0.4, pct: 2.1, color: "#6F839A" },
];

export interface PartnerDestination {
  name: string;
  location: string;
  amount: string;
}

export const partnerDestinations: PartnerDestination[] = [
  { name: "Sims Metal Management", location: "Atlanta GA", amount: "7.2 t Metal" },
  { name: "Pactiv Evergreen", location: "Doraville GA", amount: "4.1 t Cardboard" },
  {
    name: "Green Man Recycling",
    location: "Atlanta GA",
    amount: "3.6 t Mixed Recyclables",
  },
  { name: "New Life Wood", location: "College Park GA", amount: "2.3 t Wood" },
  { name: "Urban Compost", location: "Forest Park GA", amount: "1.1 t Organics" },
];

export const zoneById = Object.fromEntries(
  recoveryZones.map((z) => [z.id, z]),
) as Record<string, RecoveryZone>;

export const batchById = Object.fromEntries(
  materialBatches.map((b) => [b.id, b]),
) as Record<string, MaterialBatch>;
