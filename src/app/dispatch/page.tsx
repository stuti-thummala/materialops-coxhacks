"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { GradientButton } from "@/components/ui/GradientButton";
import { SiteRecoveryMap } from "@/components/dashboard/SiteRecoveryMap";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { buildLiveFieldBatch } from "@/lib/spotReports";
import { useToast } from "@/components/ui/Toast";
import { crews } from "@/lib/mockData";
import { formatUsd } from "@/lib/formatters";
import {
  Plus,
  Check,
  Truck,
  Route,
  Clock,
  MapPin,
  Package,
  Boxes,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  TrendingUp,
  Flame,
  ListOrdered,
} from "lucide-react";

interface ReadyBatch {
  id: string;
  zone: string;
  material: string;
  weight: string;
  value: number;
  priority: "low" | "medium" | "high";
}

const readyBatches: ReadyBatch[] = [
  { id: "VB-104", zone: "GWCC / Convention Campus", material: "Vinyl Banners", weight: "78 lbs", value: 840, priority: "high" },
  { id: "B-24177", zone: "Stadium Bowl", material: "Cardboard", weight: "320 lbs", value: 420, priority: "high" },
  { id: "CU-091", zone: "Parking / Logistics", material: "Mixed Recyclables", weight: "210 lbs", value: 315, priority: "medium" },
  { id: "CT-033", zone: "Home Depot Backyard", material: "Wood / Pallets", weight: "560 lbs", value: 670, priority: "medium" },
  { id: "FO-012", zone: "State Farm Arena / District", material: "Food & Organics", weight: "150 lbs", value: 90, priority: "low" },
];

/** Material → recovery partner routing used for the AI reasoning in step 3. */
const PARTNER_ROUTES: Record<string, { partner: string; path: string }> = {
  "Vinyl Banners": { partner: "ReUse Hub ATL", path: "Clean & Reuse" },
  Cardboard: { partner: "Pratt Recycling", path: "Recycle" },
  "Mixed Recyclables": { partner: "Sims Metal Management", path: "Sort & Recycle" },
  "Wood / Pallets": { partner: "Interface Flooring", path: "Reuse" },
  "Food & Organics": { partner: "Compost Now ATL", path: "Compost" },
  "Biltmore Field Recovery": { partner: "ReUse Hub ATL", path: "Reuse" },
};

const STEPS = [
  { id: 1, label: "Select Batches", icon: Boxes },
  { id: 2, label: "Assign Crews", icon: Users },
  { id: 3, label: "Partner & Route", icon: Route },
] as const;

type StepId = 1 | 2 | 3;

/** Static priority model the AI report explains at the bottom of the page. */
const PRIORITY_WEIGHT: Record<ReadyBatch["priority"], number> = {
  high: 1,
  medium: 0.6,
  low: 0.3,
};

const BATCH_REASON: Record<string, string> = {
  "VB-104": "Top recovered value + reuse-partner SLA window closes soon",
  "B-24177": "Cardboard intake outpacing recovery — overflow risk building",
  "CT-033": "Heavy load frees the most crew capacity per trip",
  "CU-091": "Mixed stream degrades fast once contamination starts",
  "FO-012": "Compostable and time-tolerant — safe to schedule last",
};

/** Reason fallback keyed by material, for live batches whose id isn't seeded. */
const REASON_BY_MATERIAL: Record<string, string> = {
  "Biltmore Field Recovery":
    "Field recovery from a new off-campus area — low volume, schedule after the stadium loads",
};

const MAX_BATCH_VALUE = Math.max(...readyBatches.map((b) => b.value));

type RankedBatch = ReadyBatch & {
  score: number;
  reason: string;
  route?: { partner: string; path: string };
};

/** Score + sort the ready batches into the dispatch order the AI recommends.
 * Priority weight dominates, recovered value breaks ties — so a small low-prio
 * field batch always sorts to the bottom. */
function rankDispatch(batches: ReadyBatch[]): RankedBatch[] {
  return [...batches]
    .map((b) => ({
      ...b,
      score: Math.round(
        PRIORITY_WEIGHT[b.priority] * 55 + (b.value / MAX_BATCH_VALUE) * 45,
      ),
      reason: BATCH_REASON[b.id] ?? REASON_BY_MATERIAL[b.material] ?? "",
      route: PARTNER_ROUTES[b.material],
    }))
    .sort((a, b) => b.score - a.score);
}

const RANKED_DISPATCH = rankDispatch(readyBatches);

const PRIORITY_FACTORS = [
  { label: "Overflow risk", weight: 35, icon: Flame, accent: "text-ops-red", bar: "bg-ops-red/55" },
  { label: "Recovered value density", weight: 27, icon: TrendingUp, accent: "text-ops-green", bar: "bg-ops-green/55" },
  { label: "Contamination window", weight: 20, icon: Clock, accent: "text-ops-amber", bar: "bg-ops-amber/55" },
  { label: "Partner pickup SLA", weight: 12, icon: Route, accent: "text-ops-blue", bar: "bg-ops-blue/55" },
  { label: "Crew proximity", weight: 6, icon: MapPin, accent: "text-ops-purple", bar: "bg-ops-purple/55" },
] as const;

const PRIORITY_DOT: Record<ReadyBatch["priority"], string> = {
  high: "bg-ops-red",
  medium: "bg-ops-amber",
  low: "bg-ops-blue",
};


export default function DispatchPage() {
  const {
    selectedBatchIds,
    selectedCrewIds,
    dispatched,
    toggleBatch,
    toggleCrew,
    dispatchCrews,
  } = useMaterialOpsStore();
  const spotReports = useMaterialOpsStore((s) => s.spotReports);
  const biltmoreActive = spotReports.some(
    (r) => r.coords && r.zoneName.toLowerCase().includes("biltmore"),
  );
  const { showToast } = useToast();
  const [step, setStep] = useState<StepId>(1);

  const selectedBatches = readyBatches.filter((b) =>
    selectedBatchIds.includes(b.id),
  );
  const totalValue = selectedBatches.reduce((sum, b) => sum + b.value, 0);
  const selectedCrews = crews.filter((c) => selectedCrewIds.includes(c.id));
  const totalCapacity = selectedCrews.reduce((s, c) => s + c.capacityLbs, 0);

  function handleDispatch() {
    if (selectedBatchIds.length === 0 || selectedCrewIds.length === 0) return;
    dispatchCrews();
    showToast("Crews dispatched. Mobile tasks sent.");
  }

  const canAdvance =
    (step === 1 && selectedBatchIds.length > 0) ||
    (step === 2 && selectedCrewIds.length > 0) ||
    step === 3;

  return (
    <AppShell header={<PageHeader title="Dispatch Center" subtitle="Coordinate and dispatch recovery crews across the stadium district" />}>
      <div className="animate-fade-up space-y-6">
        {/* intro help */}
        <div className="flex items-start gap-3 rounded-lg border border-ops-border bg-ops-surface p-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-ops-green/10 text-ops-green">
            <Info className="h-4 w-4" />
          </div>
          <p className="text-sm leading-relaxed text-ops-muted">
            Dispatch in three steps: <span className="font-semibold text-ops-ink">pick the ready batches</span> to
            recover, <span className="font-semibold text-ops-ink">assign available crews</span>, then review the
            AI-matched <span className="font-semibold text-ops-ink">recovery partners and route</span> before
            sending tasks to the crews&apos; mobile apps.
          </p>
        </div>

        {/* stepper */}
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-ops-border bg-ops-surface p-1.5">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            let badgeClass = "bg-ops-bg text-ops-muted";
            if (active) badgeClass = "bg-white/20 text-white";
            else if (done) badgeClass = "bg-ops-green text-white";
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-ops-navy text-white"
                    : "text-ops-muted hover:bg-ops-bg"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${badgeClass}`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <Icon className="h-4 w-4" />
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {step === 1 && (
              <>
                <div>
                  <SectionHeader title="Recovery Zone Map" subtitle="Live recovery load by zone" />
                  <GlassCard className="p-3">
                    <SiteRecoveryMap
                      showBadges
                      height="h-[320px]"
                      biltmoreActive={biltmoreActive}
                    />
                  </GlassCard>
                </div>

                <div>
                  <SectionHeader title="Ready Batches" subtitle="Select batches to add to dispatch plan" />
                  <GlassCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-ops-border text-xs font-medium uppercase tracking-wide text-ops-muted">
                            <th className="px-4 py-3 font-medium" />
                            <th className="px-4 py-3 font-medium">Batch</th>
                            <th className="px-4 py-3 font-medium">Zone</th>
                            <th className="px-4 py-3 font-medium">Material</th>
                            <th className="px-4 py-3 font-medium">Weight</th>
                            <th className="px-4 py-3 font-medium">Value</th>
                            <th className="px-4 py-3 font-medium">Priority</th>
                            <th className="px-4 py-3 font-medium" />
                          </tr>
                        </thead>
                        <tbody>
                          {readyBatches.map((batch) => {
                            const selected = selectedBatchIds.includes(batch.id);
                            return (
                              <tr
                                key={batch.id}
                                className="border-b border-ops-border transition hover:bg-ops-bg"
                              >
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => toggleBatch(batch.id)}
                                    className={`flex h-5 w-5 items-center justify-center rounded border transition ${
                                      selected
                                        ? "border-ops-green bg-ops-green text-white"
                                        : "border-ops-border bg-white"
                                    }`}
                                  >
                                    {selected && <Check className="h-3.5 w-3.5" />}
                                  </button>
                                </td>
                                <td className="px-4 py-3 font-semibold text-ops-blue">
                                  {batch.id}
                                </td>
                                <td className="px-4 py-3 text-ops-muted">{batch.zone}</td>
                                <td className="px-4 py-3 text-ops-ink/80">{batch.material}</td>
                                <td className="px-4 py-3 text-ops-muted">{batch.weight}</td>
                                <td className="px-4 py-3 font-medium text-ops-ink">
                                  {formatUsd(batch.value)}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusPill status={batch.priority} variant="priority" />
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => toggleBatch(batch.id)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-ops-border bg-white text-ops-muted hover:bg-ops-bg"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </div>
              </>
            )}

            {step === 2 && (
              <div>
                <SectionHeader title="Assign Crews" subtitle="Select available crews to handle the selected batches" />
                <GlassCard className="space-y-2 p-5">
                  <div className="mb-1 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-ops-muted">
                    <span>Available crews</span>
                    <span>Capacity {totalCapacity} lbs selected</span>
                  </div>
                  {crews
                    .filter((c) => c.status === "available")
                    .map((crew) => {
                      const selected = selectedCrewIds.includes(crew.id);
                      return (
                        <button
                          key={crew.id}
                          onClick={() => toggleCrew(crew.id)}
                          className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition ${
                            selected
                              ? "border-ops-green/40 bg-ops-green/8"
                              : "border-ops-border bg-white hover:bg-ops-bg"
                          }`}
                        >
                          <div>
                            <div className="text-sm font-medium text-ops-ink">
                              {crew.name}
                            </div>
                            <div className="text-xs text-ops-muted">
                              {crew.lead} · {crew.capacityLbs} lbs capacity · {crew.currentZone}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusPill status={crew.status} />
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border ${
                                selected
                                  ? "border-ops-green bg-ops-green text-white"
                                  : "border-ops-border"
                              }`}
                            >
                              {selected && <Check className="h-3.5 w-3.5" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </GlassCard>
              </div>
            )}

            {step === 3 && (
              <div>
                <SectionHeader title="Partner & Route" subtitle="AI-matched recovery partner per material" />
                <GlassCard className="space-y-4 p-5">
                  <div className="flex items-center gap-2 rounded-md border border-ops-green/30 bg-ops-green/[0.06] px-3 py-2 text-xs font-medium text-ops-green">
                    <Sparkles className="h-3.5 w-3.5" />
                    Routing matched to certified partners by material type and recovery path.
                  </div>

                  {selectedBatches.length === 0 && (
                    <p className="text-sm text-ops-muted">
                      No batches selected yet — go back to step 1 to add batches.
                    </p>
                  )}

                  {selectedBatches.map((batch) => {
                    const route = PARTNER_ROUTES[batch.material] ?? {
                      partner: "Sort On-Site",
                      path: "Sort & Recover",
                    };
                    return (
                      <div
                        key={batch.id}
                        className="rounded-lg border border-ops-border bg-ops-bg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-ops-blue">
                            {batch.id}
                          </span>
                          <span className="text-xs text-ops-muted">{batch.material}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-ops-ink">
                          <span className="rounded bg-ops-surface px-2 py-0.5 text-xs font-medium">
                            {route.path}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-ops-muted" />
                          <span className="font-semibold">{route.partner}</span>
                        </div>
                        <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-ops-muted">
                          <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-ops-green" />
                          {batch.material} routes best to {route.partner} via {route.path.toLowerCase()} —
                          highest recovery value with the shortest qualified route.
                        </div>
                      </div>
                    );
                  })}
                </GlassCard>
              </div>
            )}

            {/* step nav */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as StepId) : s))}
                disabled={step === 1}
                className="flex items-center gap-1.5 rounded-lg border border-ops-border px-4 py-2.5 text-sm font-semibold text-ops-muted transition enabled:hover:bg-ops-bg disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              {step < 3 && (
                <button
                  onClick={() => canAdvance && setStep((s) => (s + 1) as StepId)}
                  disabled={!canAdvance}
                  className="flex items-center gap-1.5 rounded-lg bg-ops-navy px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-ops-navy/90 disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Dispatch plan panel (persistent) */}
          <div className="space-y-6">
            <SectionHeader title="Dispatch Plan" />
            <GlassCard className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-ops-border bg-ops-bg p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-ops-muted">
                    Selected Batches
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-ops-ink">
                    {selectedBatches.length}
                  </div>
                </div>
                <div className="rounded-md border border-ops-border bg-ops-bg p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-ops-muted">
                    Est. Value
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-ops-green">
                    {formatUsd(totalValue)}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-ops-muted">
                  <span>Assigned Crews ({selectedCrews.length})</span>
                  <span>Capacity {totalCapacity} lbs</span>
                </div>
                <div className="space-y-1.5">
                  {selectedCrews.length === 0 ? (
                    <p className="rounded-md border border-dashed border-ops-border px-3 py-2 text-xs text-ops-muted">
                      No crews assigned — add them in step 2.
                    </p>
                  ) : (
                    selectedCrews.map((crew) => (
                      <div
                        key={crew.id}
                        className="flex items-center justify-between rounded-md border border-ops-green/40 bg-ops-green/8 p-2.5"
                      >
                        <div className="text-sm font-medium text-ops-ink">{crew.name}</div>
                        <div className="text-xs text-ops-muted">{crew.capacityLbs} lbs</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="space-y-3 p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-ops-muted">
                Route Summary
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <SummaryRow icon={<Route className="h-4 w-4" />} label="Distance" value="12.4 mi" />
                <SummaryRow icon={<Clock className="h-4 w-4" />} label="Duration" value="1h 35m" />
                <SummaryRow icon={<MapPin className="h-4 w-4" />} label="Stops" value={`${selectedBatches.length || 3}`} />
                <SummaryRow icon={<Package className="h-4 w-4" />} label="Est. Impact" value="+850 lbs" />
              </div>

              <GradientButton
                onClick={handleDispatch}
                disabled={selectedBatchIds.length === 0 || selectedCrewIds.length === 0}
                className="mt-2 w-full py-4 text-base"
              >
                <Truck className="h-5 w-5" />
                Dispatch Crews
              </GradientButton>

              {dispatched && (
                <div className="rounded-md border border-ops-green/30 bg-ops-green/8 px-4 py-3 text-center text-sm font-medium text-ops-green">
                  Crews dispatched. Mobile tasks sent.
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* AI-generated dispatch report */}
        <AiDispatchReport />
      </div>
    </AppShell>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-ops-border bg-ops-bg p-3">
      <div className="text-ops-blue">{icon}</div>
      <div>
        <div className="text-xs text-ops-muted">{label}</div>
        <div className="font-semibold text-ops-ink">{value}</div>
      </div>
    </div>
  );
}

function AiDispatchReport() {
  // Fold the live mobile field captures (the Biltmore drop) into the ranking as
  // a single low-priority batch so it shows up in the plan — but never first.
  const spotReports = useMaterialOpsStore((s) => s.spotReports);
  const ranked = useMemo(() => {
    const liveBatch = buildLiveFieldBatch(spotReports);
    if (!liveBatch) return RANKED_DISPATCH;
    const liveReady: ReadyBatch = {
      id: liveBatch.id,
      zone: "Biltmore Innovation Center",
      material: liveBatch.material,
      weight: `${liveBatch.estimatedWeightLbs} lbs`,
      value: liveBatch.estimatedValueUsd,
      priority: liveBatch.priority,
    };
    return rankDispatch([...readyBatches, liveReady]);
  }, [spotReports]);

  const top = ranked[0];
  return (
    <div>
      <SectionHeader
        title="AI Dispatch Report"
        subtitle="Prioritised recovery plan — what to dispatch first and why"
        action={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-ops-green/30 bg-ops-green/10 px-2.5 py-1 text-[11px] font-semibold text-ops-green">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ops-green" />
              <span>Generated · just now</span>
            </span>
            <span className="rounded-full border border-ops-border bg-ops-bg px-2.5 py-1 text-[11px] font-medium text-ops-muted">
              94% confidence
            </span>
          </div>
        }
      />

      <GlassCard className="overflow-hidden">
        {/* recommendation banner */}
        <div className="flex items-start gap-3 border-b border-ops-border bg-ops-green/[0.04] px-5 py-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ops-green/10 text-ops-green ring-1 ring-inset ring-ops-green/25">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-snug text-ops-ink">
              Dispatch <span className="text-ops-green">{top.id}</span> ({top.material}) first.
            </p>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ops-muted">
              It tops the queue on a weighted blend of overflow risk and recovered value —
              worth {formatUsd(top.value)} and routed to {top.route?.partner ?? "a recovery partner"} via{" "}
              {top.route?.path ?? "the matched path"}. Clearing it now protects the SLA window before partner pickup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          {/* prioritised queue */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ops-muted">
              <ListOrdered className="h-3.5 w-3.5" />
              Recommended dispatch order
            </div>
            <ol className="space-y-2">
              {ranked.map((b, i) => (
                <li
                  key={b.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                    i === 0
                      ? "border-ops-green/40 bg-ops-green/[0.06]"
                      : "border-ops-border bg-ops-bg"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? "bg-ops-green text-white" : "bg-ops-surface text-ops-muted ring-1 ring-inset ring-ops-border"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${PRIORITY_DOT[b.priority]}`}
                        title={`${b.priority} priority`}
                      />
                      <span className="text-sm font-semibold text-ops-blue">{b.id}</span>
                      <span className="truncate text-[11px] text-ops-muted">
                        {b.material} · {b.zone}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-ops-muted">{b.reason}</div>
                  </div>
                  <div className="flex w-16 flex-shrink-0 flex-col items-end">
                    <span className="text-xs font-bold text-ops-ink">{b.score}</span>
                    <span className="mt-1 h-1 w-full overflow-hidden rounded-full bg-ops-border">
                      <span
                        className="block h-full rounded-full bg-ops-green"
                        style={{ width: `${b.score}%` }}
                      />
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* how priority was calculated */}
          <div className="border-t border-ops-border p-5 lg:border-l lg:border-t-0">
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ops-muted">
              <TrendingUp className="h-3.5 w-3.5" />
              How priority was calculated
            </div>
            <div className="space-y-3">
              {PRIORITY_FACTORS.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label}>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-1.5 text-ops-ink">
                        <Icon className={`h-3.5 w-3.5 ${f.accent}`} />
                        {f.label}
                      </span>
                      <span className="font-semibold text-ops-muted">{f.weight}%</span>
                    </div>
                    <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-ops-border">
                      <span
                        className={`block h-full rounded-full ${f.bar}`}
                        style={{ width: `${f.weight}%` }}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 border-t border-ops-border pt-3 text-[11px] leading-relaxed text-ops-muted">
              Scores blend five live signals per batch. The model recomputes as intake,
              contamination and crew positions change throughout the event.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
