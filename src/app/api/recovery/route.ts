import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Live recovery bridge between the on-phone Flutter worker app and the web
 * command center.
 *
 * The managed laptop's firewall blocks inbound connections to node, so the
 * phone can't reach this server directly over the LAN. Instead both sides talk
 * to a public pub/sub relay (ntfy.envs.net) using only OUTBOUND connections:
 *   1. The phone POSTs an accepted recovery to https://ntfy.envs.net/<topic>.
 *   2. This route polls that same topic (server-side, outbound) on every GET
 *      and folds new messages into the in-memory queue.
 *   3. The web dashboard polls GET and lights up every Biltmore-reactive
 *      screen.
 *
 * The direct POST handler below is kept as a same-device fallback.
 *
 * In-memory only — fine for a live demo (resets when the dev server restarts).
 */
type RecoveryEvent = {
  id: string;
  kind: string;
  item: string;
  at: number;
};

const NTFY_BASE = "https://ntfy.envs.net";
const NTFY_TOPIC = "materialops-biltmore-7q2x9k";

// Survive Next.js dev hot-reloads by stashing state on globalThis.
const store = globalThis as unknown as {
  __recoveryEvents?: RecoveryEvent[];
  __recoverySince?: number;
  __recoverySeenIds?: Set<string>;
};
store.__recoveryEvents ??= [];
store.__recoverySince ??= Math.floor(Date.now() / 1000);
store.__recoverySeenIds ??= new Set<string>();
const events = store.__recoveryEvents;

const ALLOWED_KINDS = new Set([
  "lanyards",
  "cups",
  "bottles",
  "banner",
  "carpet",
  "cardboard",
  "organics",
  "other",
]);

function enqueue(rawKind: unknown, rawItem: unknown): RecoveryEvent {
  const k = typeof rawKind === "string" ? rawKind.toLowerCase() : "";
  const kind = ALLOWED_KINDS.has(k) ? k : "other";
  const item =
    typeof rawItem === "string" && rawItem.trim().length > 0
      ? rawItem.trim().slice(0, 80)
      : "Recovered material";

  const event: RecoveryEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    item,
    at: Date.now(),
  };
  events.push(event);
  // Keep the queue bounded.
  if (events.length > 100) events.splice(0, events.length - 100);
  return event;
}

type NtfyMessage = {
  id?: string;
  time?: number;
  event?: string;
  message?: string;
};

/**
 * Parse one ntfy SSE/JSON line into a recovery payload, or null if it isn't a
 * usable message. Keeps the polling loop's complexity low.
 */
function parseNtfyLine(
  line: string,
): { id: string; time: number; kind: unknown; item: unknown } | null {
  const trimmed = line.trim();
  if (trimmed.length === 0) return null;

  let msg: NtfyMessage;
  try {
    msg = JSON.parse(trimmed) as NtfyMessage;
  } catch {
    return null;
  }

  if (msg.event !== "message" || typeof msg.id !== "string") return null;

  let payload: { kind?: unknown; item?: unknown };
  try {
    payload = JSON.parse(msg.message ?? "{}") as {
      kind?: unknown;
      item?: unknown;
    };
  } catch {
    payload = { item: msg.message };
  }

  return {
    id: msg.id,
    time: typeof msg.time === "number" ? msg.time : 0,
    kind: payload.kind,
    item: payload.item,
  };
}

/**
 * Pull any new recovery messages the phone published to the ntfy relay and fold
 * them into the queue. Best-effort: relay/network errors are swallowed so the
 * local POST fallback keeps working.
 */
async function pullFromNtfy(): Promise<void> {
  const since = store.__recoverySince ?? Math.floor(Date.now() / 1000);
  const seen = store.__recoverySeenIds ?? new Set<string>();

  let text: string;
  try {
    const res = await fetch(
      `${NTFY_BASE}/${NTFY_TOPIC}/json?poll=1&since=${since}`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return;
    text = await res.text();
  } catch {
    return;
  }

  let maxTime = since;
  for (const line of text.split("\n")) {
    const parsed = parseNtfyLine(line);
    if (parsed === null) continue;
    if (parsed.time > maxTime) maxTime = parsed.time;
    if (seen.has(parsed.id)) continue;
    seen.add(parsed.id);
    enqueue(parsed.kind, parsed.item);
  }

  // Advance the window so we never re-pull old messages.
  store.__recoverySince = maxTime;
  // Bound the dedupe set.
  store.__recoverySeenIds =
    seen.size > 500 ? new Set([...seen].slice(-250)) : seen;
}

export async function GET(): Promise<NextResponse> {
  await pullFromNtfy();
  return NextResponse.json({ events });
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: { kind?: unknown; item?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const event = enqueue(body.kind, body.item);
  return NextResponse.json({ ok: true, event });
}

/**
 * Clear the in-memory recovery queue and advance the relay window to now, so
 * the backlog of test/demo messages on ntfy is never re-pulled. Used to reset
 * the demo to a clean slate.
 */
export async function DELETE(): Promise<NextResponse> {
  events.length = 0;
  store.__recoverySince = Math.floor(Date.now() / 1000);
  store.__recoverySeenIds = new Set<string>();
  return NextResponse.json({ ok: true, cleared: true });
}
