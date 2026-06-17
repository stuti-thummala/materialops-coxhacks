"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { materialBatches, zoneById } from "@/lib/mockData";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { buildLiveFieldBatch } from "@/lib/spotReports";
import {
  formatUsd,
  formatNumber,
  formatWeight,
  titleCase,
} from "@/lib/formatters";
import type { BatchStatus, MaterialBatch, RecoveryPath } from "@/lib/types";
import {
  Info,
  Boxes,
  Package,
  Scale,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Clock,
  ArrowUpDown,
  Recycle,
  RefreshCw,
  Gift,
  Leaf,
  Sparkles,
  Trash2,
  ShieldCheck,
} from "lucide-react";

type SortKey = "priority" | "value" | "weight";
type StatusFilter = "all" | BatchStatus;

const PRIORITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "priority", label: "Priority" },
  { id: "value", label: "Value" },
  { id: "weight", label: "Weight" },
];

const PATH_META: Record<
  RecoveryPath,
  { icon: typeof Recycle; className: string }
> = {
  reuse: { icon: RefreshCw, className: "text-ops-green" },
  recycle: { icon: Recycle, className: "text-ops-blue" },
  upcycle: { icon: Sparkles, className: "text-ops-purple" },
  donate: { icon: Gift, className: "text-ops-amber" },
  compost: { icon: Leaf, className: "text-ops-green" },
  landfill: { icon: Trash2, className: "text-ops-muted" },
};

const SIGNAL_TONE: Record<string, string> = {
  low: "text-ops-green",
  medium: "text-ops-amber",
  high: "text-ops-red",
};

export default function BatchesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const spotReports = useMaterialOpsStore((s) => s.spotReports);

  // The live field capture from the mobile app (Biltmore) folds into a single
  // batch — one passport for the whole drop, not a row per item. It carries a
  // small recoverable value and low priority so it never jumps the queue.
  const liveBatch = useMemo<MaterialBatch | null>(
    () => buildLiveFieldBatch(spotReports),
    [spotReports],
  );

  const allBatches = useMemo(
    () => (liveBatch ? [liveBatch, ...materialBatches] : materialBatches),
    [liveBatch],
  );

  const totals = useMemo(() => {
    return allBatches.reduce(
      (acc, b) => {
        acc.items += b.items;
        acc.weight += b.estimatedWeightLbs;
        acc.value += b.estimatedValueUsd;
        if (b.status === "ready") acc.ready += 1;
        return acc;
      },
      { items: 0, weight: 0, value: 0, ready: 0 },
    );
  }, [allBatches]);

  const statusTabs = useMemo(() => {
    const counts = new Map<BatchStatus, number>();
    for (const b of allBatches) {
      counts.set(b.status, (counts.get(b.status) ?? 0) + 1);
    }
    const tabs: { id: StatusFilter; label: string; count: number }[] = [
      { id: "all", label: "All", count: allBatches.length },
    ];
    for (const [status, count] of counts) {
      tabs.push({ id: status, label: titleCase(status), count });
    }
    return tabs;
  }, [allBatches]);

  const visibleBatches = useMemo(() => {
    const filtered = allBatches.filter(
      (b) => statusFilter === "all" || b.status === statusFilter,
    );
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "value") return b.estimatedValueUsd - a.estimatedValueUsd;
      if (sortKey === "weight")
        return b.estimatedWeightLbs - a.estimatedWeightLbs;
      return (
        (PRIORITY_RANK[a.priority] ?? 99) - (PRIORITY_RANK[b.priority] ?? 99)
      );
    });
    return sorted;
  }, [statusFilter, sortKey, allBatches]);

  return (
    <AppShell
      header={
        <PageHeader
          title="Material Batches"
          subtitle="Similar materials grouped into recovery batches across all zones"
        />
      }
    >
      <div className="animate-fade-up space-y-6">
        <GlassCard className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-ops-blue" />
          <p className="text-sm leading-relaxed text-ops-muted">
            A <span className="font-medium text-ops-ink">batch</span> groups
            like materials recovered across zones into one trackable unit — with
            an estimated value, the best recovery path, and a destination
            partner. Filter by status to see what&apos;s{" "}
            <span className="font-medium text-ops-ink">ready to dispatch</span>,
            sort to focus on the highest-value loads, then open any batch for its
            full item breakdown.
          </p>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryStat
            icon={Boxes}
            label="Total Batches"
            value={formatNumber(allBatches.length)}
            accent="text-ops-blue"
          />
          <SummaryStat
            icon={Package}
            label="Items Grouped"
            value={formatNumber(totals.items)}
            accent="text-ops-purple"
          />
          <SummaryStat
            icon={Scale}
            label="Total Weight"
            value={formatWeight(totals.weight)}
            accent="text-ops-amber"
          />
          <SummaryStat
            icon={DollarSign}
            label="Recoverable Value"
            value={formatUsd(totals.value)}
            accent="text-ops-green"
          />
        </div>

        {totals.ready > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-ops-green/30 bg-ops-green/8 px-4 py-2.5 text-sm text-ops-ink">
            <CheckCircle2 className="h-4 w-4 text-ops-green" />
            <span className="font-semibold text-ops-green">
              {totals.ready} {totals.ready === 1 ? "batch" : "batches"} ready
            </span>
            <span className="text-ops-muted">
              to dispatch right now — head to Dispatch to assign crews.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.id;
              const tabClass = active
                ? "inline-flex items-center gap-1.5 rounded-full border border-ops-navy bg-ops-navy px-3 py-1.5 text-xs font-semibold text-white"
                : "inline-flex items-center gap-1.5 rounded-full border border-ops-border bg-ops-surface px-3 py-1.5 text-xs font-semibold text-ops-muted hover:border-ops-muted/50";
              const countClass = active
                ? "rounded-full bg-white/20 px-1.5 text-[10px]"
                : "rounded-full bg-ops-border px-1.5 text-[10px] text-ops-ink";
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={tabClass}
                >
                  {tab.label}
                  <span className={countClass}>{tab.count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-ops-muted" />
            <span className="text-xs font-medium uppercase tracking-wide text-ops-muted">
              Sort
            </span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.id;
                const optClass = active
                  ? "rounded-md border border-ops-navy bg-ops-navy px-2.5 py-1 text-xs font-semibold text-white"
                  : "rounded-md border border-ops-border bg-ops-surface px-2.5 py-1 text-xs font-semibold text-ops-muted hover:border-ops-muted/50";
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortKey(opt.id)}
                    className={optClass}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {visibleBatches.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <p className="text-sm text-ops-muted">
              No batches with this status right now.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleBatches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function BatchCard({ batch }: { readonly batch: MaterialBatch }) {
  const path = PATH_META[batch.bestPath] ?? PATH_META.recycle;
  const PathIcon = path.icon;
  const contaminationTone =
    SIGNAL_TONE[batch.contaminationScore] ?? "text-ops-muted";
  return (
    <Link href={`/batches/${batch.id}`}>
      <GlassCard className="h-full p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold text-ops-ink">
              {batch.id}
            </div>
            <div className="truncate text-sm text-ops-muted">
              {batch.material}
            </div>
            <div className="truncate text-xs text-ops-muted/80">
              {batch.materialType}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StatusPill status={batch.status} />
            <StatusPill status={batch.priority} variant="priority" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <Stat label="Items" value={batch.items.toLocaleString()} />
          <Stat label="Weight" value={formatWeight(batch.estimatedWeightLbs)} />
          <Stat label="Value" value={formatUsd(batch.estimatedValueUsd)} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-ops-ink">
            <PathIcon className={`h-3.5 w-3.5 ${path.className}`} />
            {titleCase(batch.bestPath)}
            <span className="text-ops-muted">→ {batch.destination}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-ops-muted">
            <ShieldCheck className={`h-3.5 w-3.5 ${contaminationTone}`} />
            {titleCase(batch.contaminationScore)} contamination
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-ops-border pt-3 text-xs text-ops-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {zoneById[batch.sourceZone]?.shortName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {batch.eta}
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </GlassCard>
    </Link>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  readonly icon: typeof Boxes;
  readonly label: string;
  readonly value: string;
  readonly accent: string;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ops-muted">
        <Icon className={`h-4 w-4 ${accent}`} />
        {label}
      </div>
      <div className="mt-2 font-display text-xl font-semibold text-ops-ink">
        {value}
      </div>
    </GlassCard>
  );
}

function Stat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-ops-muted">
        {label}
      </div>
      <div className="font-semibold text-ops-ink">{value}</div>
    </div>
  );
}
