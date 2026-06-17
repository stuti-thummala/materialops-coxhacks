import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/formatters";

const statusStyles: Record<string, string> = {
  ready: "bg-ops-green/12 text-ops-green border-ops-green/30",
  assigned: "bg-ops-blue/12 text-ops-blue border-ops-blue/30",
  "in-transit": "bg-ops-blue/12 text-ops-blue border-ops-blue/30",
  collected: "bg-ops-green/12 text-ops-green border-ops-green/30",
  delivered: "bg-ops-green/12 text-ops-green border-ops-green/30",
  verified: "bg-ops-green/12 text-ops-green border-ops-green/30",
  scheduled: "bg-ops-muted/12 text-ops-muted border-ops-muted/30",
  staging: "bg-ops-amber/12 text-ops-amber border-ops-amber/30",
  suggested: "bg-ops-muted/12 text-ops-muted border-ops-muted/30",
  accepted: "bg-ops-blue/12 text-ops-blue border-ops-blue/30",
  "in-progress": "bg-ops-amber/12 text-ops-amber border-ops-amber/30",
  "picked-up": "bg-ops-blue/12 text-ops-blue border-ops-blue/30",
  "dropped-off": "bg-ops-green/12 text-ops-green border-ops-green/30",
  complete: "bg-ops-green/12 text-ops-green border-ops-green/30",
  available: "bg-ops-green/12 text-ops-green border-ops-green/30",
  offline: "bg-ops-muted/12 text-ops-muted border-ops-muted/30",
};

const priorityStyles: Record<string, string> = {
  low: "bg-ops-muted/12 text-ops-muted border-ops-muted/30",
  medium: "bg-ops-blue/12 text-ops-blue border-ops-blue/30",
  high: "bg-ops-amber/12 text-ops-amber border-ops-amber/30",
  critical: "bg-ops-red/12 text-ops-red border-ops-red/30",
};

interface StatusPillProps {
  status: string;
  variant?: "status" | "priority";
  className?: string;
}

export function StatusPill({
  status,
  variant = "status",
  className,
}: StatusPillProps) {
  const styles =
    variant === "priority" ? priorityStyles[status] : statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        styles ?? "bg-ops-muted/12 text-ops-muted border-ops-muted/30",
        className,
      )}
    >
      {titleCase(status)}
    </span>
  );
}
