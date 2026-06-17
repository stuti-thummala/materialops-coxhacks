"use client";

import { Sparkles, TrendingUp, Gauge, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const metrics = [
  {
    label: "Impact",
    value: "+1.6 t recovered",
    sub: "clears North Gate backlog",
    icon: TrendingUp,
    accent: "text-ops-green",
  },
  {
    label: "Effort",
    value: "1 crew · 45 min",
    sub: "reassigned from Transit",
    icon: Gauge,
    accent: "text-ops-amber",
  },
  {
    label: "ETA Improvement",
    value: "−38 min",
    sub: "zone clear by 15:10",
    icon: Clock,
    accent: "text-ops-blue",
  },
];

export function NextBestAction() {
  const { showToast } = useToast();

  return (
    <section className="border border-ops-navy bg-ops-navy text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <Sparkles className="h-4 w-4 text-ops-green" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
          Next Best Action
        </h2>
      </div>

      <div className="px-5 py-4">
        <p className="font-display text-lg font-semibold leading-snug">
          Dispatch 1 additional crew to North Gate
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/65">
          Cardboard intake is outpacing recovery by 22%. Reassigning a standby crew
          from Transit Drop-Off prevents an overflow event before partner pickup.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="border border-white/10 bg-white/[0.04] px-3 py-2.5"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                  <Icon className={`h-3.5 w-3.5 ${m.accent}`} />
                  {m.label}
                </div>
                <div className="mt-1 font-display text-[15px] font-bold">{m.value}</div>
                <div className="text-[11px] text-white/55">{m.sub}</div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() =>
            showToast("Crew 5 reassigned to North Gate — ETA 4 min")
          }
          className="mt-4 flex w-full items-center justify-center gap-2 bg-ops-green py-3 text-sm font-semibold text-white transition hover:bg-ops-green/90"
        >
          Approve &amp; Dispatch Crew
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
