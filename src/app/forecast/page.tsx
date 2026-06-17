"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StadiumOpsMap } from "@/components/map/StadiumOpsMap";
import {
  Users,
  Recycle,
  Scale,
  CloudRain,
  Thermometer,
  TrendingUp,
  Sparkles,
  Play,
  CalendarClock,
  Target,
  ArrowUpRight,
} from "lucide-react";
import {
  forecastEvent,
  modelAccuracy,
  DEFAULT_EVENT,
  PAST_EVENTS,
  UPCOMING_EVENTS,
  type EventProfile,
  type EventType,
} from "@/lib/forecast";

const EVENT_TYPES: { id: EventType; label: string }[] = [
  { id: "fifa-match", label: "FIFA Match" },
  { id: "doubleheader", label: "Doubleheader" },
  { id: "concert", label: "Concert" },
  { id: "convention", label: "Convention" },
];

const EVENT_TYPE_LABEL: Record<EventType, string> = {
  "fifa-match": "FIFA Match",
  doubleheader: "Doubleheader",
  concert: "Concert",
  convention: "Convention",
};

const ANALYSIS_STEPS = [
  "Pulling 5 seasons of Mercedes-Benz Stadium event data…",
  "Matching attendance & weather to comparable events…",
  "Estimating per-zone material generation…",
  "Optimizing crew pre-staging windows…",
];

function sameProfile(a: EventProfile, b: EventProfile): boolean {
  return (
    a.attendance === b.attendance &&
    a.type === b.type &&
    a.tempF === b.tempF &&
    a.rainProbability === b.rainProbability
  );
}

export default function ForecastPage() {
  // `profile` reflects the live controls; `applied` is what the model has
  // finished analyzing and what the numbers below are derived from.
  const [profile, setProfile] = useState<EventProfile>(DEFAULT_EVENT);
  const [applied, setApplied] = useState<EventProfile>(DEFAULT_EVENT);
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const timers = useRef<{ step?: ReturnType<typeof setInterval>; done?: ReturnType<typeof setTimeout> }>({});

  const forecast = useMemo(() => forecastEvent(applied), [applied]);
  const maxLbs = Math.max(...forecast.zones.map((z) => z.totalLbs));
  const accuracy = useMemo(() => modelAccuracy(), []);
  const upcoming = useMemo(
    () =>
      UPCOMING_EVENTS.map((e) => ({ ...e, forecast: forecastEvent(e.profile) })),
    [],
  );

  const isDirty = !sameProfile(profile, applied);

  // Explicit analyze: only runs when the user clicks Analyze, not on every
  // slider/input change. Runs a short "AI analysis" pass before committing.
  function runAnalysis(next: EventProfile = profile) {
    clearInterval(timers.current.step);
    clearTimeout(timers.current.done);
    setAnalyzing(true);
    setStepIndex(0);
    timers.current.step = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, 380);
    timers.current.done = setTimeout(() => {
      clearInterval(timers.current.step);
      setApplied(next);
      setAnalyzing(false);
    }, 1500);
  }

  useEffect(() => {
    return () => {
      clearInterval(timers.current.step);
      clearTimeout(timers.current.done);
    };
  }, []);

  function set<K extends keyof EventProfile>(key: K, value: EventProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function loadEvent(next: EventProfile) {
    setProfile(next);
    runAnalysis(next);
  }

  let statusText = "Forecast is up to date with the current inputs.";
  if (analyzing) statusText = "Running the forecast model…";
  else if (isDirty)
    statusText = "Inputs changed — re-run the model to update the forecast.";

  return (
    <AppShell
      header={
        <PageHeader
          title="Pre-Event Forecast"
          subtitle="Predict recoverable material and pre-stage crews before kickoff"
        />
      }
    >
      <div className="animate-fade-up space-y-6">
        {/* controls */}
        <div className="rounded-2xl border border-ops-border bg-ops-surface p-5">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ops-muted">
                Event type
              </span>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {EVENT_TYPES.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => set("type", e.id)}
                    className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
                      profile.type === e.id
                        ? "border-ops-navy bg-ops-navy text-white"
                        : "border-ops-border text-ops-muted hover:text-ops-ink"
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <Control
              label="Attendance"
              icon={<Users className="h-4 w-4" />}
              value={profile.attendance}
              min={20000}
              max={75000}
              step={1000}
              display={profile.attendance.toLocaleString()}
              onChange={(v) => set("attendance", v)}
            />
            <Control
              label="Temperature"
              icon={<Thermometer className="h-4 w-4" />}
              value={profile.tempF}
              min={40}
              max={100}
              step={1}
              unit="°F"
              display={`${profile.tempF}°F`}
              onChange={(v) => set("tempF", v)}
            />
            <Control
              label="Rain probability"
              icon={<CloudRain className="h-4 w-4" />}
              value={Math.round(profile.rainProbability * 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
              display={`${Math.round(profile.rainProbability * 100)}%`}
              onChange={(v) => set("rainProbability", v / 100)}
            />
          </div>

          {/* analyze action */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ops-border pt-4">
            <div className="text-xs text-ops-muted">
              {statusText}
            </div>
            <button
              onClick={() => runAnalysis()}
              disabled={analyzing || !isDirty}
              className="flex items-center gap-2 rounded-lg bg-ops-green px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-ops-green/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {analyzing ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {analyzing ? "Analyzing…" : "Analyze forecast"}
            </button>
          </div>
        </div>

        {/* results — overlaid with the AI analysis state while modeling */}
        <div className="relative">
          {analyzing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl border border-ops-green/30 bg-ops-bg/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 rounded-xl border border-ops-border bg-ops-surface px-5 py-4 shadow-lg">
                <span className="relative flex h-9 w-9 items-center justify-center">
                  <span className="absolute h-9 w-9 animate-ping rounded-full bg-ops-green/30" />
                  <Sparkles className="h-5 w-5 text-ops-green" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-ops-ink">
                    AI analyzing historical Mercedes-Benz Stadium data…
                  </div>
                  <div className="mt-0.5 text-xs text-ops-muted">
                    {ANALYSIS_STEPS[stepIndex]}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className={`space-y-6 transition ${
              analyzing ? "pointer-events-none opacity-40" : "opacity-100"
            }`}
          >
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <Kpi icon={<Scale className="h-5 w-5" />} value={`${forecast.totalTons} t`} label="Projected recoverable" />
              <Kpi icon={<Recycle className="h-5 w-5" />} value={`${Math.round(forecast.projectedDiversionRate * 100)}%`} label="Projected diversion" />
              <Kpi icon={<Users className="h-5 w-5" />} value={`${forecast.recommendedCrews}`} label="Crews to pre-stage" />
              <Kpi icon={<TrendingUp className="h-5 w-5" />} value={forecast.zones[0].shortName} label={`Hotspot · peak ${forecast.zones[0].peakWindow}`} />
            </div>

            {/* map + breakdown */}
            <div className="grid gap-6 xl:grid-cols-5">
              <div className="xl:col-span-3">
                <StadiumOpsMap
                  className="h-[480px]"
                  event={applied}
                  defaultForecastMode
                />
              </div>

              <div className="space-y-2.5 xl:col-span-2">
                {forecast.zones.map((z) => (
                  <div
                    key={z.zoneId}
                    className="rounded-xl border border-ops-border bg-ops-surface p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-ops-ink">{z.shortName}</div>
                        <div className="text-[11px] text-ops-muted">
                          Peak {z.peakWindow} · {Math.round(z.confidence * 100)}% conf.
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-lg font-bold text-ops-ink">
                          {z.totalLbs.toLocaleString()} lbs
                        </div>
                        <div className="text-[11px] text-ops-green">
                          {z.recommendedCrews} crew{z.recommendedCrews > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-ops-bg">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ops-green to-lime-400"
                        style={{ width: `${(z.totalLbs / maxLbs) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {z.materials.map((m) => (
                        <span
                          key={m.material}
                          className="rounded-md bg-ops-bg px-2 py-0.5 text-[10px] text-ops-muted"
                        >
                          {m.material.split(" (")[0]} · {m.lbs.toLocaleString()} lbs
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* future predictions, modeled from past events */}
            <div className="rounded-2xl border border-ops-border bg-ops-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ops-green/10 text-ops-green">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-display text-sm font-semibold text-ops-ink">
                      Future Predictions
                    </div>
                    <div className="text-xs text-ops-muted">
                      Modeled from {accuracy.sampleSize} past Mercedes-Benz Stadium events
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-ops-green/30 bg-ops-green/[0.06] px-3 py-1 text-xs font-semibold text-ops-green">
                  <Target className="h-3.5 w-3.5" />
                  ±{accuracy.mapePct}% vs actuals
                </span>
              </div>

              <div className="mt-5 space-y-6">
                {/* upcoming predicted events */}
                <div>
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="text-sm font-semibold text-ops-ink">
                      Upcoming events — projected recovery
                    </span>
                    <span className="rounded-full bg-ops-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ops-green">
                      Forecast
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-ops-muted">
                    What the model expects each scheduled event to generate, so you can
                    pre-stage crews and partners ahead of time.
                  </p>
                  <div className="overflow-hidden rounded-xl border border-ops-border">
                    {/* column headers */}
                    <div className="hidden grid-cols-12 gap-3 border-b border-ops-border bg-ops-bg px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-ops-muted sm:grid">
                      <div className="col-span-5">Event</div>
                      <div className="col-span-2 text-right">Recoverable</div>
                      <div className="col-span-2 text-right">Diversion</div>
                      <div className="col-span-1 text-right">Crews</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>
                    {upcoming.map((e) => (
                      <div
                        key={e.id}
                        className="grid grid-cols-12 items-center gap-3 border-b border-ops-border bg-ops-surface px-4 py-3 last:border-b-0"
                      >
                        <div className="col-span-12 sm:col-span-5">
                          <div className="text-sm font-semibold text-ops-ink">{e.name}</div>
                          <div className="text-[11px] text-ops-muted">
                            {e.date} · {EVENT_TYPE_LABEL[e.profile.type]} ·{" "}
                            {e.profile.attendance.toLocaleString()} attendees
                          </div>
                        </div>
                        <div className="col-span-4 sm:col-span-2 sm:text-right">
                          <div className="text-[10px] uppercase tracking-wide text-ops-muted sm:hidden">
                            Recoverable
                          </div>
                          <div className="font-display text-base font-bold text-ops-ink">
                            {e.forecast.totalTons} t
                          </div>
                        </div>
                        <div className="col-span-4 sm:col-span-2 sm:text-right">
                          <div className="text-[10px] uppercase tracking-wide text-ops-muted sm:hidden">
                            Diversion
                          </div>
                          <div className="text-sm font-semibold text-ops-green">
                            {Math.round(e.forecast.projectedDiversionRate * 100)}%
                          </div>
                        </div>
                        <div className="col-span-4 sm:col-span-1 sm:text-right">
                          <div className="text-[10px] uppercase tracking-wide text-ops-muted sm:hidden">
                            Crews
                          </div>
                          <div className="text-sm font-semibold text-ops-ink">
                            {e.forecast.recommendedCrews}
                          </div>
                        </div>
                        <div className="col-span-12 sm:col-span-2 sm:flex sm:justify-end">
                          <button
                            onClick={() => loadEvent(e.profile)}
                            className="flex w-full items-center justify-center gap-1 rounded-md border border-ops-border bg-ops-bg px-2.5 py-1.5 text-[11px] font-medium text-ops-ink transition hover:border-ops-green hover:text-ops-green sm:w-auto"
                          >
                            Load
                            <ArrowUpRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* backtest: predicted vs actual */}
                <div>
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="text-sm font-semibold text-ops-ink">
                      Track record — predicted vs. actual
                    </span>
                    <span className="rounded-full bg-ops-blue/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ops-blue">
                      Verified
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-ops-muted">
                    How close the model&apos;s pre-event prediction landed to the tonnage
                    actually recovered — the proof behind the forecast above.
                  </p>
                  <div className="space-y-2.5">
                    {PAST_EVENTS.map((e) => {
                      const delta = +(
                        ((e.actualTons - e.predictedTons) / e.predictedTons) *
                        100
                      ).toFixed(1);
                      const accurate = Math.abs(delta) <= 3;
                      const maxT = Math.max(e.predictedTons, e.actualTons);
                      return (
                        <div
                          key={e.id}
                          className="rounded-xl border border-ops-border bg-ops-surface p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-ops-ink">{e.name}</div>
                              <div className="text-[11px] text-ops-muted">
                                {e.date} · {Math.round(e.actualDiversion * 100)}% diverted
                              </div>
                            </div>
                            <span
                              className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                accurate
                                  ? "bg-ops-green/10 text-ops-green"
                                  : "bg-ops-amber/10 text-ops-amber"
                              }`}
                            >
                              <Target className="h-3 w-3" />
                              {delta > 0 ? "+" : ""}
                              {delta}% off
                            </span>
                          </div>

                          {/* predicted vs actual bars */}
                          <div className="mt-3 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-16 text-[10px] font-medium uppercase tracking-wide text-ops-muted">
                                Predicted
                              </span>
                              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ops-bg">
                                <div
                                  className="h-full rounded-full bg-ops-blue/60"
                                  style={{ width: `${(e.predictedTons / maxT) * 100}%` }}
                                />
                              </div>
                              <span className="w-12 text-right text-xs font-semibold text-ops-ink">
                                {e.predictedTons} t
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-16 text-[10px] font-medium uppercase tracking-wide text-ops-muted">
                                Actual
                              </span>
                              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ops-bg">
                                <div
                                  className="h-full rounded-full bg-ops-green"
                                  style={{ width: `${(e.actualTons / maxT) * 100}%` }}
                                />
                              </div>
                              <span className="w-12 text-right text-xs font-semibold text-ops-ink">
                                {e.actualTons} t
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Control({
  label,
  icon,
  value,
  min,
  max,
  step,
  display,
  unit,
  onChange,
}: {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly display: string;
  readonly unit?: string;
  readonly onChange: (v: number) => void;
}) {
  function clamp(v: number) {
    if (Number.isNaN(v)) return min;
    return Math.min(max, Math.max(min, v));
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ops-muted">
          {icon}
          {label}
        </span>
        <span className="text-sm font-bold text-ops-ink">{display}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-ops-green"
      />
      <div className="mt-2 flex items-center gap-1.5">
        <input
          type="number"
          aria-label={`${label} exact value`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="w-full rounded-md border border-ops-border bg-ops-bg px-2 py-1 text-xs text-ops-ink focus:border-ops-green focus:outline-none"
        />
        {unit && <span className="text-xs text-ops-muted">{unit}</span>}
      </div>
    </div>
  );
}

function Kpi({
  icon,
  value,
  label,
}: {
  readonly icon: React.ReactNode;
  readonly value: string;
  readonly label: string;
}) {
  return (
    <div className="rounded-2xl border border-ops-border bg-ops-surface p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ops-green/10 text-ops-green">
        {icon}
      </span>
      <div className="mt-3 font-display text-2xl font-bold text-ops-ink">{value}</div>
      <div className="text-xs text-ops-muted">{label}</div>
    </div>
  );
}
