import {
  Weight,
  Recycle,
  Truck,
  TriangleAlert,
  Boxes,
  Clock,
} from "lucide-react";
import { materialBatches, recoveryTasks } from "@/lib/mockData";

const totalLbs = materialBatches.reduce(
  (sum, b) => sum + b.estimatedWeightLbs,
  0,
);
const reusableLbs = materialBatches
  .filter((b) => b.bestPath === "reuse")
  .reduce((sum, b) => sum + b.estimatedWeightLbs, 0);
const recoveryRate = totalLbs === 0 ? 0 : Math.round((reusableLbs / totalLbs) * 100);
const activePickups = recoveryTasks.filter((t) =>
  ["assigned", "accepted", "in-progress", "picked-up"].includes(t.status),
).length;
const overdue = recoveryTasks.filter((t) => t.priority === "high").length;
const avgPickup = recoveryTasks.length
  ? Math.round(
      recoveryTasks.reduce((s, t) => s + t.estimatedDurationMinutes, 0) /
        recoveryTasks.length,
    )
  : 0;

const stats = [
  {
    label: "Material Recovered",
    value: (totalLbs / 2000).toFixed(1),
    unit: "tons",
    icon: Weight,
    accent: "text-ops-green",
    chip: "bg-ops-green/10 text-ops-green",
  },
  {
    label: "Reuse Rate",
    value: `${recoveryRate}`,
    unit: "%",
    icon: Recycle,
    accent: "text-ops-green",
    chip: "bg-ops-green/10 text-ops-green",
  },
  {
    label: "Active Pickups",
    value: `${activePickups}`,
    unit: "in progress",
    icon: Truck,
    accent: "text-ops-blue",
    chip: "bg-ops-blue/10 text-ops-blue",
  },
  {
    label: "High-Priority Tasks",
    value: `${overdue}`,
    unit: "needs action",
    icon: TriangleAlert,
    accent: "text-ops-red",
    chip: "bg-ops-red/10 text-ops-red",
  },
  {
    label: "Batches Detected",
    value: `${materialBatches.length}`,
    unit: "today",
    icon: Boxes,
    accent: "text-ops-purple",
    chip: "bg-ops-purple/10 text-ops-purple",
  },
  {
    label: "Avg Pickup Time",
    value: `${avgPickup}`,
    unit: "min",
    icon: Clock,
    accent: "text-ops-amber",
    chip: "bg-ops-amber/10 text-ops-amber",
  },
];

export function OpsTopStrip() {
  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-ops-border/50 overflow-hidden rounded-2xl border border-ops-border/80 bg-ops-surface shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-3 px-5 py-4">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.chip}`}>
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="leading-tight">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-[22px] font-bold tracking-tight text-ops-ink">
                  {s.value}
                </span>
                <span className="text-[11px] text-ops-muted">{s.unit}</span>
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-ops-muted">
                {s.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
