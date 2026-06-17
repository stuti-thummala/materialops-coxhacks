import { OpsShell } from "@/components/dashboard/ops/OpsShell";
import { OpsHeader } from "@/components/dashboard/ops/OpsHeader";
import { StadiumExplorer } from "@/components/map/StadiumExplorer";
import { LiveOpsSignals } from "@/components/dashboard/ops/LiveOpsSignals";
import { LiveFieldIntake } from "@/components/dashboard/ops/LiveFieldIntake";
import { RecoveryBoard } from "@/components/dashboard/ops/RecoveryBoard";

export default function DashboardPage() {
  return (
    <OpsShell header={<OpsHeader />}>
      <div className="animate-fade-up space-y-5 p-5">
        {/* hero: map + live ops signals */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          <div className="flex flex-col overflow-hidden rounded-2xl border border-ops-border/80 bg-ops-surface shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)]">
            <div className="flex items-center justify-between border-b border-ops-border/70 px-5 py-3.5">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ops-ink">
                Stadium Recovery Command
              </h2>
              <span className="rounded-full border border-ops-green/30 bg-ops-green/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ops-green">
                Live · 8 zones
              </span>
            </div>
            <div className="flex-1 p-3">
              <StadiumExplorer className="h-[620px]" />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ops-border/80 bg-ops-surface shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)]">
            <LiveOpsSignals />
          </div>
        </div>

        {/* live field intake — updates the moment a mobile photo lands */}
        <LiveFieldIntake />

        {/* recovery board */}
        <RecoveryBoard />
      </div>
    </OpsShell>
  );
}
