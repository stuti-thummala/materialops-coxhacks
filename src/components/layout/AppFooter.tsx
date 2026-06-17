import Link from "next/link";

function MercedesGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M24 24 L24 5 M24 24 L8 34 M24 24 L40 34"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-10 border-t border-ops-border bg-ops-surface">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-8 py-6 text-center md:flex-row md:text-left">
        <div className="flex items-center gap-3 text-ops-muted">
          <MercedesGlyph className="h-9 w-9 text-ops-ink" />
          <div className="text-sm font-semibold leading-tight text-ops-ink">
            Mercedes-Benz
            <br />
            Stadium
          </div>
        </div>

        <div className="text-ops-ink">
          <div className="font-display text-lg italic">
            Building a better future, together.
          </div>
          <div className="text-sm text-ops-muted">
            Recover today. Reuse tomorrow.
          </div>
        </div>

        <Link
          href="/impact"
          className="flex items-center gap-3 text-ops-muted transition hover:text-ops-ink"
        >
          <svg viewBox="0 0 40 40" className="h-9 w-9 text-ops-ink">
            <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 7 L20 20 L29 24" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <div className="text-xs font-semibold leading-tight tracking-wider text-ops-ink">
            FIFA WORLD CUP 2026™
            <br />
            <span className="text-ops-green">ATLANTA</span>
          </div>
        </Link>
      </div>
    </footer>
  );
}
