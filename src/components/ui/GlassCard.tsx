import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassCard({ children, className, glow }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-ops-border bg-ops-surface transition",
        "hover:border-ops-muted/50",
        glow && "shadow-[0_1px_3px_rgba(24,32,38,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
