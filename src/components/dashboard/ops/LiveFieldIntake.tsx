"use client";

import { useMemo } from "react";
import { Camera, MapPin, Scale, Leaf, Truck, Route, Radio, DollarSign } from "lucide-react";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import type { SpotReport } from "@/lib/spotReports";

/**
 * Live intake of field captures. The moment a worker submits a photo on the
 * mobile app, the report streams into the store and appears here — the
 * "dashboard updates on image" surface. Field captures (those with GPS coords)
 * are shown first since they're the freshest, location-anchored signals.
 */
export function LiveFieldIntake() {
  const spotReports = useMaterialOpsStore((s) => s.spotReports);
  const fieldDrops = useMemo(
    () => spotReports.filter((r) => r.coords),
    [spotReports],
  );

  // Every field capture rolls up into ONE live recovery batch (the Biltmore
  // drop) — show a single batch card keyed by its passport, not a card per item.
  const batch = useMemo(() => {
    if (fieldDrops.length === 0) return null;
    const newest = fieldDrops[0];
    const types = Array.from(new Set(fieldDrops.map((r) => r.ai.type)));
    return {
      newest,
      count: types.length,
      weightLbs: Math.round(
        fieldDrops.reduce((sum, r) => sum + (Number(r.ai.estWeightLbs) || 0), 0),
      ),
      co2eLbs:
        Math.round(
          fieldDrops.reduce((sum, r) => sum + (Number(r.ai.co2eLbs) || 0), 0) * 10,
        ) / 10,
      valueUsd: Math.round(
        fieldDrops.reduce((sum, r) => sum + (Number(r.ai.valueUsd) || 0), 0),
      ),
      types,
    };
  }, [fieldDrops]);

  if (batch === null) return null;

  return (
    <div className="rounded-2xl border border-ops-border/80 bg-ops-surface px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ops-ink">
          <Radio className="h-4 w-4 animate-pulse text-ops-green" />
          Live field intake
        </h2>
        <span className="rounded border border-ops-green/30 bg-ops-green/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ops-green">
          1 batch · {batch.count} items
        </span>
      </div>

      <BatchCard batch={batch} />
    </div>
  );
}

type FieldBatch = {
  newest: SpotReport;
  count: number;
  weightLbs: number;
  co2eLbs: number;
  valueUsd: number;
  types: string[];
};

function BatchCard({ batch }: Readonly<{ batch: FieldBatch }>) {
  const r = batch.newest;
  return (
    <div className="overflow-hidden rounded-lg border border-ops-border bg-ops-bg md:flex">
      <div className="relative h-28 w-full bg-gradient-to-br from-ops-navy to-black md:h-auto md:w-56 md:shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={r.photoDataUrl ?? "/props/biltmore-field-recovery.png"}
          alt="Biltmore field recovery"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
          <Camera className="h-3 w-3" />
          {r.passportId}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-ops-green/90 px-2 py-0.5 text-[10px] font-bold text-white">
          {Math.round(r.ai.confidence * 100)}%
        </span>
      </div>

      <div className="flex-1 p-3">
        <div className="text-sm font-semibold text-ops-ink">
          Biltmore Field Recovery
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ops-muted">
          <MapPin className="h-3 w-3 text-ops-blue" />
          {r.coords?.label?.split("·")[0]?.trim() ?? "Field capture"}
        </div>
        <div className="mt-1 text-[11px] text-ops-muted">
          {batch.count} items · {batch.types.join(", ")}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded border border-ops-border bg-ops-surface px-1.5 py-0.5 text-ops-ink">
            <Scale className="h-3 w-3 text-ops-blue" />~{batch.weightLbs} lbs
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-ops-border bg-ops-surface px-1.5 py-0.5 text-ops-ink">
            <Leaf className="h-3 w-3 text-ops-green" />
            {batch.co2eLbs} CO₂e
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-ops-border bg-ops-surface px-1.5 py-0.5 text-ops-ink">
            <DollarSign className="h-3 w-3 text-ops-green" />${batch.valueUsd}
          </span>
        </div>

        {r.disposal && (
          <div className="mt-2 rounded-md border border-ops-border bg-ops-surface p-2">
            <div className="flex items-center gap-1 text-[10.5px] font-semibold text-ops-blue">
              <Route className="h-3 w-3" />
              {r.disposal.path}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-ops-ink">
              <Truck className="h-3 w-3 text-ops-muted" />
              <span className="font-medium">{r.disposal.dropOff.name}</span>
            </div>
            <div className="mt-0.5 text-[10.5px] text-ops-muted">
              {r.disposal.distanceMi} mi · ETA {r.disposal.etaMin} min
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
