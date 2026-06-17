interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight text-ops-ink">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-ops-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
