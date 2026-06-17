import { TrendingUp, Coins, Clock, Tag, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatUsd, formatNumber } from "@/lib/formatters";
import { COST_LINES, EVENT_ROI, PRICING_TIERS } from "@/lib/economics";

/** The money story: what the operator gets back, the net benefit, and how
 * MaterialOps is priced — so the ROI is undeniable at a glance. */
export function EventROI() {
  const maxAmount = Math.max(...COST_LINES.map((l) => l.amount));

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
      <GlassCard className="p-6 xl:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-base font-semibold text-ops-ink">
              Where the value comes from
            </div>
            <p className="mt-0.5 text-sm text-ops-muted">
              Verified return to the operator from {EVENT_ROI.tonsRecovered} tons recovered
            </p>
          </div>
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-ops-green/12 text-ops-green">
            <Coins className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-5 space-y-3.5">
          {COST_LINES.map((line) => (
            <div key={line.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-ops-ink">{line.label}</span>
                <span className="text-sm font-semibold tabular-nums text-ops-ink">
                  {formatUsd(line.amount)}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ops-bg">
                <div
                  className="h-full rounded-full bg-ops-green"
                  style={{ width: `${(line.amount / maxAmount) * 100}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-ops-muted">{line.basis}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-ops-border pt-4">
          <span className="text-sm font-semibold text-ops-ink">Total verified value returned</span>
          <span className="font-display text-xl font-bold text-ops-green">
            {formatUsd(EVENT_ROI.grossValue)}
          </span>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard className="p-6" glow>
          <div className="flex items-center gap-2 text-ops-muted">
            <TrendingUp className="h-4 w-4 text-ops-green" />
            <span className="text-xs font-semibold uppercase tracking-wide">Event ROI</span>
          </div>
          <div className="mt-3 font-display text-4xl font-bold text-ops-ink">
            {EVENT_ROI.roiMultiple}×
          </div>
          <p className="mt-1 text-sm text-ops-muted">
            return on the {formatUsd(EVENT_ROI.platformFee)} platform fee
          </p>

          <div className="mt-5 space-y-3 border-t border-ops-border pt-4 text-sm">
            <Row label="Value returned" value={formatUsd(EVENT_ROI.grossValue)} />
            <Row label="Platform fee" value={`– ${formatUsd(EVENT_ROI.platformFee)}`} />
            <div className="flex items-center justify-between border-t border-ops-border pt-3">
              <span className="font-semibold text-ops-ink">Net benefit</span>
              <span className="font-display text-lg font-bold text-ops-green">
                {formatUsd(EVENT_ROI.netBenefit)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-md bg-ops-bg px-3 py-2 text-xs text-ops-muted">
            <Clock className="h-3.5 w-3.5 flex-shrink-0 text-ops-green" />
            ~{formatNumber(EVENT_ROI.laborHoursSaved)} crew-hours saved vs. manual sorting
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 text-ops-muted">
            <Tag className="h-4 w-4 text-ops-green" />
            <span className="text-xs font-semibold uppercase tracking-wide">Pricing</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-md border p-3 ${
                  tier.recommended
                    ? "border-ops-green/40 bg-ops-green/[0.06]"
                    : "border-ops-border bg-ops-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ops-ink">
                    {tier.name}
                    {tier.recommended && (
                      <span className="flex items-center gap-0.5 rounded-full bg-ops-green/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ops-green">
                        <Check className="h-2.5 w-2.5" /> Popular
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-bold text-ops-ink">
                    {tier.price}
                    <span className="ml-1 text-[11px] font-normal text-ops-muted">{tier.unit}</span>
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-ops-muted">{tier.detail}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ops-muted">{label}</span>
      <span className="font-medium tabular-nums text-ops-ink">{value}</span>
    </div>
  );
}
