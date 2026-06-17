import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { groupedItemsForBatch } from "@/lib/mockData";
import type { MaterialBatch } from "@/lib/types";

const pathLabels: Record<string, string> = {
  reuse: "Reuse-Ready",
  recycle: "Recycle",
  upcycle: "Upcycle",
  donate: "Donate",
  compost: "Compost",
  landfill: "Landfill",
};

const contaminationColors: Record<string, string> = {
  low: "!text-ops-green !bg-ops-green/12 !border-ops-green/30",
  medium: "!text-ops-amber !bg-ops-amber/12 !border-ops-amber/30",
  high: "!text-ops-red !bg-ops-red/12 !border-ops-red/30",
};

export function MaterialPassport({ batch }: { batch: MaterialBatch }) {
  const grouped = groupedItemsForBatch(batch);
  const sourceZoneCount = new Set(grouped.map((g) => g.sourceZone)).size;

  const rows: { label: string; value: string }[] = [
    { label: "Material", value: batch.material },
    { label: "Material Type", value: batch.materialType },
    { label: "Grouped Items", value: `${batch.items.toLocaleString()} items` },
    {
      label: "Source Zones",
      value: `${sourceZoneCount} zone${sourceZoneCount === 1 ? "" : "s"}`,
    },
    {
      label: "Est. Total Weight",
      value: `${batch.estimatedWeightLbs.toLocaleString()} lbs`,
    },
    {
      label: "Est. Recovery Value",
      value: `$${batch.estimatedValueUsd.toLocaleString()}`,
    },
    { label: "Reuse Path", value: pathLabels[batch.bestPath] ?? batch.bestPath },
    { label: "Destination Partner", value: batch.destination },
  ];

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg font-semibold tracking-tight text-ops-ink">
        Material Passport
      </h2>
      <div className="mt-4 divide-y divide-ops-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2.5 text-sm"
          >
            <span className="text-ops-muted">{row.label}</span>
            <span className="font-medium text-ops-ink">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-2.5 text-sm">
          <span className="text-ops-muted">Contamination Score</span>
          <StatusPill
            status={batch.contaminationScore}
            variant="priority"
            className={
              contaminationColors[batch.contaminationScore] ??
              contaminationColors.low
            }
          />
        </div>
      </div>
      <div className="mt-4 rounded-md border border-ops-border bg-ops-bg p-4 text-sm text-ops-ink/80">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-ops-muted">
          Contamination Notes
        </div>
        {batch.contaminationScore === "low"
          ? "Light dust and scuffing only. No adhesives or grommets detected. Clean and bale-ready."
          : batch.contaminationScore === "medium"
            ? "Some residue and mixed fasteners detected. Light sorting recommended before handoff."
            : "Significant contamination detected. Manual inspection required before recovery."}
      </div>
    </GlassCard>
  );
}
