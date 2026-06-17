export type ZoneId =
  | "stadium-bowl"
  | "gwcc"
  | "fan-plaza"
  | "arena-district"
  | "home-depot-backyard"
  | "parking-logistics";

export type BatchStatus =
  | "ready"
  | "assigned"
  | "in-transit"
  | "collected"
  | "delivered"
  | "verified"
  | "scheduled"
  | "staging";

export type RecoveryPath =
  | "reuse"
  | "recycle"
  | "upcycle"
  | "donate"
  | "compost"
  | "landfill";

export type Priority = "low" | "medium" | "high" | "critical";

export interface RecoveryZone {
  id: ZoneId;
  name: string;
  shortName: string;
  description: string;
  batchCount: number;
  itemCount: number;
  estimatedValue: number;
  color: "cyan" | "blue" | "emerald" | "teal" | "lime";
}

export interface MaterialBatch {
  id: string;
  material: string;
  materialType: string;
  sourceZone: ZoneId;
  items: number;
  estimatedWeightLbs: number;
  estimatedValueUsd: number;
  bestPath: RecoveryPath;
  destination: string;
  eta: string;
  status: BatchStatus;
  priority: Priority;
  contaminationScore: "low" | "medium" | "high";
  reusePotential: "low" | "medium" | "high";
  createdAt: string;
}

export interface Crew {
  id: string;
  name: string;
  lead: string;
  status: "available" | "assigned" | "in-progress" | "offline";
  currentZone?: ZoneId;
  capacityLbs: number;
  assignedTaskIds: string[];
}

export interface RecoveryTask {
  id: string;
  batchIds: string[];
  assignedCrewIds: string[];
  fromZone: ZoneId;
  destination: string;
  status:
    | "suggested"
    | "assigned"
    | "accepted"
    | "in-progress"
    | "picked-up"
    | "dropped-off"
    | "verified"
    | "complete";
  priority: Priority;
  estimatedPickupTime: string;
  estimatedDurationMinutes: number;
  distanceMiles: number;
  impactLbs: number;
}

export interface ScanResult {
  detectedItem: string;
  materialType: string;
  condition: "poor" | "fair" | "good" | "excellent";
  reusePotential: "low" | "medium" | "high";
  recommendedPath: RecoveryPath;
  suggestedBatchId: string;
  confidence: number;
}
