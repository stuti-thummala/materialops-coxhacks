import { GlassCard } from "@/components/ui/GlassCard";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaterialBatch, BatchStatus } from "@/lib/types";

type StepState = "done" | "active" | "pending";

const STEPS = [
  { label: "Batch Created", hint: "Grouped from scanned items" },
  { label: "Scanned & Verified", hint: "Material + condition confirmed" },
  { label: "Ready for Dispatch", hint: "Passport issued" },
  { label: "Crew Assigned", hint: "Pickup scheduled" },
  { label: "Picked Up", hint: "Collected from source zone" },
  { label: "Delivered", hint: "En route to partner" },
  { label: "Received by Partner", hint: "Recovery confirmed" },
] as const;

/** The step index a batch is currently working on, given its status. */
const STATUS_STAGE: Record<BatchStatus, number> = {
  staging: 1,
  ready: 2,
  scheduled: 3,
  assigned: 3,
  collected: 4,
  "in-transit": 5,
  delivered: 6,
  verified: 7,
};

function stateFor(stepIndex: number, stage: number): StepState {
  if (stepIndex < stage) return "done";
  if (stepIndex === stage) return "active";
  return "pending";
}

export function ChainOfCustody({ batch }: Readonly<{ batch?: MaterialBatch }>) {
  const stage = batch ? STATUS_STAGE[batch.status] : 3;
  const partner = batch?.destination ?? "Recovery partner";
  const done = Math.min(stage, STEPS.length);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight text-ops-ink">
          Chain of Custody
        </h2>
        <span className="rounded-full bg-ops-green/12 px-2.5 py-1 text-xs font-semibold text-ops-green">
          {done}/{STEPS.length} verified
        </span>
      </div>
      <p className="mt-1 text-xs text-ops-muted">
        Every hand-off is logged to the material passport.
      </p>

      <ol className="mt-5 space-y-0">
        {STEPS.map((step, i) => {
          const state = stateFor(i, stage);
          const label =
            step.label === "Received by Partner"
              ? `Received by ${partner}`
              : step.label;
          return (
            <li key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                    state === "done" &&
                      "border-ops-green/40 bg-ops-green/12 text-ops-green",
                    state === "active" &&
                      "border-ops-blue/50 bg-ops-blue/12 text-ops-blue",
                    state === "pending" &&
                      "border-ops-border bg-ops-bg text-ops-muted",
                  )}
                >
                  {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-8 w-px",
                      state === "done" ? "bg-ops-green/40" : "bg-ops-border",
                    )}
                  />
                )}
              </div>
              <div className="pb-3 pt-1">
                <div
                  className={cn(
                    "text-sm font-medium",
                    state === "pending" ? "text-ops-muted" : "text-ops-ink",
                  )}
                >
                  {label}
                </div>
                <div
                  className={cn(
                    "text-xs",
                    state === "active" ? "text-ops-blue" : "text-ops-muted",
                  )}
                >
                  {state === "active" ? "In progress" : step.hint}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
