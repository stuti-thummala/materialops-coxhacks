"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Recycle,
  Package,
  Car,
  TreePine,
  Smartphone,
  Home,
  Download,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  sponsors,
  sponsorImpact,
  sponsorSavings,
  type SponsorSavings,
  type Sponsor,
} from "@/lib/sponsors";
import { formatUsd, formatWeight } from "@/lib/formatters";

/** Eased count-up that replays whenever the target changes (brand switch). */
function useCountUp(target: number, duration = 850): number {
  const [value, setValue] = useState(target);
  useEffect(() => {
    setValue(0);
    const start = Date.now();
    const id = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress >= 1) {
        setValue(target);
        clearInterval(id);
      }
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return value;
}

export default function SponsorsPage() {
  const [activeId, setActiveId] = useState(sponsors[0].id);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const summary = useMemo(() => sponsorImpact(activeId), [activeId]);
  const savings = useMemo(() => sponsorSavings(summary), [summary]);
  const s = summary.sponsor;

  const diversionPct = Math.round(summary.diversionRate * 100);
  const co2e = useCountUp(summary.impact.co2eAvoidedLbs);
  const moneySaved = useCountUp(savings.total);
  const hasData = summary.totalItems > 0;

  const journey = [
    {
      icon: Package,
      value: summary.totalItems.toLocaleString(),
      label: "Branded items collected",
    },
    {
      icon: Recycle,
      value: `${diversionPct}%`,
      label: "Diverted from landfill",
    },
    {
      icon: Sparkles,
      value: `${summary.impact.co2eAvoidedLbs.toLocaleString()}`,
      label: "lbs CO₂e avoided",
    },
  ];

  const equivalents = [
    {
      icon: Car,
      value: summary.impact.equivalents.carMiles.toLocaleString(),
      label: "car-miles not driven",
    },
    {
      icon: TreePine,
      value: summary.impact.equivalents.treeSeedlings.toLocaleString(),
      label: "tree seedlings · 10 yrs",
    },
    {
      icon: Smartphone,
      value: summary.impact.equivalents.phonesCharged.toLocaleString(),
      label: "smartphones charged",
    },
    {
      icon: Home,
      value: summary.impact.equivalents.homeDays.toLocaleString(),
      label: "home-days of power",
    },
  ];

  return (
    <AppShell
      header={
        <PageHeader
          title="Sponsor Impact"
          subtitle="An issued, verifiable recovery pass for every event partner"
        />
      }
    >
      <div className="animate-fade-up space-y-6">
        {/* brand selector */}
        <div className="flex flex-wrap gap-2">
          {sponsors.map((sp) => {
            const active = sp.id === activeId;
            const dotColor = active ? "rgba(255,255,255,0.9)" : sp.color;
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => setActiveId(sp.id)}
                className={
                  active
                    ? "flex items-center gap-2 rounded-full border border-transparent px-3.5 py-2 text-sm font-semibold text-white shadow transition"
                    : "flex items-center gap-2 rounded-full border border-ops-border bg-ops-surface px-3.5 py-2 text-sm font-semibold text-ops-muted transition hover:text-ops-ink"
                }
                style={active ? { background: sp.color } : undefined}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: dotColor }}
                />
                {sp.name}
              </button>
            );
          })}
        </div>

        {/* the recovery pass */}
        <div className="print-area">
          <div className="relative overflow-hidden rounded-3xl border border-ops-border bg-ops-surface shadow-[0_1px_3px_rgba(24,32,38,0.06)]">
            <div className="flex flex-col lg:flex-row">
              {/* stub */}
              <div
                className="relative shrink-0 p-7 text-white lg:w-[19rem]"
                style={{
                  background: `linear-gradient(160deg, ${s.color}, ${s.color}cc)`,
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  <span>Official Recovery Pass</span>
                  <ShieldCheck className="h-4 w-4 text-white/80" />
                </div>

                <div className="mt-6">
                  <div className="text-xs font-medium uppercase tracking-wide text-white/60">
                    {s.tier}
                  </div>
                  <h2 className="mt-1 font-display text-3xl font-bold leading-tight">
                    {s.name}
                  </h2>
                </div>

                <div className="mt-8">
                  <div className="font-display text-5xl font-bold tabular-nums">
                    {Math.round(co2e).toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm font-medium text-white/75">
                    lbs CO₂e avoided
                  </div>
                </div>

                <p className="mt-6 max-w-[15rem] text-sm leading-relaxed text-white/70">
                  {s.commitment}
                </p>

                <div className="mt-8 border-t border-white/15 pt-4 text-[11px] leading-relaxed text-white/55">
                  FIFA World Cup 2026™ · Mercedes-Benz Stadium
                </div>
              </div>

              {/* body */}
              <div className="flex-1 border-t border-dashed border-ops-border p-7 lg:border-l lg:border-t-0">
                {hasData ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-semibold text-ops-ink">
                        Material journey
                      </h3>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-ops-green">
                        <ShieldCheck className="h-3.5 w-3.5" /> Passport-backed
                      </span>
                    </div>

                    <ol className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                      {journey.map((node, i) => {
                        const Icon = node.icon;
                        return (
                          <li
                            key={node.label}
                            className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-stretch sm:gap-0"
                          >
                            {i > 0 && (
                              <span className="hidden text-ops-border sm:flex sm:items-center sm:self-center">
                                <ChevronRight className="-mx-1 h-5 w-5" />
                              </span>
                            )}
                            <div className="flex-1 rounded-2xl border border-ops-border bg-ops-bg/40 p-4">
                              <span
                                className="flex h-9 w-9 items-center justify-center rounded-xl"
                                style={{
                                  background: `${s.color}16`,
                                  color: s.color,
                                }}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <div className="mt-3 font-display text-xl font-bold tabular-nums text-ops-ink">
                                {node.value}
                              </div>
                              <div className="text-[11px] leading-tight text-ops-muted">
                                {node.label}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>

                    {/* money saved — the headline financial story */}
                    <div className="mt-6 overflow-hidden rounded-2xl border border-ops-greenDark/30 bg-ops-greenDark/[0.07]">
                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ops-greenDark">
                            <DollarSign className="h-3.5 w-3.5" />
                            Money saved by investing in sustainability
                          </div>
                          <div className="mt-2 font-display text-4xl font-bold tabular-nums text-ops-ink sm:text-5xl">
                            {formatUsd(Math.round(moneySaved))}
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-ops-greenDark">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {savings.roi}× return · {formatUsd(savings.investment)} program
                            invested
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowBreakdown(true)}
                          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ops-greenDark px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 print:hidden"
                        >
                          View detailed breakdown
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-ops-border bg-ops-bg/40 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ops-muted">
                        What that recovery equals
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                        {equivalents.map((eq) => {
                          const Icon = eq.icon;
                          return (
                            <div key={eq.label} className="flex items-start gap-2.5">
                              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ops-muted" />
                              <div>
                                <div className="font-display text-base font-bold tabular-nums text-ops-ink">
                                  {eq.value}
                                </div>
                                <div className="text-[11px] leading-tight text-ops-muted">
                                  {eq.label}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[11px] leading-relaxed text-ops-muted">
                        {formatWeight(summary.totalWeightLbs)} attributed · EPA WARM
                        verified · signed material passports
                      </span>
                      <button
                        type="button"
                        onClick={() => globalThis.print()}
                        className="flex items-center justify-center gap-2 rounded-xl bg-ops-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125 print:hidden"
                      >
                        <Download className="h-4 w-4" /> Issue certificate (PDF)
                      </button>
                    </div>

                    {/* verifiable detail — collapsed by default to stay uncluttered */}
                    <details className="group mt-4 print:open">
                      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-ops-blue print:hidden">
                        <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
                        View attributed line items ({summary.lines.length})
                      </summary>
                      <div className="mt-3 overflow-hidden rounded-xl border border-ops-border">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-ops-bg text-[11px] uppercase tracking-wide text-ops-muted">
                            <tr>
                              <th className="px-4 py-2.5 font-medium">Item</th>
                              <th className="px-4 py-2.5 font-medium">Batch</th>
                              <th className="px-4 py-2.5 text-right font-medium">
                                Weight
                              </th>
                              <th className="px-4 py-2.5 text-right font-medium">
                                CO₂e
                              </th>
                              <th className="px-4 py-2.5 text-right font-medium">
                                Passport
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.lines.map((l) => (
                              <tr
                                key={`${l.batchId}-${l.name}`}
                                className="border-t border-ops-border"
                              >
                                <td className="px-4 py-2.5 font-medium text-ops-ink">
                                  {l.name}
                                </td>
                                <td className="px-4 py-2.5 text-ops-muted">
                                  {l.batchId}
                                </td>
                                <td className="px-4 py-2.5 text-right text-ops-ink">
                                  {l.weightLbs} lbs
                                </td>
                                <td className="px-4 py-2.5 text-right text-ops-ink">
                                  {l.impact.co2eAvoidedLbs.toLocaleString()} lbs
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <Link
                                    href={`/passport/${l.batchId}`}
                                    className="inline-flex items-center gap-1 text-ops-blue hover:underline print:hidden"
                                  >
                                    View <ArrowRight className="h-3 w-3" />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </>
                ) : (
                  <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-center">
                    <Package className="h-8 w-8 text-ops-muted/50" />
                    <p className="mt-3 max-w-xs text-sm text-ops-muted">
                      No branded material attributed to {s.name} in the current event
                      window yet. Recovered items appear here automatically as they’re
                      scanned and verified.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* perforation notches (large screens) */}
            <span className="absolute -top-2 left-[19rem] hidden h-4 w-4 -translate-x-1/2 rounded-full bg-ops-bg lg:block" />
            <span className="absolute -bottom-2 left-[19rem] hidden h-4 w-4 -translate-x-1/2 rounded-full bg-ops-bg lg:block" />
          </div>
        </div>
      </div>

      {showBreakdown && (
        <SavingsBreakdownModal
          sponsor={s}
          savings={savings}
          itemsRecovered={summary.totalItems}
          weightLbs={summary.totalWeightLbs}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </AppShell>
  );
}

interface SavingsBreakdownModalProps {
  readonly sponsor: Sponsor;
  readonly savings: SponsorSavings;
  readonly itemsRecovered: number;
  readonly weightLbs: number;
  readonly onClose: () => void;
}

function SavingsBreakdownModal({
  sponsor,
  savings,
  itemsRecovered,
  weightLbs,
  onClose,
}: SavingsBreakdownModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [onClose]);

  const maxAmount = Math.max(...savings.lines.map((l) => l.amount), 1);

  return (
    <dialog
      open
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-start justify-center overflow-y-auto bg-ops-ink/50 p-4 backdrop-blur-sm print:static print:bg-white print:p-0"
      aria-label={`${sponsor.name} sustainability savings statement`}
    >
      <button
        type="button"
        aria-label="Close breakdown"
        onClick={onClose}
        className="absolute inset-0 cursor-default print:hidden"
      />
      <div className="savings-statement relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-ops-border bg-ops-surface shadow-2xl print:my-0 print:shadow-none">
        {/* statement header */}
        <div
          className="stmt-header relative p-7 text-white"
          style={{
            background: `linear-gradient(160deg, ${sponsor.color}, ${sponsor.color}cc)`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 print:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Sustainability Savings Statement
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold">{sponsor.name}</h2>
          <div className="mt-5 text-xs font-medium uppercase tracking-wide text-white/60">
            Money saved by investing in sustainability
          </div>
          <div className="mt-1 font-display text-5xl font-bold tabular-nums">
            {formatUsd(savings.total)}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-white/70">
            <span>{itemsRecovered.toLocaleString()} branded items recovered</span>
            <span>{formatWeight(weightLbs)} diverted</span>
            <span>FIFA World Cup 2026™ activation</span>
          </div>
        </div>

        {/* itemized breakdown */}
        <div className="p-7">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ops-muted">
            Where the value comes from
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {savings.lines.map((line) => {
              const share = Math.round((line.amount / savings.total) * 100);
              return (
                <div key={line.category}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-semibold text-ops-ink">
                      {line.category}
                    </span>
                    <span className="font-display text-base font-bold tabular-nums text-ops-ink">
                      {formatUsd(line.amount)}
                    </span>
                  </div>
                  <div className="stmt-track mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ops-bg">
                    <div
                      className="stmt-bar h-full rounded-full bg-ops-greenDark"
                      style={{ width: `${(line.amount / maxAmount) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-4 text-[11px] text-ops-muted">
                    <span>{line.basis}</span>
                    <span className="shrink-0 tabular-nums">{share}% of total</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ROI summary */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-ops-border bg-ops-bg/40 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ops-muted">
                Program invested
              </div>
              <div className="mt-1 font-display text-lg font-bold tabular-nums text-ops-ink">
                {formatUsd(savings.investment)}
              </div>
            </div>
            <div className="rounded-2xl border border-ops-border bg-ops-bg/40 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ops-muted">
                Value returned
              </div>
              <div className="mt-1 font-display text-lg font-bold tabular-nums text-ops-ink">
                {formatUsd(savings.total)}
              </div>
            </div>
            <div className="rounded-2xl border border-ops-greenDark/30 bg-ops-greenDark/[0.07] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ops-greenDark">
                Return on spend
              </div>
              <div className="mt-1 flex items-center gap-1 font-display text-lg font-bold tabular-nums text-ops-ink">
                <TrendingUp className="h-4 w-4 text-ops-greenDark" />
                {savings.roi}×
              </div>
            </div>
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-ops-muted">
            Modeled from verified material-passport recovery data and annualized
            across the activation program. Figures combine avoided disposal,
            recovered commodity value, AI-routed logistics efficiency, ESG &amp;
            earned-media equity, and circular-economy tax incentives. EPA WARM
            methodology · illustrative executive summary.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => globalThis.print()}
              className="flex items-center justify-center gap-2 rounded-xl bg-ops-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125 print:hidden"
            >
              <Download className="h-4 w-4" /> Export statement (PDF)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ops-border px-4 py-2.5 text-sm font-semibold text-ops-ink transition hover:bg-ops-bg print:hidden"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
