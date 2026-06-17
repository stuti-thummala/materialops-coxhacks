"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { materialBatches, zoneById } from "@/lib/mockData";
import { formatWeight } from "@/lib/formatters";
import type { MaterialBatch } from "@/lib/types";

type ColumnKey = "ready" | "progress" | "review" | "completed";

const columnMeta: { key: ColumnKey; title: string; accent: string }[] = [
  { key: "ready", title: "Ready to Dispatch", accent: "#2F6FDB" },
  { key: "progress", title: "In Progress", accent: "#C9831A" },
  { key: "review", title: "Needs Review", accent: "#C34A36" },
  { key: "completed", title: "Completed", accent: "#1F9D66" },
];

const priorityRank: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

type SortKey = "priority" | "weight" | "value";

function columnForBatch(batch: MaterialBatch): ColumnKey {
  if (batch.contaminationScore === "high" || batch.priority === "critical") {
    return "review";
  }
  if (["collected", "delivered", "verified"].includes(batch.status)) {
    return "completed";
  }
  if (batch.status === "ready") return "ready";
  return "progress";
}

export function RecoveryBoard() {
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("priority");

  const zones = useMemo(
    () => Array.from(new Set(materialBatches.map((b) => b.sourceZone))),
    [],
  );

  const filtered = useMemo(() => {
    const list = materialBatches.filter(
      (b) => zoneFilter === "all" || b.sourceZone === zoneFilter,
    );
    return [...list].sort((a, b) => {
      if (sortKey === "priority") {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }
      if (sortKey === "weight") {
        return b.estimatedWeightLbs - a.estimatedWeightLbs;
      }
      return b.estimatedValueUsd - a.estimatedValueUsd;
    });
  }, [zoneFilter, sortKey]);

  const columns = useMemo(
    () =>
      columnMeta.map((meta) => ({
        ...meta,
        cards: filtered.filter((b) => columnForBatch(b) === meta.key),
      })),
    [filtered],
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-ops-border/80 bg-ops-surface shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ops-border/70 px-5 py-3.5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ops-ink">
          Recovery Board
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="rounded border border-ops-border bg-ops-bg px-2 py-1 text-[11px] font-medium text-ops-ink"
            aria-label="Filter by zone"
          >
            <option value="all">All zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {zoneById[z]?.shortName ?? z}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded border border-ops-border bg-ops-bg px-2 py-1 text-[11px] font-medium text-ops-ink"
            aria-label="Sort batches"
          >
            <option value="priority">Sort: Priority</option>
            <option value="weight">Sort: Weight</option>
            <option value="value">Sort: Value</option>
          </select>
          <span className="text-[11px] font-medium text-ops-muted">
            {filtered.length} batches
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-ops-border md:grid-cols-2 md:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {columns.map((col) => (
          <div key={col.key} className="flex flex-col">
            <div className="flex items-center justify-between border-b border-ops-border bg-ops-bg/60 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: col.accent }}
                />
                <span className="text-[12px] font-semibold uppercase tracking-wide text-ops-ink">
                  {col.title}
                </span>
              </div>
              <span className="rounded bg-ops-bg px-1.5 py-0.5 text-[11px] font-semibold text-ops-muted">
                {col.cards.length}
              </span>
            </div>

            <div className="flex-1 space-y-2.5 p-3">
              {col.cards.length === 0 && (
                <p className="px-1 py-4 text-center text-[11.5px] text-ops-muted">
                  No batches
                </p>
              )}
              {col.cards.map((card) => (
                <Link
                  key={card.id}
                  href={`/batches/${card.id}`}
                  className="group block cursor-pointer border border-ops-border bg-white p-3 transition hover:border-ops-muted/50"
                  style={{ borderLeft: `3px solid ${col.accent}` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] font-semibold text-ops-ink">
                      {card.id}
                    </span>
                    <span className="text-[11px] font-medium text-ops-muted">
                      {formatWeight(card.estimatedWeightLbs)}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-ops-ink">
                    {card.material}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ops-muted">
                    {zoneById[card.sourceZone]?.name ?? card.sourceZone}
                  </div>
                  <div className="mt-2 flex items-center gap-1 border-t border-ops-border pt-2 text-[11.5px] text-ops-muted">
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <span className="truncate">{card.destination}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
