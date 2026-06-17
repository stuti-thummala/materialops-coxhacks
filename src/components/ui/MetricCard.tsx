import { GlassCard } from "./GlassCard";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: React.ReactNode;
}

export function MetricCard({ label, value, delta, icon }: MetricCardProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ops-blue/10 text-ops-blue">
          {icon}
        </div>
        {delta && (
          <span className="rounded border border-ops-green/30 bg-ops-green/10 px-2 py-0.5 text-xs font-semibold text-ops-green">
            {delta}
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-3xl font-bold tracking-tight text-ops-ink">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-ops-muted">
        {label}
      </div>
    </GlassCard>
  );
}
