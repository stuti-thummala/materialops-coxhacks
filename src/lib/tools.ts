/**
 * Tool surface for the MaterialOps assistant.
 *
 * These are the typed "functions" the assistant can call to ground its answers
 * in live operational data — the same pattern as LLM tool/function calling. The
 * local reasoning engine (lib/llm.ts) selects and invokes these; swapping in a
 * hosted LLM later means exposing this same registry as its tools.
 */

import {
  materialBatches,
  recoveryZones,
  recoveryTasks,
  zoneById,
  batchById,
} from "./mockData";
import { orchestrate } from "./orchestrator";
import { planDispatch } from "./dispatch";
import { forecastEvent, DEFAULT_EVENT, type EventProfile } from "./forecast";
import { computeImpact, aggregateImpact } from "./warm";
import { sponsorImpact, sponsors } from "./sponsors";
import { formatUsd, formatWeight } from "./formatters";
import { getFieldDrops } from "./liveReports";

export interface ToolResult {
  /** Markdown-ish text the assistant streams to the user. */
  text: string;
  /** Optional structured payload for richer UI. */
  data?: unknown;
}

export interface Tool {
  name: string;
  description: string;
  run: (arg?: string) => ToolResult;
}

function batchFromArg(arg?: string) {
  if (!arg) return undefined;
  const id = /[A-Z]{2}-\d{2,3}/.exec(arg.toUpperCase())?.[0];
  if (id && batchById[id]) return batchById[id];
  return materialBatches.find((b) =>
    arg.toLowerCase().includes(b.material.toLowerCase()),
  );
}

export const tools: Record<string, Tool> = {
  getTotals: {
    name: "getTotals",
    description: "Total recovered weight, value, and active tasks across all batches.",
    run: () => {
      const w = materialBatches.reduce((s, b) => s + b.estimatedWeightLbs, 0);
      const v = materialBatches.reduce((s, b) => s + b.estimatedValueUsd, 0);
      const impact = aggregateImpact(
        materialBatches.map((b) => ({
          material: `${b.material} ${b.materialType}`,
          weightLbs: b.estimatedWeightLbs,
          path: b.bestPath,
        })),
      );
      return {
        text: `Across ${materialBatches.length} tracked batches we've recovered ${formatWeight(
          w,
        )} (${formatUsd(v)} recovered value) and avoided **${impact.co2eAvoidedLbs.toLocaleString()} lbs CO₂e** — about ${impact.equivalents.carMiles.toLocaleString()} car-miles not driven. ${recoveryTasks.length} recovery tasks are in motion.`,
        data: impact,
      };
    },
  },

  getBatch: {
    name: "getBatch",
    description: "Look up a single batch's profile, status, and impact.",
    run: (arg) => {
      const b = batchFromArg(arg);
      if (!b) return { text: "I couldn't find that batch. Try an ID like VB-104." };
      const zone = zoneById[b.sourceZone];
      const impact = computeImpact(`${b.material} ${b.materialType}`, b.estimatedWeightLbs, b.bestPath);
      return {
        text: `**${b.id} — ${b.material}** (${b.materialType}). ${b.items.toLocaleString()} items · ${formatWeight(
          b.estimatedWeightLbs,
        )} · ${formatUsd(b.estimatedValueUsd)}. From ${zone?.name ?? b.sourceZone}, status ${b.status}, priority ${b.priority}. Recommended path: **${b.bestPath}**, avoiding ${impact.co2eAvoidedLbs.toLocaleString()} lbs CO₂e. Destination: ${b.destination}.`,
        data: { batch: b, impact },
      };
    },
  },

  routeRecommendation: {
    name: "routeRecommendation",
    description: "Run the agent orchestration graph and explain the recommended path.",
    run: (arg) => {
      const b = batchFromArg(arg);
      if (!b) return { text: "Tell me which batch to route, e.g. 'route CT-033'." };
      const o = orchestrate(b);
      return { text: o.rationale, data: o };
    },
  },

  getZones: {
    name: "getZones",
    description: "Zone-by-zone batch counts, items, and recoverable value.",
    run: (arg) => {
      const target = arg
        ? recoveryZones.find(
            (z) =>
              arg.toLowerCase().includes(z.shortName.toLowerCase()) ||
              arg.toLowerCase().includes(z.name.toLowerCase()),
          )
        : undefined;
      if (target) {
        return {
          text: `**${target.name}** — ${target.batchCount} batches, ${target.itemCount.toLocaleString()} items, est. ${formatUsd(
            target.estimatedValue,
          )}.`,
          data: target,
        };
      }
      const top = [...recoveryZones]
        .sort((a, b) => b.estimatedValue - a.estimatedValue)
        .slice(0, 3)
        .map((z) => `${z.shortName} (${formatUsd(z.estimatedValue)})`)
        .join(", ");
      return {
        text: `${recoveryZones.length} active zones. Highest recoverable value: ${top}.`,
        data: recoveryZones,
      };
    },
  },

  forecast: {
    name: "forecast",
    description: "Predict recoverable tonnage and crew needs for an upcoming event.",
    run: () => {
      const f = forecastEvent(DEFAULT_EVENT);
      const top = f.zones[0];
      return {
        text: `For a ${DEFAULT_EVENT.attendance.toLocaleString()}-seat FIFA match I project **${f.totalTons} tons** of recoverable material at a ${Math.round(
          f.projectedDiversionRate * 100,
        )}% diversion rate. Pre-stage **${f.recommendedCrews} crews**; the hotspot is ${top.shortName} (~${top.totalLbs.toLocaleString()} lbs, peak ${top.peakWindow}).`,
        data: f,
      };
    },
  },

  draftDispatch: {
    name: "draftDispatch",
    description: "Draft an autonomous dispatch plan (partner email + crew + window) for approval.",
    run: (arg) => {
      const b = batchFromArg(arg);
      if (!b) return { text: "Which batch should I dispatch? e.g. 'dispatch VB-104'." };
      const plan = planDispatch(b);
      return {
        text: `Drafted a dispatch plan for **${b.id}**: email ${plan.partner}, book ${plan.pickupWindow}, assign ${plan.crewName}, route via ${b.bestPath}. ${plan.co2eAvoidedLbs.toLocaleString()} lbs CO₂e avoided. Awaiting your approval — open the batch to review and approve.`,
        data: plan,
      };
    },
  },

  dispatchPriority: {
    name: "dispatchPriority",
    description:
      "Ranks staged batches by readiness, priority, and recoverable value to recommend what to dispatch first.",
    run: () => {
      const PRIORITY_RANK: Record<string, number> = { high: 2, medium: 1, low: 0 };
      const ranked = [...materialBatches]
        .map((b) => {
          const readyScore = b.status === "ready" ? 1000 : 0;
          const priorityScore = (PRIORITY_RANK[b.priority] ?? 0) * 300;
          return { b, score: readyScore + priorityScore + b.estimatedValueUsd };
        })
        .sort((x, y) => y.score - x.score);

      const top = ranked[0]?.b;
      if (!top) {
        return { text: "No staged batches are waiting to dispatch right now." };
      }
      const zone = zoneById[top.sourceZone];
      const plan = planDispatch(top);
      const runnerUps = ranked
        .slice(1, 3)
        .map(({ b }) => `**${b.id}** (${b.material}, ${formatUsd(b.estimatedValueUsd)})`)
        .join(", then ");
      const reason =
        top.status === "ready"
          ? `it's staged and ready now`
          : `it's the highest-value ${top.priority}-priority load`;
      return {
        text: `Dispatch **${top.id}** first — ${top.material} from ${
          zone?.name ?? top.sourceZone
        } (${top.items.toLocaleString()} items, ${formatWeight(
          top.estimatedWeightLbs,
        )}, ${formatUsd(top.estimatedValueUsd)}). It tops the queue because ${reason} and routes via **${
          top.bestPath
        }**. I can draft the plan: email ${plan.partner}, book ${plan.pickupWindow}, assign ${plan.crewName} — ${plan.co2eAvoidedLbs.toLocaleString()} lbs CO₂e avoided.${
          runnerUps ? ` Next up after that: ${runnerUps}.` : ""
        }`,
        data: ranked.slice(0, 3).map(({ b }) => b),
      };
    },
  },

  sponsorReport: {
    name: "sponsorReport",
    description: "Summarise verified recovery impact attributed to a sponsor brand.",
    run: (arg) => {
      const s = arg
        ? sponsors.find((x) => arg.toLowerCase().includes(x.name.toLowerCase().split(" ")[0]))
        : undefined;
      const summary = sponsorImpact(s?.id ?? sponsors[0].id);
      return {
        text: `**${summary.sponsor.name}**: ${summary.totalItems.toLocaleString()} branded items recovered (${formatWeight(
          summary.totalWeightLbs,
        )}), ${Math.round(summary.diversionRate * 100)}% diverted from landfill, **${summary.impact.co2eAvoidedLbs.toLocaleString()} lbs CO₂e** avoided. Full report at /sponsors.`,
        data: summary,
      };
    },
  },

  fieldReports: {
    name: "fieldReports",
    description:
      "Latest crowd-sourced field captures from the mobile app and their auto-generated drop-off routing.",
    run: () => {
      const drops = getFieldDrops();
      if (drops.length === 0) {
        return {
          text: "No field captures have come in yet. When a worker photographs material in the mobile app, it streams here with a material passport, lands on the live map at their GPS location, and gets an automatic drop-off plan.",
        };
      }
      const r = drops[0];
      const d = r.disposal;
      const routing = d
        ? ` Auto-routed via **${d.path}** to **${d.dropOff.name}** (${d.dropOff.location}) — ${d.distanceMi} mi, ETA ${d.etaMin} min.`
        : "";
      return {
        text: `Newest field capture: **${r.ai.type}** (~${r.ai.estWeightLbs} lbs, ${Math.round(
          r.ai.confidence * 100,
        )}% confidence, passport ${r.passportId}) at ${
          r.coords?.label ?? "an unknown spot"
        }, avoiding ${r.ai.co2eLbs} lbs CO₂e.${routing} ${drops.length} field drop(s) are live on the recovery map.`,
        data: drops,
      };
    },
  },

  nextStep: {
    name: "nextStep",
    description:
      "Recommends the next logical operational step based on the latest live field captures and their routing.",
    run: () => {
      const drops = getFieldDrops();
      if (drops.length === 0) {
        return {
          text: "No new field captures are waiting. The next logical step is to keep crews on their assigned zones and clear the highest-value staged batches first — pull up Dispatch to send the next pickup.",
        };
      }
      const biltmore = drops.find((r) =>
        /biltmore/i.test(r.coords?.label ?? ""),
      );
      const r = biltmore ?? drops[0];
      const d = r.disposal;
      const where = r.coords?.label ?? "the field";
      const routing = d
        ? `route it via **${d.path}** to **${d.dropOff.name}** (${d.dropOff.location}, ${d.distanceMi} mi / ETA ${d.etaMin} min)`
        : "confirm its drop-off routing";
      const batchTag = r.batchId ? ` as batch **${r.batchId}**` : "";
      const origin = biltmore
        ? "the **Biltmore Innovation Center**"
        : where;
      return {
        text: `Next logical step: the freshest recovery just came in from ${origin} — **${r.ai.type}** (~${r.ai.estWeightLbs} lbs)${batchTag}. Dispatch the nearest available crew to ${origin} to pick it up, then ${routing}. That keeps the new Biltmore line moving and locks in the ${r.ai.co2eLbs} lbs CO₂e it avoids before it ages out.`,
        data: r,
      };
    },
  },
};

export const EVENT_PROFILE_DEFAULT: EventProfile = DEFAULT_EVENT;
