import { TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DIVERSION_BENCHMARKS, TONS_VS_BASELINE } from "@/lib/economics";

/** The counterfactual proof: this event's diversion against the industry
 * baseline and the venue's own prior match — the gap is the whole point. */
export function DiversionBenchmark() {
  const lift = Math.round(
    (DIVERSION_BENCHMARKS[2].diversion - DIVERSION_BENCHMARKS[0].diversion) * 100,
  );

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-display text-base font-semibold text-ops-ink">
            Diversion vs. baseline
          </div>
          <p className="mt-0.5 text-sm text-ops-muted">
            What this event diverted against the counterfactual
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-ops-green/30 bg-ops-green/10 px-2.5 py-1 text-xs font-bold text-ops-green">
          <TrendingUp className="h-3.5 w-3.5" />
          +{lift} pts
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {DIVERSION_BENCHMARKS.map((b) => {
          const pct = Math.round(b.diversion * 100);
          return (
            <div key={b.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={`text-sm ${
                    b.highlight ? "font-semibold text-ops-ink" : "text-ops-muted"
                  }`}
                >
                  {b.label}
                </span>
                <span
                  className={`font-display text-lg font-bold tabular-nums ${
                    b.highlight ? "text-ops-green" : "text-ops-muted"
                  }`}
                >
                  {pct}%
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-ops-bg">
                <div
                  className={`h-full rounded-full ${
                    b.highlight ? "bg-ops-green" : "bg-ops-muted/45"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-ops-muted">{b.note}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-md bg-ops-green/[0.07] px-4 py-3 text-sm text-ops-ink">
        <span className="font-semibold text-ops-green">{TONS_VS_BASELINE} extra tons</span>{" "}
        kept out of landfill versus running this same event at the industry baseline.
      </div>
    </GlassCard>
  );
}
