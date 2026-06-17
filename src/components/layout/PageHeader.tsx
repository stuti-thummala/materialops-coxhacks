import { Bell } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-ops-border bg-[#e7e7e2]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-8 py-4">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ops-ink">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-ops-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-md border border-ops-border bg-white text-ops-muted transition hover:text-ops-ink">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-ops-green" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ops-navy text-sm font-semibold text-white">
            ST
          </div>
        </div>
      </div>
    </header>
  );
}
