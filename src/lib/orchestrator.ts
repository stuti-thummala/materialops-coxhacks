/**
 * Agent orchestration graph.
 *
 * The five MaterialOps agents are wired into a DAG instead of running
 * independently:
 *
 *   material ──┬──▶ reuse ───┐
 *              ├──▶ repair ──┼──▶ logistics ──▶ decision
 *              └──▶ donation ┘
 *
 * The orchestrator records a full reasoning trace — every node's inputs,
 * outputs, confidence, and dependencies — so the UI can render a transparent
 * "why this path" explanation (visible chain-of-thought).
 */

import type { MaterialBatch, RecoveryPath } from "./types";
import {
  materialAgent,
  reuseAgent,
  repairAgent,
  logisticsAgent,
  donationAgent,
  type AgentDecision,
  type AgentId,
} from "./agents";

export type TraceStatus = "ok" | "branch" | "merge" | "selected";

export interface TraceNode {
  id: AgentId;
  name: string;
  /** Node ids this node consumed. */
  dependsOn: AgentId[];
  status: TraceStatus;
  /** What the node looked at. */
  input: string;
  /** What the node concluded. */
  reasoning: string;
  suggestedPath: RecoveryPath;
  confidence: number;
  /** Simulated deterministic latency for a believable timeline. */
  latencyMs: number;
}

export interface Orchestration {
  batchId: string;
  decisions: Record<AgentId, AgentDecision>;
  trace: TraceNode[];
  /** Final endorsed path after logistics merge. */
  finalPath: RecoveryPath;
  finalConfidence: number;
  /** One-paragraph natural-language rationale stitched from the trace. */
  rationale: string;
  /** Agent that drove the final decision. */
  decidedBy: AgentId;
}

function latency(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + (seed.codePointAt(i) ?? 0)) % 997;
  return 60 + (h % 240);
}

export function orchestrate(batch: MaterialBatch): Orchestration {
  const material = materialAgent(batch);
  const reuse = reuseAgent(batch);
  const repair = repairAgent(batch);
  const donation = donationAgent(batch);
  const logistics = logisticsAgent(batch);

  const decisions: Record<AgentId, AgentDecision> = {
    material,
    reuse,
    repair,
    logistics,
    donation,
  };

  // Branch agents that endorse a circular path, ranked by confidence.
  const circular = [reuse, repair, donation]
    .filter((d) => ["reuse", "donate", "upcycle"].includes(d.suggestedPath))
    .sort((a, b) => b.confidence - a.confidence);

  const champion = circular[0];
  // Logistics gates feasibility; if a circular champion is strong, keep it,
  // otherwise fall back to the material agent's base path.
  const finalPath: RecoveryPath =
    champion && champion.confidence >= 0.55
      ? champion.suggestedPath
      : material.suggestedPath;

  const decidedBy: AgentId =
    finalPath === material.suggestedPath && (!champion || champion.confidence < 0.55)
      ? "material"
      : (champion?.agentId ?? "logistics");

  const finalConfidence = +(
    (decisions[decidedBy].confidence * 0.6 + logistics.confidence * 0.4)
  ).toFixed(2);

  const trace: TraceNode[] = [
    {
      id: "material",
      name: material.agentName,
      dependsOn: [],
      status: "branch",
      input: `${batch.material} · ${batch.materialType} · contamination ${batch.contaminationScore}`,
      reasoning: material.summary,
      suggestedPath: material.suggestedPath,
      confidence: material.confidence,
      latencyMs: latency(batch.id + "material"),
    },
    {
      id: "reuse",
      name: reuse.agentName,
      dependsOn: ["material"],
      status: "ok",
      input: `reuse potential ${batch.reusePotential}, ${batch.items} units`,
      reasoning: reuse.summary,
      suggestedPath: reuse.suggestedPath,
      confidence: reuse.confidence,
      latencyMs: latency(batch.id + "reuse"),
    },
    {
      id: "repair",
      name: repair.agentName,
      dependsOn: ["material"],
      status: "ok",
      input: `condition + contamination ${batch.contaminationScore}`,
      reasoning: repair.summary,
      suggestedPath: repair.suggestedPath,
      confidence: repair.confidence,
      latencyMs: latency(batch.id + "repair"),
    },
    {
      id: "donation",
      name: donation.agentName,
      dependsOn: ["material"],
      status: "ok",
      input: `reuse ${batch.reusePotential}, value $${batch.estimatedValueUsd}`,
      reasoning: donation.summary,
      suggestedPath: donation.suggestedPath,
      confidence: donation.confidence,
      latencyMs: latency(batch.id + "donation"),
    },
    {
      id: "logistics",
      name: logistics.agentName,
      dependsOn: ["reuse", "repair", "donation"],
      status: "merge",
      input: `${batch.destination} · ETA ${batch.eta}`,
      reasoning: logistics.summary,
      suggestedPath: finalPath,
      confidence: logistics.confidence,
      latencyMs: latency(batch.id + "logistics"),
    },
  ];

  const rationale =
    `${material.agentName} classified ${batch.id} as ${batch.materialType}. ` +
    (champion && champion.confidence >= 0.55
      ? `${champion.agentName} won the circular branch at ${Math.round(
          champion.confidence * 100,
        )}% confidence, endorsing ${champion.suggestedPath}. `
      : `No circular branch cleared the 55% bar, so the base path ${material.suggestedPath} holds. `) +
    `${logistics.agentName} confirmed routing to ${batch.destination}, yielding a final ${finalPath} decision at ${Math.round(
      finalConfidence * 100,
    )}% confidence.`;

  return {
    batchId: batch.id,
    decisions,
    trace,
    finalPath,
    finalConfidence,
    rationale,
    decidedBy,
  };
}
