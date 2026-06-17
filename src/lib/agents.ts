import type { MaterialBatch, RecoveryPath } from "./types";
import { batchById, zoneById, recoveryTasks } from "./mockData";

/**
 * Shared decision schema used by every MaterialOps agent.
 *
 * Each agent inspects a {@link MaterialBatch} and returns a structured
 * {@link AgentDecision}. Decisions are deterministic and derived purely from
 * batch + zone + task data so they can be rendered in the UI, serialized to
 * JSON, or fed into a downstream planner without side effects.
 */
export type AgentId =
  | "material"
  | "reuse"
  | "repair"
  | "logistics"
  | "donation";

export type RecommendationPriority = "low" | "medium" | "high";

export interface AgentSignal {
  /** Short label for the signal that informed the decision. */
  label: string;
  /** Human-readable value or observation. */
  value: string;
}

export interface AgentRecommendation {
  /** Actionable recommendation text. */
  action: string;
  /** Relative urgency of the recommendation. */
  priority: RecommendationPriority;
  /** Optional rationale explaining why this was recommended. */
  rationale?: string;
}

export interface AgentDecision {
  agentId: AgentId;
  agentName: string;
  batchId: string;
  /** One-line summary of the agent's assessment. */
  summary: string;
  /** Recovery path the agent endorses for this batch. */
  suggestedPath: RecoveryPath;
  /** Confidence in the suggested path, 0..1. */
  confidence: number;
  /** Observations that drove the decision. */
  signals: AgentSignal[];
  /** Concrete next actions. */
  recommendations: AgentRecommendation[];
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function reuseScore(batch: MaterialBatch): number {
  const potential = { low: 0.3, medium: 0.6, high: 0.9 }[batch.reusePotential];
  const contamination = { low: 0, medium: 0.15, high: 0.35 }[
    batch.contaminationScore
  ];
  return clampConfidence(potential - contamination);
}

/** Classifies the material and proposes the primary recovery path. */
export function materialAgent(batch: MaterialBatch): AgentDecision {
  const score = reuseScore(batch);
  return {
    agentId: "material",
    agentName: "Material Agent",
    batchId: batch.id,
    summary: `${batch.material} identified as ${batch.materialType}; best path is ${batch.bestPath}.`,
    suggestedPath: batch.bestPath,
    confidence: clampConfidence(0.6 + score * 0.35),
    signals: [
      { label: "Material type", value: batch.materialType },
      { label: "Contamination", value: batch.contaminationScore },
      { label: "Reuse potential", value: batch.reusePotential },
    ],
    recommendations: [
      {
        action: `Route batch ${batch.id} toward ${batch.bestPath}.`,
        priority: batch.priority === "critical" ? "high" : "medium",
        rationale: `Material profile and condition favor ${batch.bestPath}.`,
      },
    ],
  };
}

/** Evaluates direct reuse opportunities. */
export function reuseAgent(batch: MaterialBatch): AgentDecision {
  const score = reuseScore(batch);
  const viable = score >= 0.55;
  return {
    agentId: "reuse",
    agentName: "Reuse Agent",
    batchId: batch.id,
    summary: viable
      ? `High reuse value — keep ${batch.material} intact for redeployment.`
      : `Limited direct reuse; consider recycling or repair first.`,
    suggestedPath: viable ? "reuse" : batch.bestPath,
    confidence: score,
    signals: [
      { label: "Reuse potential", value: batch.reusePotential },
      { label: "Contamination", value: batch.contaminationScore },
      { label: "Items", value: `${batch.items}` },
    ],
    recommendations: viable
      ? [
          {
            action: `Stage ${batch.items} units for reuse at ${batch.destination}.`,
            priority: "high",
            rationale: "Reuse avoids reprocessing energy and preserves value.",
          },
        ]
      : [
          {
            action: "Run contamination check before committing to reuse.",
            priority: "medium",
            rationale: `Contamination is ${batch.contaminationScore}.`,
          },
        ],
  };
}

/** Assesses whether repair/refurbishment unlocks reuse. */
export function repairAgent(batch: MaterialBatch): AgentDecision {
  const repairable =
    batch.reusePotential === "medium" && batch.contaminationScore !== "high";
  return {
    agentId: "repair",
    agentName: "Repair Agent",
    batchId: batch.id,
    summary: repairable
      ? `Light refurbishment could lift ${batch.material} into the reuse stream.`
      : `No repair pathway adds value for ${batch.material}.`,
    suggestedPath: repairable ? "reuse" : batch.bestPath,
    confidence: repairable ? 0.62 : 0.4,
    signals: [
      { label: "Reuse potential", value: batch.reusePotential },
      { label: "Contamination", value: batch.contaminationScore },
    ],
    recommendations: repairable
      ? [
          {
            action: "Flag batch for the refurbishment bench before dispatch.",
            priority: "medium",
            rationale: "Medium reuse potential often improves after cleaning.",
          },
        ]
      : [
          {
            action: "Skip repair; proceed with the recommended path.",
            priority: "low",
          },
        ],
  };
}

/** Plans the logistics for moving the batch. */
export function logisticsAgent(batch: MaterialBatch): AgentDecision {
  const task = recoveryTasks.find((t) => t.batchIds.includes(batch.id));
  const zone = zoneById[batch.sourceZone];
  const unassigned = !task || task.assignedCrewIds.length === 0;
  return {
    agentId: "logistics",
    agentName: "Logistics Agent",
    batchId: batch.id,
    summary: unassigned
      ? `Batch ${batch.id} needs a crew assigned for pickup from ${zone?.shortName ?? batch.sourceZone}.`
      : `Pickup scheduled — ${task?.distanceMiles} mi to ${batch.destination}.`,
    suggestedPath: batch.bestPath,
    confidence: unassigned ? 0.55 : 0.85,
    signals: [
      { label: "Source zone", value: zone?.name ?? batch.sourceZone },
      { label: "Destination", value: batch.destination },
      { label: "ETA", value: batch.eta },
      ...(task
        ? [{ label: "Distance", value: `${task.distanceMiles} mi` }]
        : []),
    ],
    recommendations: unassigned
      ? [
          {
            action: `Assign an available crew to batch ${batch.id}.`,
            priority: batch.priority === "high" ? "high" : "medium",
            rationale: "No crew is currently dispatched for this batch.",
          },
        ]
      : [
          {
            action: `Confirm drop-off window at ${batch.destination}.`,
            priority: "low",
          },
        ],
  };
}

/** Identifies donation opportunities for reusable material. */
export function donationAgent(batch: MaterialBatch): AgentDecision {
  const donatable =
    batch.reusePotential === "high" && batch.contaminationScore === "low";
  return {
    agentId: "donation",
    agentName: "Donation Agent",
    batchId: batch.id,
    summary: donatable
      ? `${batch.material} qualifies for community donation.`
      : `Donation not recommended for ${batch.material} right now.`,
    suggestedPath: donatable ? "donate" : batch.bestPath,
    confidence: donatable ? 0.7 : 0.45,
    signals: [
      { label: "Reuse potential", value: batch.reusePotential },
      { label: "Contamination", value: batch.contaminationScore },
      { label: "Est. value", value: `$${batch.estimatedValueUsd}` },
    ],
    recommendations: donatable
      ? [
          {
            action: "Offer batch to vetted donation partners before recycling.",
            priority: "medium",
            rationale: "Clean, high-reuse material maximizes community impact.",
          },
        ]
      : [
          {
            action: "Defer donation until reuse and contamination clear.",
            priority: "low",
          },
        ],
  };
}

const agentFns = [
  materialAgent,
  reuseAgent,
  repairAgent,
  logisticsAgent,
  donationAgent,
] as const;

/** Runs every agent against a batch and returns their decisions. */
export function runAllAgents(batch: MaterialBatch): AgentDecision[] {
  return agentFns.map((fn) => fn(batch));
}

/** Convenience helper to run all agents by batch id. */
export function runAllAgentsById(batchId: string): AgentDecision[] {
  const batch = batchById[batchId];
  if (!batch) return [];
  return runAllAgents(batch);
}

/**
 * Picks the highest-confidence path across agents for a batch. Useful for a
 * single consolidated recommendation.
 */
export function consensusDecision(batch: MaterialBatch): AgentDecision {
  const decisions = runAllAgents(batch);
  return decisions.reduce(
    (best, d) => (d.confidence > best.confidence ? d : best),
    decisions[0],
  );
}
