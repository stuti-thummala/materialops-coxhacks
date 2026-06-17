import { BadgeCheck, Download } from "lucide-react";

const breakdown = [
  { label: "Reuse", value: "2.3 tons", pct: "12.3%", color: "#84cc16" },
  { label: "Recycling", value: "14.9 tons", pct: "79.7%", color: "#22d3ee" },
  { label: "Donation", value: "1.1 tons", pct: "5.9%", color: "#10b981" },
  { label: "Remaining Waste", value: "0.4 tons", pct: "2.1%", color: "#6f839a" },
];

export function ImpactReceipt() {
  return (
    <div className="rounded-lg border border-ops-border bg-ops-surface p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-lg font-semibold text-ops-ink">
            Mercedes-Benz Stadium
          </div>
          <div className="text-sm text-ops-muted">Concert Event</div>
          <div className="text-xs text-ops-muted">May 15-16, 2025</div>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-ops-green/30 bg-ops-green/10 px-2.5 py-1 text-xs font-semibold text-ops-green">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified
        </div>
      </div>

      <div className="my-5 border-t border-dashed border-ops-border" />

      <div className="space-y-3">
        {breakdown.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ops-ink/80">{row.label}</span>
              <span className="font-medium text-ops-ink">
                {row.value} · {row.pct}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ops-bg">
              <div
                className="h-full rounded-full"
                style={{ width: row.pct, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="my-5 border-t border-dashed border-ops-border" />

      <button className="flex w-full items-center justify-center gap-2 rounded-md bg-ops-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-ops-green/90">
        <Download className="h-4 w-4" />
        Export Report
      </button>
    </div>
  );
}
