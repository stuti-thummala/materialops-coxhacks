import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function GradientButton({
  variant = "primary",
  className,
  children,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-ops-green text-white hover:bg-ops-green/90",
        variant === "secondary" &&
          "border border-ops-border bg-ops-surface text-ops-ink hover:bg-ops-bg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
