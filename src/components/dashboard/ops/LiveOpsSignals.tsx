"use client";

import { useMemo } from "react";
import {
  PackageOpen,
  AlertOctagon,
  Recycle,
  CheckCircle2,
  Truck,
  Boxes,
} from "lucide-react";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import type { SpotReport } from "@/lib/spotReports";

type SignalStatus = "Action Needed" | "Monitoring" | "Auto-Resolved" | "Completed";

interface Signal {
  time: string;
  zone: string;
  issue: string;
  action: string;
  status: SignalStatus;
  icon: typeof PackageOpen;
  accent: string;
  live?: boolean;
}

const statusStyle: Record<SignalStatus, string> = {
  "Action Needed": "bg-ops-red/12 text-ops-red border-ops-red/25",
  Monitoring: "bg-ops-amber/12 text-ops-amber border-ops-amber/25",
  "Auto-Resolved": "bg-ops-blue/12 text-ops-blue border-ops-blue/25",
  Completed: "bg-ops-green/12 text-ops-green border-ops-green/25",
};

const signals: Signal[] = [
  {
    time: "14:32",
    zone: "North Gate",
    issue: "Cardboard volume exceeding 90% of crew capacity",
    action: "Dispatch 1 additional crew to clear backlog",
    status: "Action Needed",
    icon: Boxes,
    accent: "text-ops-red",
  },
  {
    time: "14:26",
    zone: "Concourse",
    issue: "Contamination detected in recyclables stream (sort line 2)",
    action: "Flag batch CT-033 for manual review before dispatch",
    status: "Monitoring",
    icon: AlertOctagon,
    accent: "text-ops-amber",
  },
  {
    time: "14:19",
    zone: "Fan Plaza",
    issue: "320 reusable cups identified for return to vendor",
    action: "Route to Vendor Village wash station",
    status: "Auto-Resolved",
    icon: Recycle,
    accent: "text-ops-blue",
  },
  {
    time: "14:07",
    zone: "Loading Dock",
    issue: "Crew 7 completed pickup of batch VINYL-042",
    action: "Staged for GreenLoop partner pickup at Gate 3",
    status: "Completed",
    icon: CheckCircle2,
    accent: "text-ops-green",
  },
  {
    time: "13:58",
    zone: "West Entrance",
    issue: "New batch detected — mixed PET bottles, 180 kg",
    action: "Assigned to Crew 3 standard collection route",
    status: "Monitoring",
    icon: PackageOpen,
    accent: "text-ops-amber",
  },
  {
    time: "13:44",
    zone: "Vendor Village",
    issue: "Crew 3 en route to Storage Bay 4 with compostables",
    action: "ETA 6 min — no action required",
    status: "Completed",
    icon: Truck,
    accent: "text-ops-green",
  },
];

/** Strip the street-address tail from a zone label for the compact list. */
function shortZone(label: string): string {
  return label.split(" · ")[0];
}

/** Roll the live field captures into a single "signal just came in" entry. */
function buildLiveSignal(drops: ReadonlyArray<SpotReport>): Signal | null {
  if (drops.length === 0) return null;
  const newest = drops[0];
  const types = Array.from(new Set(drops.map((r) => r.ai.type)));
  const value = Math.round(
    drops.reduce((sum, r) => sum + (Number(r.ai.valueUsd) || 0), 0),
  );
  const dest = newest.disposal?.dropOff.name ?? "ReUse Hub ATL";
  return {
    time: newest.minutesAgo <= 0 ? "Just now" : `${newest.minutesAgo}m ago`,
    zone: shortZone(newest.zoneName),
    issue: `New field batch — ${types.length} item${types.length === 1 ? "" : "s"} (${types.join(", ")}), $${value} recoverable`,
    action: `Route to ${dest} · passport ${newest.passportId}`,
    status: "Monitoring",
    icon: PackageOpen,
    accent: "text-ops-green",
    live: true,
  };
}

export function LiveOpsSignals() {
  const spotReports = useMaterialOpsStore((s) => s.spotReports);
  const fieldDrops = useMemo(
    () => spotReports.filter((r) => r.coords),
    [spotReports],
  );
  const liveSignal = useMemo(() => buildLiveSignal(fieldDrops), [fieldDrops]);
  const feed = useMemo(
    () => (liveSignal ? [liveSignal, ...signals] : signals),
    [liveSignal],
  );

  return (
    <section className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ops-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ops-green opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ops-green" />
          </span>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ops-ink">
            Live Ops Signals
          </h2>
        </div>
        <span className="text-[11px] font-medium text-ops-muted">
          {liveSignal ? `Updated ${liveSignal.time.toLowerCase()}` : "Last 30 min"}
        </span>
      </div>

      <div className="flex-1 divide-y divide-ops-border/50 overflow-y-auto">
        {feed.map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={`${s.time}-${s.zone}-${s.issue}`}
              className={`px-4 py-3.5 ${s.live ? "bg-ops-green/5" : ""}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.accent}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-[13px] font-semibold text-ops-ink">
                      {s.zone}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-ops-muted">
                      {s.time}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-snug text-ops-ink/85">
                    {s.issue}
                  </p>
                  <div className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-snug text-ops-muted">
                    <span className="font-semibold uppercase tracking-wide text-ops-muted/80">
                      Action
                    </span>
                    <span>{s.action}</span>
                  </div>
                  <span
                    className={`mt-2 inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[s.status]}`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
