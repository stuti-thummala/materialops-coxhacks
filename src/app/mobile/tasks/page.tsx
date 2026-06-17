import Link from "next/link";
import { MobileShell } from "@/components/layout/MobileShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { ArrowRight, MapPin, Clock, Weight } from "lucide-react";

interface MobileTask {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  from: string;
  to: string;
  eta?: string;
  weight?: string;
  cta?: string;
}

const tasks: MobileTask[] = [
  {
    id: "T-24781",
    title: "Recover VB-104 Vinyl Banners",
    priority: "high",
    from: "Stadium Bowl",
    to: "Parking / Logistics",
    eta: "2:45 PM",
    weight: "320 lbs",
    cta: "Start Task",
  },
  {
    id: "T-24782",
    title: "Move CU-091 Reusable Cups",
    priority: "medium",
    from: "Home Depot Backyard",
    to: "CupCycle ATL",
    eta: "3:15 PM",
  },
  {
    id: "T-24783",
    title: "Verify CT-033 Carpet Tiles",
    priority: "low",
    from: "Fan Plaza",
    to: "Interface Flooring",
  },
];

export default function MobileTasksPage() {
  return (
    <MobileShell>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ops-ink">My Tasks</h1>
          <p className="text-sm text-ops-muted">Today&apos;s recovery assignments</p>
        </div>

        <div className="flex gap-2">
          <Chip label="Active" value="2" />
          <Chip label="Completed" value="7" />
          <Chip label="Zone" value="Stadium Bowl" />
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <Link key={task.id} href={`/mobile/tasks/${task.id}`}>
              <GlassCard className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-base font-semibold text-ops-ink">
                    {task.title}
                  </div>
                  <StatusPill status={task.priority} variant="priority" />
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-ops-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-ops-blue" />
                    {task.from} → {task.to}
                  </div>
                  {task.eta && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-ops-blue" />
                      ETA {task.eta}
                    </div>
                  )}
                  {task.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-ops-blue" />
                      {task.weight}
                    </div>
                  )}
                </div>

                {task.cta ? (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-ops-green py-3 text-sm font-semibold text-white">
                    {task.cta}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="mt-4 flex items-center justify-end text-sm text-ops-blue">
                    View task
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-md border border-ops-border bg-ops-surface px-3 py-2 text-center">
      <div className="text-xs text-ops-muted">{label}</div>
      <div className="text-sm font-semibold text-ops-ink">{value}</div>
    </div>
  );
}
