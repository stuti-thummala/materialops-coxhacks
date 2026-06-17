import {
  materialBatches,
  recoveryTasks,
  recoveryZones,
  zoneById,
  batchById,
} from "./mockData";
import { consensusDecision, runAllAgents } from "./agents";
import { formatWeight, formatUsd, titleCase } from "./formatters";

export interface AssistantAnswer {
  text: string;
  /** Optional follow-up suggestions the UI can render as quick chips. */
  related?: string[];
}

const totalWeight = () =>
  materialBatches.reduce((s, b) => s + b.estimatedWeightLbs, 0);
const totalValue = () =>
  materialBatches.reduce((s, b) => s + b.estimatedValueUsd, 0);

function findBatch(query: string) {
  const idMatch = /[A-Z]{2}-\d{2,3}/.exec(query.toUpperCase());
  if (idMatch && batchById[idMatch[0]]) return batchById[idMatch[0]];
  return materialBatches.find((b) =>
    query.toLowerCase().includes(b.material.toLowerCase()),
  );
}

function findZone(query: string) {
  const q = query.toLowerCase();
  return recoveryZones.find(
    (z) =>
      q.includes(z.name.toLowerCase()) || q.includes(z.shortName.toLowerCase()),
  );
}

/**
 * Answers natural-language questions using batch, passport, task, and zone
 * data. This is a deterministic, rule-based prototype (no external LLM) so it
 * works offline and in local builds.
 */
export function answerQuestion(rawQuery: string): AssistantAnswer {
  const query = rawQuery.trim();
  const q = query.toLowerCase();

  if (!q) {
    return {
      text: "Ask me about a batch, a zone, recovery paths, crews, or overall impact.",
      related: ["How much have we recovered?", "Show batch VB-104", "What needs a crew?"],
    };
  }

  // Specific batch lookup
  const batch = findBatch(query);
  if (batch && (q.includes("batch") || /[a-z]{2}-\d/i.test(query) || q.includes(batch.material.toLowerCase()))) {
    const zone = zoneById[batch.sourceZone];
    const decision = consensusDecision(batch);
    return {
      text: `Batch ${batch.id} (${batch.material}) is ${batch.items.toLocaleString()} items, ~${formatWeight(
        batch.estimatedWeightLbs,
      )}, est. ${formatUsd(batch.estimatedValueUsd)}. It's from ${
        zone?.name ?? batch.sourceZone
      }, status ${titleCase(batch.status)}, priority ${batch.priority}. Recommended path: ${
        batch.bestPath
      }. The ${decision.agentName} is most confident (${Math.round(
        decision.confidence * 100,
      )}%): ${decision.summary}`,
      related: [`What agents say about ${batch.id}`, "What needs a crew?"],
    };
  }

  // Agent breakdown for a batch
  if (q.includes("agent") && batch) {
    const lines = runAllAgents(batch)
      .map(
        (d) =>
          `${d.agentName}: ${d.suggestedPath} (${Math.round(
            d.confidence * 100,
          )}%)`,
      )
      .join("; ");
    return { text: `Agent decisions for ${batch.id} — ${lines}.` };
  }

  // Zone lookup
  const zone = findZone(query);
  if (zone) {
    const zoneBatches = materialBatches.filter((b) => b.sourceZone === zone.id);
    return {
      text: `${zone.name}: ${zone.batchCount} batches, ${zone.itemCount.toLocaleString()} items, est. ${formatUsd(
        zone.estimatedValue,
      )}. Tracked batches here: ${
        zoneBatches.map((b) => b.id).join(", ") || "none in detail view"
      }.`,
    };
  }

  // Crew / assignment questions
  if (q.includes("crew") || q.includes("assign") || q.includes("pickup")) {
    const unassigned = recoveryTasks.filter(
      (t) => t.assignedCrewIds.length === 0,
    );
    if (unassigned.length === 0) {
      return { text: "All current recovery tasks have a crew assigned." };
    }
    return {
      text: `${unassigned.length} task(s) need a crew: ${unassigned
        .map((t) => `${t.id} (${t.batchIds.join(", ")})`)
        .join(", ")}.`,
    };
  }

  // Recovery path breakdown
  if (q.includes("path") || q.includes("reuse") || q.includes("recycle")) {
    const byPath = materialBatches.reduce<Record<string, number>>((acc, b) => {
      acc[b.bestPath] = (acc[b.bestPath] ?? 0) + 1;
      return acc;
    }, {});
    const summary = Object.entries(byPath)
      .map(([path, n]) => `${path}: ${n}`)
      .join(", ");
    return { text: `Recommended recovery paths across batches — ${summary}.` };
  }

  // Totals / impact
  if (
    q.includes("recover") ||
    q.includes("total") ||
    q.includes("impact") ||
    q.includes("how much") ||
    q.includes("value")
  ) {
    return {
      text: `Across ${materialBatches.length} tracked batches we have ~${formatWeight(
        totalWeight(),
      )} of material valued at ${formatUsd(
        totalValue(),
      )}. ${recoveryTasks.length} recovery tasks are in motion.`,
      related: ["What needs a crew?", "Show batch CT-033"],
    };
  }

  // Fallback
  return {
    text: `I can answer questions about batches (e.g. "VB-104"), zones, recovery paths, crews, and overall impact. Try asking "how much have we recovered?" or "what needs a crew?".`,
    related: ["How much have we recovered?", "What needs a crew?"],
  };
}
