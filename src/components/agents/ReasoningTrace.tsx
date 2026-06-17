"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  GitBranch,
  Cpu,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { MaterialBatch } from "@/lib/types";
import { orchestrate, type TraceNode } from "@/lib/orchestrator";

const PATH_COLOR: Record<string, string> = {
  reuse: "#1F9D66",
  recycle: "#2F6FDB",
  upcycle: "#7251B5",
  donate: "#C9831A",
  compost: "#1F9D66",
  landfill: "#C34A36",
};

export function ReasoningTrace({ batch }: { batch: MaterialBatch }) {
  const orchestration = orchestrate(batch);
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState<string | null>("logistics");

  return (
    <section className="rounded-2xl border border-ops-border bg-ops-surface p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ops-purple/10 text-ops-purple">
            <GitBranch className="h-5 w-5" />
          </span>
          <div className="text-left">
            <h3 className="font-display text-base font-semibold text-ops-ink">
              Agent Orchestration
            </h3>
            <p className="text-xs text-ops-muted">
              5-node reasoning graph · decided by {orchestration.decisions[orchestration.decidedBy].agentName}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-ops-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-4">
          {/* final decision banner */}
          <div
            className="flex items-center justify-between rounded-xl border px-4 py-3"
            style={{
              borderColor: `${PATH_COLOR[orchestration.finalPath]}40`,
              background: `${PATH_COLOR[orchestration.finalPath]}0d`,
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: PATH_COLOR[orchestration.finalPath] }} />
              <span className="text-sm font-semibold text-ops-ink">
                Final path: {orchestration.finalPath}
              </span>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
              style={{ background: PATH_COLOR[orchestration.finalPath] }}
            >
              {Math.round(orchestration.finalConfidence * 100)}% confidence
            </span>
          </div>

          {/* trace nodes */}
          <div className="mt-4 space-y-2">
            {orchestration.trace.map((node, i) => (
              <TraceRow
                key={node.id}
                node={node}
                index={i}
                expanded={expanded === node.id}
                onToggle={() =>
                  setExpanded((cur) => (cur === node.id ? null : node.id))
                }
                isFinal={node.id === orchestration.decidedBy}
              />
            ))}
          </div>

          <p className="mt-4 rounded-xl bg-ops-bg px-4 py-3 text-[13px] leading-relaxed text-ops-ink/80">
            {orchestration.rationale}
          </p>
        </div>
      )}
    </section>
  );
}

function TraceRow({
  node,
  index,
  expanded,
  onToggle,
  isFinal,
}: {
  node: TraceNode;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isFinal: boolean;
}) {
  const statusLabel: Record<TraceNode["status"], string> = {
    branch: "branch",
    ok: "evaluate",
    merge: "merge",
    selected: "selected",
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-ops-border bg-ops-bg/40"
    >
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-3 py-2.5">
        <span className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-ops-navy text-white">
          {isFinal ? <CheckCircle2 className="h-4 w-4 text-ops-green" /> : <Cpu className="h-4 w-4" />}
          {node.dependsOn.length > 0 && (
            <span className="absolute -left-3 top-1/2 h-px w-3 bg-ops-border" />
          )}
        </span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ops-ink">{node.name}</span>
            <span className="rounded bg-ops-border/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-ops-muted">
              {statusLabel[node.status]}
            </span>
          </div>
          <div className="text-[11px] text-ops-muted">{node.input}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ops-border/50">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(node.confidence * 100)}%`,
                background: PATH_COLOR[node.suggestedPath] ?? "#2F6FDB",
              }}
            />
          </div>
          <span className="w-8 text-right text-[11px] font-semibold text-ops-ink">
            {Math.round(node.confidence * 100)}%
          </span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-ops-border px-3 py-2.5 pl-12">
          <p className="text-[12px] leading-relaxed text-ops-ink/80">{node.reasoning}</p>
          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-ops-muted">
            <span>endorses <strong className="text-ops-ink">{node.suggestedPath}</strong></span>
            <span>· {node.latencyMs}ms</span>
            {node.dependsOn.length > 0 && (
              <span>· consumes {node.dependsOn.join(", ")}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
