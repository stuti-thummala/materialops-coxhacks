import { GlassCard } from "@/components/ui/GlassCard";
import { runAllAgents, type AgentDecision } from "@/lib/agents";
import type { MaterialBatch } from "@/lib/types";
import { Bot } from "lucide-react";

const priorityColors: Record<string, string> = {
  high: "text-ops-red",
  medium: "text-ops-amber",
  low: "text-ops-muted",
};

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ops-bg">
      <div
        className="h-full rounded-full bg-ops-green"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

function AgentRow({ decision }: { decision: AgentDecision }) {
  return (
    <div className="border-b border-ops-border px-5 py-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-ops-purple" />
          <span className="text-sm font-semibold text-ops-ink">
            {decision.agentName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBar value={decision.confidence} />
          <span className="text-[11px] font-medium text-ops-muted">
            {Math.round(decision.confidence * 100)}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-[13px] text-ops-ink/80">{decision.summary}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {decision.signals.map((s) => (
          <span
            key={s.label}
            className="rounded bg-ops-bg px-2 py-0.5 text-[11px] text-ops-muted"
          >
            {s.label}: <span className="text-ops-ink/70">{s.value}</span>
          </span>
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {decision.recommendations.map((r) => (
          <li
            key={r.action}
            className="flex items-start gap-2 text-[12.5px] text-ops-ink/80"
          >
            <span className={`font-semibold ${priorityColors[r.priority]}`}>
              •
            </span>
            <span>{r.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgentDecisions({ batch }: { batch: MaterialBatch }) {
  const decisions = runAllAgents(batch);
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ops-border px-5 py-4">
        <Bot className="h-5 w-5 text-ops-purple" />
        <h2 className="font-display text-lg font-semibold tracking-tight text-ops-ink">
          Agent Recommendations
        </h2>
      </div>
      <div>
        {decisions.map((d) => (
          <AgentRow key={d.agentId} decision={d} />
        ))}
      </div>
    </GlassCard>
  );
}
