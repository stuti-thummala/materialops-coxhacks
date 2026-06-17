import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { OpsStadiumMap } from "@/components/dashboard/ops/OpsStadiumMap";
import { recoveryZones, materialBatches } from "@/lib/mockData";
import { formatNumber, formatUsd } from "@/lib/formatters";
import { MapPin, Boxes, DollarSign, Info, Building2, Sparkles } from "lucide-react";

/** Lightweight "AI" heuristic — turns each zone's live counts into a recommended
 * next action, so the panel reads like model-generated guidance during the demo. */
function zoneSuggestion(zone: (typeof recoveryZones)[number]): string {
  const density = zone.itemCount / Math.max(zone.batchCount, 1);
  const topBatch = materialBatches
    .filter((b) => b.sourceZone === zone.id)
    .sort((a, b) => b.estimatedWeightLbs - a.estimatedWeightLbs)[0];
  if (zone.estimatedValue > 5000) {
    const lead = topBatch
      ? ` — start with ${topBatch.id} (${topBatch.material}).`
      : ".";
    return `High recoverable value (${formatUsd(zone.estimatedValue)}). Prioritize a crew here${lead}`;
  }
  if (density > 600) {
    return `Dense item flow (~${Math.round(density)} items/batch). Stage extra bins before peak to avoid overflow.`;
  }
  if (topBatch) {
    return `Route ${topBatch.id} (${topBatch.material}) next — heaviest recoverable load in this zone.`;
  }
  return "Steady flow. Maintain current crew coverage and keep contamination low.";
}

export default function ZonesPage() {
  return (
    <AppShell header={<PageHeader title="Recovery Zones" subtitle="Live activity across the Mercedes-Benz Stadium district" />}>
      <div className="animate-fade-up space-y-6">
        {/* what-is-this help banner */}
        <div className="rounded-lg border border-ops-border bg-ops-surface p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-ops-green/10 text-ops-green">
              <Info className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5">
              <div className="font-display font-semibold text-ops-ink">
                What are Recovery Zones?
              </div>
              <p className="text-sm leading-relaxed text-ops-muted">
                Recovery Zones divide the venue into physical recovery areas so crews,
                batches, and material flow can be tracked live in one place. Each zone
                shows how many batches are staged, crews assigned, and the estimated
                recoverable value — tap a zone on the map for its status and to dispatch.
              </p>
              <div className="flex items-center gap-1.5 pt-0.5 text-xs font-medium text-ops-blue">
                <Building2 className="h-3.5 w-3.5" />
                Zones cover the Mercedes-Benz Stadium campus. Off-site recoveries arrive
                automatically as live field drops the moment they&apos;re captured.
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-ops-border bg-ops-surface p-3">
          <OpsStadiumMap />
        </div>

        {/* AI-generated suggestions */}
        <div className="rounded-lg border border-ops-border bg-ops-surface p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ops-green" />
            <span className="font-display font-semibold text-ops-ink">
              AI-generated zone suggestions
            </span>
            <span className="rounded-full bg-ops-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ops-green">
              Live
            </span>
          </div>
          <p className="mt-1 text-xs text-ops-muted">
            Recommended next action per zone, generated from live batch volume, value,
            and crew coverage.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {recoveryZones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-start gap-3 rounded-md border border-ops-border bg-ops-bg p-3"
              >
                <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-ops-green" />
                <div>
                  <div className="text-sm font-semibold text-ops-ink">{zone.name}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-ops-muted">
                    {zoneSuggestion(zone)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recoveryZones.map((zone) => (
            <div
              key={zone.id}
              className="rounded-lg border border-ops-border bg-ops-surface p-5"
            >
              <div className="flex items-center gap-2 text-ops-ink">
                <MapPin className="h-4 w-4 text-ops-green" />
                <span className="font-display font-semibold">{zone.name}</span>
              </div>
              <p className="mt-1 text-sm text-ops-muted">{zone.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ops-border pt-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-xs text-ops-muted">
                    <Boxes className="h-3 w-3" /> Batches
                  </div>
                  <div className="font-semibold text-ops-ink">{zone.batchCount}</div>
                </div>
                <div>
                  <div className="text-xs text-ops-muted">Items</div>
                  <div className="font-semibold text-ops-ink">
                    {formatNumber(zone.itemCount)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-ops-muted">
                    <DollarSign className="h-3 w-3" /> Value
                  </div>
                  <div className="font-semibold text-ops-green">
                    {formatUsd(zone.estimatedValue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
