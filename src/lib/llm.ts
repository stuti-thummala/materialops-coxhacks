/**
 * MaterialOps reasoning engine.
 *
 * A provider-agnostic, streaming assistant core. It plans, selects a tool from
 * the registry in lib/tools.ts, calls it, and streams the grounded answer token
 * by token — the same shape as an LLM tool-calling loop, but fully local and
 * offline so the demo never depends on a network key.
 *
 * To plug in a hosted model later, branch in `streamAnswer` on an env endpoint
 * and forward `tools` as the function schema; the chunk protocol below already
 * matches a streaming chat completion.
 */

import { tools, type Tool } from "./tools";

export type ChunkType = "thought" | "tool" | "token" | "data" | "done";

export interface AssistantChunk {
  type: ChunkType;
  text?: string;
  toolName?: string;
  toolArg?: string;
  data?: unknown;
}

interface Plan {
  tool: Tool;
  arg?: string;
  thought: string;
}

const BATCH_RE = /[A-Z]{2}-\d{2,3}/i;

function plan(query: string): Plan {
  const q = query.toLowerCase();
  const batchId = BATCH_RE.exec(query)?.[0]?.toUpperCase();

  if (/(next step|next logical step|logical step|what.?s next|next move|what should (i|we) do|what do we do|should we do next|recommend.* next)/.test(q)) {
    return { tool: tools.nextStep, thought: "Reading the live field captures to recommend the next logical operational step." };
  }
  if (/(field|spotted|just came|just reported|incoming|drop-?off|dispose|disposal|where should|where do|capture|biltmore)/.test(q)) {
    return { tool: tools.fieldReports, thought: "Pulling the latest field captures and their drop-off routing." };
  }
  if (/(forecast|predict|how much will|upcoming|next match|pre-?event|stage)/.test(q)) {
    return { tool: tools.forecast, thought: "This is a predictive question — running the pre-event forecast model." };
  }
  const asksWhatFirst =
    /(first|priorit|next)/.test(q) &&
    /(dispatch|pick ?up|send|recover)/.test(q);
  if (asksWhatFirst) {
    return { tool: tools.dispatchPriority, thought: "Ranking staged batches by readiness, priority, and value to recommend what to dispatch first." };
  }
  if (/(dispatch|pickup|pick up|send|email|book|partner email)/.test(q)) {
    return { tool: tools.draftDispatch, arg: batchId ?? query, thought: "Drafting an autonomous dispatch plan for human approval." };
  }
  if (/(sponsor|brand|coca|cola|adidas|heineken|bud|mercedes|esg|scope 3)/.test(q)) {
    return { tool: tools.sponsorReport, arg: query, thought: "Aggregating verified impact attributed to that sponsor brand." };
  }
  if (/(route|why|recommend|best path|agent|orchestr|decide)/.test(q) && (batchId || /banner|cup|lanyard|foam|carpet/.test(q))) {
    return { tool: tools.routeRecommendation, arg: batchId ?? query, thought: "Running the agent orchestration graph to explain the routing." };
  }
  if (batchId || /banner|cup|lanyard|foam|carpet/.test(q)) {
    return { tool: tools.getBatch, arg: batchId ?? query, thought: "Looking up that batch's live profile and impact." };
  }
  if (/zone|plaza|gwcc|arena|backyard|logistics/.test(q)) {
    return { tool: tools.getZones, arg: query, thought: "Pulling zone-level recovery metrics." };
  }
  if (/(total|impact|recover|co2|co₂|carbon|how much|value|diver)/.test(q)) {
    return { tool: tools.getTotals, thought: "Totalling recovered material and verified climate impact." };
  }
  return { tool: tools.getTotals, thought: "Summarising overall recovery status." };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Stream a grounded answer for a query. Consume with `for await`.
 */
export async function* streamAnswer(
  query: string,
): AsyncGenerator<AssistantChunk> {
  const q = query.trim();
  if (!q) {
    yield { type: "token", text: "Ask me about a batch, zone, forecast, sponsor, or dispatch." };
    yield { type: "done" };
    return;
  }

  const p = plan(q);
  yield { type: "thought", text: p.thought };
  await delay(260);

  yield { type: "tool", toolName: p.tool.name, toolArg: p.arg };
  await delay(220);

  const result = p.tool.run(p.arg);
  if (result.data !== undefined) yield { type: "data", data: result.data };

  // Stream the answer word by word.
  const words = result.text.split(/(\s+)/);
  for (const w of words) {
    yield { type: "token", text: w };
    if (w.trim()) await delay(14);
  }

  yield { type: "done", data: result.data };
}

/** Suggested quick prompts surfaced in the assistant UI. */
export const QUICK_PROMPTS = [
  "What's the next logical step?",
  "What just came in from the field?",
  "How much have we recovered?",
  "Forecast the next FIFA match",
  "Why route CT-033?",
  "Coca-Cola sponsor impact",
];
