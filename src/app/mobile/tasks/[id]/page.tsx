"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { MiniRouteMap } from "@/components/mobile/MiniRouteMap";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { ArrowLeft, Navigation, Check, Clock, Route } from "lucide-react";

const steps = [
  "Check in at Stadium Bowl",
  "Locate and Recover Batch VB-104",
  "Transport to Reuse Destination",
  "Check in & Complete",
];

export default function MobileTaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { taskAccepted, acceptTask } = useMaterialOpsStore();
  const accepted = taskAccepted[params.id];

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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ops-ink">
              Assigned Task
            </h1>
            <p className="text-sm text-ops-muted">Task ID: {params.id}</p>
          </div>
          <StatusPill status={accepted ? "accepted" : "high"} variant={accepted ? "status" : "priority"} />
        </div>

        <GlassCard className="space-y-3 p-4">
          <Row label="Recover Batch" value="VB-104" />
          <Row label="Crew" value="Cleanup Crew" />
          <Row label="From" value="Stadium Bowl, Zone SB-01" />
          <Row label="To" value="Parking / Logistics, Zone PL-02" />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Mini icon={<Clock className="h-4 w-4" />} label="ETA" value="2:45 PM" />
            <Mini icon={<Route className="h-4 w-4" />} label="Distance" value="1.2 mi" />
          </div>
        </GlassCard>

        <MiniRouteMap start="Stadium Bowl" end="Parking / Logistics" />

        <GlassCard className="p-4">
          <div className="text-sm font-semibold text-ops-ink">Task Steps</div>
          <ol className="mt-3 space-y-3">
            {steps.map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ops-border bg-ops-bg text-xs text-ops-muted">
                  {i + 1}
                </span>
                <span className="text-sm text-ops-ink/80">{step}</span>
              </li>
            ))}
          </ol>
        </GlassCard>

        <GlassCard className="grid grid-cols-3 gap-2 p-4 text-center">
          <div>
            <div className="text-xs text-ops-muted">Weight</div>
            <div className="text-sm font-semibold text-ops-ink">320 lbs</div>
          </div>
          <div>
            <div className="text-xs text-ops-muted">Items</div>
            <div className="text-sm font-semibold text-ops-ink">12</div>
          </div>
          <div>
            <div className="text-xs text-ops-muted">Type</div>
            <div className="text-sm font-semibold text-ops-ink">Reusable</div>
          </div>
        </GlassCard>

        <div className="flex gap-3 pb-2">
          {!accepted ? (
            <>
              <button className="flex-1 rounded-md border border-ops-border bg-ops-surface py-3.5 text-sm font-semibold text-ops-ink">
                Decline Task
              </button>
              <button
                onClick={() => acceptTask(params.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-ops-green py-3.5 text-sm font-semibold text-white"
              >
                <Check className="h-4 w-4" />
                Accept Task
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push(`/mobile/progress/${params.id}`)}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-ops-green py-3.5 text-sm font-semibold text-white"
            >
              <Navigation className="h-4 w-4" />
              Start Route
            </button>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ops-muted">{label}</span>
      <span className="font-medium text-ops-ink">{value}</span>
    </div>
  );
}

function Mini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-ops-border bg-ops-bg p-2.5">
      <span className="text-ops-blue">{icon}</span>
      <div>
        <div className="text-xs text-ops-muted">{label}</div>
        <div className="text-sm font-semibold text-ops-ink">{value}</div>
      </div>
    </div>
  );
}
