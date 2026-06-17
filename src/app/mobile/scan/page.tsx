"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { useToast } from "@/components/ui/Toast";
import { materialBatches, recoveryZones } from "@/lib/mockData";
import { titleCase } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { makeBiltmoreDrop, type SpotKind } from "@/lib/spotReports";
import {
  ArrowLeft,
  ScanLine,
  Plus,
  FolderPlus,
  Check,
  Sparkles,
  Radio,
} from "lucide-react";

type Detection = {
  item: string;
  materialType: string;
  condition: "poor" | "fair" | "good" | "excellent";
  reusePotential: "low" | "medium" | "high";
  path: string;
  confidence: number;
  /** spot-report material kind, used to build the field drop on accept */
  kind: SpotKind;
  /** id of the open batch this item belongs with, or null if it's a new material */
  matchBatchId: string | null;
};

// Live-demo sequence: empty water bottle, two lanyards, a reusable cup —
// each one groups into an existing open batch.
const SCENARIOS: Detection[] = [
  {
    item: "Water Bottle",
    materialType: "PET plastic",
    condition: "good",
    reusePotential: "medium",
    path: "Recycle",
    confidence: 0.95,
    kind: "bottles",
    matchBatchId: "WB-210",
  },
  {
    item: "Lanyard",
    materialType: "Polyester",
    condition: "good",
    reusePotential: "high",
    path: "Clean & Reuse",
    confidence: 0.93,
    kind: "lanyards",
    matchBatchId: "LY-072",
  },
  {
    item: "Lanyard",
    materialType: "Polyester",
    condition: "good",
    reusePotential: "high",
    path: "Clean & Reuse",
    confidence: 0.92,
    kind: "lanyards",
    matchBatchId: "LY-072",
  },
  {
    item: "Reusable Cup",
    materialType: "PP plastic",
    condition: "good",
    reusePotential: "high",
    path: "Wash & Restock",
    confidence: 0.97,
    kind: "cups",
    matchBatchId: "CU-091",
  },
];

function zoneName(zoneId: string): string {
  return recoveryZones.find((z) => z.id === zoneId)?.shortName ?? "Unknown zone";
}

export default function MobileScanPage() {
  const { scanCount, addScannedItem, addSpotReport } = useMaterialOpsStore();
  const { showToast } = useToast();

  const [scanning, setScanning] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [captured, setCaptured] = useState(false);
  const [pendingAdds, setPendingAdds] = useState<Record<string, number>>({});
  const [addedThisItem, setAddedThisItem] = useState(false);
  const [accepted, setAccepted] = useState(false);

  function handleScan() {
    setScanning(true);
    setDetection(null);
    setAddedThisItem(false);
    const next = SCENARIOS[scanIndex % SCENARIOS.length];
    setScanIndex((i) => i + 1);
    setTimeout(() => {
      setDetection(next);
      setScanning(false);
      setCaptured(true);
    }, 850);
  }

  const matchBatch = detection
    ? materialBatches.find((b) => b.id === detection.matchBatchId)
    : undefined;

  const batchCount = matchBatch
    ? matchBatch.items + (pendingAdds[matchBatch.id] ?? 0)
    : 0;

  let badgeLabel = "Point at a material";
  if (scanning) {
    badgeLabel = "Scanning…";
  } else if (detection) {
    badgeLabel = `${detection.item} Detected · ${Math.round(detection.confidence * 100)}%`;
  }

  function handleAdd() {
    if (!matchBatch) return;
    addScannedItem();
    setPendingAdds((p) => ({
      ...p,
      [matchBatch.id]: (p[matchBatch.id] ?? 0) + 1,
    }));
    setAddedThisItem(true);
    showToast(
      `Added to ${matchBatch.material} (${matchBatch.id}). Now ${
        batchCount + 1
      } items grouped.`,
    );
  }

  function handleNewBatch() {
    showToast(
      `New batch started for ${detection?.item ?? "this item"}. Ready for the next scan.`,
    );
  }

  function handleAcceptRecovery() {
    if (!detection) return;
    addSpotReport(makeBiltmoreDrop(detection.kind, detection.item));
    setAccepted(true);
    showToast(
      "Recovery accepted at the Biltmore Innovation Center — live to the command center.",
    );
  }

  return (
    <MobileShell>
      <div className="space-y-5">
        <Link
          href="/mobile/tasks"
          className="inline-flex items-center gap-2 text-sm text-ops-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Tasks
        </Link>

        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ops-ink">
            Scan Item
          </h1>
          <p className="text-sm text-ops-muted">
            Point your camera at a material to identify and sort.
          </p>
        </div>

        {/* preview */}
        <div className="relative h-72 w-full overflow-hidden rounded-lg border border-ops-border bg-[radial-gradient(circle_at_50%_40%,rgba(31,157,102,0.25),#0D2533)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(159,195,230,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(159,195,230,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute inset-8 flex items-center justify-center">
            <div
              className={cn(
                "h-40 w-24 rotate-6 rounded-lg bg-gradient-to-b from-emerald-500/60 to-teal-700/60 shadow-2xl transition-opacity",
                captured ? "opacity-100" : "opacity-20",
              )}
            />
          </div>
          {/* scanning sweep line */}
          {scanning && (
            <div className="absolute inset-x-6 top-6 h-0.5 animate-scan-sweep rounded-full bg-ops-green/80 shadow-[0_0_12px_2px_rgba(31,157,102,0.7)]" />
          )}
          {/* corner brackets */}
          {[
            "left-4 top-4 border-l-2 border-t-2",
            "right-4 top-4 border-r-2 border-t-2",
            "left-4 bottom-4 border-l-2 border-b-2",
            "right-4 bottom-4 border-r-2 border-b-2",
          ].map((pos) => (
            <div
              key={pos}
              className={`absolute h-8 w-8 border-ops-green/80 ${pos}`}
            />
          ))}
          <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full border border-ops-green/40 bg-ops-surface/95 px-3 py-1.5 text-xs font-semibold text-ops-green backdrop-blur">
            <ScanLine className="h-3.5 w-3.5" />
            {badgeLabel}
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ops-green px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {scanning ? "Identifying…" : "Scan Item"}
          </button>
        </div>

        {detection && (
          <>
            <GlassCard className="p-4">
              <div className="text-sm font-semibold text-ops-ink">
                Detection Result
              </div>
              <div className="mt-3 divide-y divide-ops-border">
                {[
                  { label: "Material", value: detection.item },
                  { label: "Material Type", value: detection.materialType },
                  { label: "Condition", value: titleCase(detection.condition) },
                  {
                    label: "Reuse Potential",
                    value: titleCase(detection.reusePotential),
                  },
                  { label: "Recommended Path", value: detection.path },
                ].map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-ops-muted">{d.label}</span>
                    <span className="font-medium text-ops-ink">{d.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* grouping decision */}
            <GlassCard
              className={cn(
                "p-4",
                matchBatch
                  ? "border-ops-green/40 bg-ops-green/[0.04]"
                  : "border-ops-blue/40 bg-ops-blue/[0.04]",
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  className={cn(
                    "h-4 w-4",
                    matchBatch ? "text-ops-green" : "text-ops-blue",
                  )}
                />
                <span className="text-sm font-semibold text-ops-ink">
                  {matchBatch
                    ? "Add to an existing batch"
                    : "Start a new batch"}
                </span>
              </div>

              {matchBatch ? (
                <>
                  <p className="mt-2 text-xs text-ops-muted">
                    This item matches an open batch nearby. Grouping keeps one
                    passport per material type.
                  </p>
                  <div className="mt-3 rounded-md border border-ops-border bg-ops-surface p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ops-ink">
                        {matchBatch.material}
                      </span>
                      <span className="rounded-full bg-ops-green/12 px-2 py-0.5 text-xs font-semibold text-ops-green">
                        {matchBatch.id}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-ops-muted">
                      {batchCount} items · {zoneName(matchBatch.sourceZone)} ·{" "}
                      {titleCase(matchBatch.status)}
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-ops-ink">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-ops-green" />
                      Same material — {matchBatch.material}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-ops-green" />
                      Same source zone — {zoneName(matchBatch.sourceZone)}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-ops-green" />
                      Batch still open — heading to {matchBatch.destination}
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="mt-2 text-xs text-ops-muted">
                    No open batch matches this material, so it should start its
                    own group with a fresh passport.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-ops-ink">
                    <li className="flex items-center gap-2">
                      <span className="text-ops-blue" aria-hidden>&bull;</span>
                      <span>New material type — {detection.item}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-ops-blue" aria-hidden>&bull;</span>
                      <span>No open batch within this zone</span>
                    </li>
                  </ul>
                </>
              )}
            </GlassCard>

            <div className="flex gap-3 pb-2">
              <button
                onClick={handleNewBatch}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md py-3.5 text-sm font-semibold",
                  matchBatch
                    ? "border border-ops-border bg-ops-surface text-ops-ink"
                    : "bg-ops-blue text-white",
                )}
              >
                <FolderPlus className="h-4 w-4" />
                New Batch
              </button>
              <button
                onClick={handleAdd}
                disabled={!matchBatch}
                className={cn(
                  "flex flex-[1.4] items-center justify-center gap-2 rounded-md py-3.5 text-sm font-semibold",
                  matchBatch
                    ? "bg-ops-green text-white"
                    : "cursor-not-allowed border border-ops-border bg-ops-bg text-ops-muted",
                )}
              >
                <Plus className="h-4 w-4" />
                {matchBatch
                  ? `Add to ${matchBatch.id} (${batchCount}→${batchCount + 1})`
                  : "No matching batch"}
              </button>
            </div>

            {addedThisItem && (
              <GlassCard className="border-ops-green/40 bg-ops-green/[0.04] p-4">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-ops-green" />
                  <span className="text-sm font-semibold text-ops-ink">
                    Accept recovery for ops
                  </span>
                </div>
                <p className="mt-2 text-xs text-ops-muted">
                  Confirm this material is staged at the Biltmore Innovation
                  Center. The command center opens a live recovery line and the
                  ops agent factors it into the next dispatch.
                </p>
                <button
                  onClick={handleAcceptRecovery}
                  disabled={accepted}
                  className={cn(
                    "mt-3 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold",
                    accepted
                      ? "cursor-default border border-ops-green/40 bg-ops-green/12 text-ops-green"
                      : "bg-ops-green text-white",
                  )}
                >
                  {accepted ? (
                    <>
                      <Check className="h-4 w-4" />
                      Recovery live to command center
                    </>
                  ) : (
                    <>
                      <Radio className="h-4 w-4" />
                      Accept recovery
                    </>
                  )}
                </button>
              </GlassCard>
            )}

            <p className="-mt-2 text-center text-[11px] text-ops-muted">
              {scanCount} items scanned this shift
            </p>
          </>
        )}
      </div>
    </MobileShell>
  );
}
