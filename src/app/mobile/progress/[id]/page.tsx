"use client";

import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Camera, MapPin, CheckCircle2 } from "lucide-react";

export default function MobileProgressPage({
  params,
}: {
  params: { id: string };
}) {
  const { taskComplete, completeTask } = useMaterialOpsStore();
  const { showToast } = useToast();
  const complete = taskComplete[params.id];

  const timeline = [
    { label: "Pick Up", state: "done" },
    { label: "Verify Batch", state: "done" },
    { label: "Transport", state: complete ? "done" : "active" },
    { label: "Drop Off", state: complete ? "done" : "pending" },
    { label: "Upload Proof", state: complete ? "done" : "pending" },
  ] as const;

  function handleComplete() {
    completeTask(params.id);
    showToast("Task complete. Chain of custody updated.");
  }

  return (
    <MobileShell>
      <div className="space-y-5">
        <Link
          href={`/mobile/tasks/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-ops-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Task
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ops-ink">
            Task Progress
          </h1>
          <StatusPill status={complete ? "complete" : "in-transit"} />
        </div>

        <GlassCard className="p-4">
          <ol className="space-y-0">
            {timeline.map((step, i) => (
              <li key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                      step.state === "done" &&
                        "border-ops-green/40 bg-ops-green/12 text-ops-green",
                      step.state === "active" &&
                        "border-ops-blue/50 bg-ops-blue/12 text-ops-blue",
                      step.state === "pending" &&
                        "border-ops-border bg-ops-bg text-ops-muted",
                    )}
                  >
                    {step.state === "done" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div
                      className={cn(
                        "h-7 w-px",
                        step.state === "done"
                          ? "bg-ops-green/40"
                          : "bg-ops-border",
                      )}
                    />
                  )}
                </div>
                <div className="pb-2.5 pt-1">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      step.state === "pending"
                        ? "text-ops-muted"
                        : "text-ops-ink",
                    )}
                  >
                    {step.label}
                  </div>
                  {step.state === "active" && (
                    <div className="text-xs text-ops-blue">In progress</div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500/30 to-teal-700/30">
              <Camera className="h-6 w-6 text-ops-green" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-ops-ink">
                Proof of Pickup
              </div>
              <div className="text-xs text-ops-muted">2 photos · Today, 2:30 PM</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-ops-muted">
                <MapPin className="h-3 w-3 text-ops-blue" />
                Stadium Bowl, Atlanta GA
              </div>
            </div>
            <button className="rounded-md border border-ops-border bg-ops-surface px-3 py-1.5 text-xs text-ops-ink">
              View
            </button>
          </div>
        </GlassCard>

        <GlassCard className="grid grid-cols-3 gap-2 p-4 text-center">
          <div>
            <div className="text-xs text-ops-muted">Distance</div>
            <div className="text-sm font-semibold text-ops-ink">12.4 mi</div>
          </div>
          <div>
            <div className="text-xs text-ops-muted">Weight</div>
            <div className="text-sm font-semibold text-ops-ink">320 lbs</div>
          </div>
          <div>
            <div className="text-xs text-ops-muted">Value</div>
            <div className="text-sm font-semibold text-ops-ink">$420</div>
          </div>
        </GlassCard>

        {complete ? (
          <div className="flex items-center justify-center gap-2 rounded-md border border-ops-green/30 bg-ops-green/8 py-4 text-sm font-semibold text-ops-green">
            <CheckCircle2 className="h-5 w-5 text-ops-green" />
            Task complete. Chain of custody updated.
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ops-green py-4 text-sm font-semibold text-white"
          >
            <Check className="h-5 w-5" />
            Mark Task Complete
          </button>
        )}
      </div>
    </MobileShell>
  );
}
