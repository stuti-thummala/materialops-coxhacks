"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Radio, Truck, Leaf, Users, MapPin, Plus } from "lucide-react";
import { forecastEvent, DEFAULT_EVENT } from "@/lib/forecast";
import { aggregateImpact, type RecoveryPathKey } from "@/lib/warm";
import { SUSTAINABILITY_FACTS, VENUE_FACTS } from "@/lib/stadiumGeo";
import { crews, recoveryTasks, materialBatches } from "@/lib/mockData";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import { makeBiltmoreDrop } from "@/lib/spotReports";

const CommandMap = dynamic(() => import("@/components/map/CommandMap"), {
  ssr: false,
});

const CREW_STATUS_COLOR: Record<string, string> = {
  available: "#1F9D66",
  "in-progress": "#C9831A",
  offline: "#94a3b8",
};

// Shared HUD chrome so every panel reads as the same refined glass surface
// instead of a flat terminal box. Translucent gradient fill + bright top edge
// highlight + strong blur make each card clearly read as floating glass above
// the live map.
const PANEL_CARD =
  "rounded-xl border border-white/[0.14] bg-gradient-to-b from-white/[0.10] to-white/[0.03] px-3.5 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl transition-colors";
const SECTION_LABEL =
  "flex items-center gap-1.5 px-0.5 text-[10px] font-medium tracking-[0.28em] text-white/40";

export default function CommandPage() {
  const forecast = useMemo(() => forecastEvent(DEFAULT_EVENT), []);
  const spotReports = useMaterialOpsStore((s) => s.spotReports);
  const addSpotReport = useMaterialOpsStore((s) => s.addSpotReport);

  // A Biltmore field drop (accepted on mobile) lights up the new recovery line.
  const biltmoreActive = useMemo(
    () =>
      spotReports.some(
        (r) => r.coords && r.zoneName.toLowerCase().includes("biltmore"),
      ),
    [spotReports],
  );

  const nextPickup = useMemo(
    () => recoveryTasks.find((t) => t.status === "assigned"),
    [],
  );
  const partnerQueue = useMemo(
    () => materialBatches.filter((b) => b.status !== "in-transit").length,
    [],
  );

  const impact = useMemo(() => {
    const lines = forecast.zones.flatMap((z) =>
      z.materials.map((m) => ({
        material: m.material,
        weightLbs: m.lbs,
        path: m.path as RecoveryPathKey,
      })),
    );
    return aggregateImpact(lines);
  }, [forecast]);

  const co2eTarget = impact.co2eAvoidedMt;

  const [factIndex, setFactIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setFactIndex((i) => (i + 1) % VENUE_FACTS.length),
      4200,
    );
    return () => clearInterval(t);
  }, []);

  const co2eDisplay = co2eTarget.toFixed(2);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0b1118] font-mono text-white">
      <div className="absolute inset-0">
        <CommandMap biltmoreActive={biltmoreActive} />
      </div>

      {/* scanline + vignette overlay */}
      <div className="cmd-scanlines pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,9,13,0.72)_100%)]" />

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <div className="pointer-events-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-gradient-to-b from-white/[0.10] to-white/[0.03] px-3 py-1.5 text-[11px] tracking-[0.2em] text-emerald-300 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl transition hover:border-emerald-400/60 hover:from-white/[0.16]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> COMMAND
          </Link>
          <div className="mt-3 text-[10px] tracking-[0.35em] text-white/40">
            MATERIALOPS · LIVE RECOVERY COMMAND
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Mercedes-Benz Stadium
          </h1>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-emerald-300/80">
            <span className="cmd-blink h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>33.7554°N · 84.4008°W · ATLANTA GA</span>
          </div>
        </div>

        {/* live impact counter */}
        <div className="pointer-events-auto w-[240px] rounded-2xl border border-emerald-400/30 bg-gradient-to-b from-white/[0.11] to-white/[0.03] p-4 shadow-[0_12px_34px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl">
          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.28em] text-emerald-300/70">
            <Leaf className="h-3 w-3" /> CO₂e AVOIDED — LIVE
          </div>
          <div className="mt-1.5 font-display text-4xl font-bold tabular-nums leading-none text-emerald-300">
            {co2eDisplay}
          </div>
          <div className="mt-1.5 text-[10px] tracking-[0.2em] text-white/45">
            METRIC TONS · EPA WARM
          </div>
          <div className="mt-3.5 space-y-1.5 border-t border-white/[0.1] pt-3 text-[10px] text-white/55">
            <div className="flex justify-between">
              <span className="tracking-[0.12em]">RECOVERED</span>
              <span className="tabular-nums font-semibold text-emerald-200/90">
                {forecast.totalTons.toFixed(1)} t
              </span>
            </div>
            <div className="flex justify-between">
              <span className="tracking-[0.12em]">DIVERSION</span>
              <span className="tabular-nums font-semibold text-emerald-200/90">
                {Math.round(forecast.projectedDiversionRate * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="tracking-[0.12em]">CAR-MILES</span>
              <span className="tabular-nums font-semibold text-emerald-200/90">
                {impact.equivalents.carMiles.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* left live logistics */}
      <section className="pointer-events-auto absolute left-5 top-[150px] bottom-[120px] w-[240px] space-y-2.5 overflow-y-auto pr-1 cmd-panel-scroll">
        <div className={SECTION_LABEL}>
          <Truck className="h-3 w-3" /> LIVE LOGISTICS
        </div>

        {/* incoming Biltmore recovery — only once accepted on mobile */}
        {biltmoreActive && (
          <div className="rounded-xl border border-fuchsia-400/50 bg-gradient-to-b from-fuchsia-500/[0.18] to-fuchsia-500/[0.05] px-3.5 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-fuchsia-300">
                BILTMORE INTAKE
              </span>
              <span className="cmd-blink h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            </div>
            <div className="text-[10px] text-white/55">
              New recovery line · inbound to stadium hub
            </div>
            <div className="mt-1 text-[10px] tracking-[0.2em] text-fuchsia-300/80">
              ● ROUTING NOW
            </div>
          </div>
        )}

        {/* next pickup */}
        {nextPickup && (
          <div className={PANEL_CARD}>
            <div className="flex items-center gap-1 text-[10px] tracking-[0.2em] text-white/45">
              <MapPin className="h-3 w-3" /> NEXT PICKUP
            </div>
            <div className="mt-0.5 text-[12px] font-semibold text-white">
              {nextPickup.batchIds.join(", ")} → {nextPickup.destination}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-white/55">
              <span>{nextPickup.estimatedPickupTime}</span>
              <span className="tabular-nums text-emerald-200/90">
                {nextPickup.distanceMiles} mi
              </span>
            </div>
          </div>
        )}

        {/* active crews */}
        <div className={`${SECTION_LABEL} pt-1`}>
          <Users className="h-3 w-3" /> ACTIVE CREWS
        </div>
        {crews.map((c) => (
          <div key={c.id} className={PANEL_CARD}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold tracking-wide text-white">
                {c.name}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: CREW_STATUS_COLOR[c.status] ?? "#94a3b8" }}
              />
            </div>
            <div className="text-[10px] text-white/45">{c.lead}</div>
            <div className="mt-1 flex items-center justify-between text-[10px]">
              <span className="text-white/55">{c.currentZone}</span>
              <span
                className="tracking-[0.15em]"
                style={{ color: CREW_STATUS_COLOR[c.status] ?? "#94a3b8" }}
              >
                {c.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}

        {/* partner queue */}
        <div className={PANEL_CARD}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] text-white/45">
              PARTNER QUEUE
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-emerald-300">
              {partnerQueue} batches
            </span>
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-white/45">
            Awaiting handoff to recovery partners
          </div>
        </div>
      </section>

      {/* right sustainability facts */}
      <section className="pointer-events-auto absolute right-5 top-[240px] bottom-[120px] w-[240px] space-y-2.5 overflow-y-auto pl-1 cmd-panel-scroll">
        <div className={SECTION_LABEL}>
          <Radio className="h-3 w-3" /> LIVE RECOVERY FEED
        </div>
        {SUSTAINABILITY_FACTS.map((f) => (
          <div key={f.label} className={PANEL_CARD}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.2em] text-white/45">
                {f.label}
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-emerald-300">
                {f.value}
              </span>
            </div>
            <div className="mt-0.5 text-[10px] leading-snug text-white/45">
              {f.detail}
            </div>
          </div>
        ))}
      </section>

      {/* bottom venue ticker */}
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/[0.1] bg-black/30 px-5 py-2.5 backdrop-blur-2xl">
        <div className="flex items-center gap-3 text-[11px] tracking-[0.15em] text-white/60">
          <span className="cmd-blink rounded-md bg-emerald-400/15 px-2 py-0.5 font-medium text-emerald-300">
            ● LIVE
          </span>
          <span className="text-emerald-300/80">{VENUE_FACTS[factIndex]}</span>
        </div>
      </footer>

      {/* demo fallback: inject the Biltmore recovery line — icon-only purple HUD dot */}
      <button
        onClick={() =>
          addSpotReport(makeBiltmoreDrop("bottles", "Water bottles from Biltmore"))
        }
        disabled={biltmoreActive}
        title={biltmoreActive ? "Biltmore line live" : "Inject Biltmore recovery"}
        aria-label={biltmoreActive ? "Biltmore line live" : "Inject Biltmore recovery"}
        className={`pointer-events-auto absolute bottom-14 right-5 flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_10px_28px_rgba(168,40,200,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl transition ${
          biltmoreActive
            ? "cursor-default border-fuchsia-300/60 bg-fuchsia-500/40 text-white"
            : "border-fuchsia-300/60 bg-fuchsia-500/35 text-white hover:bg-fuchsia-500/55"
        }`}
      >
        {biltmoreActive ? (
          <span className="cmd-blink h-2.5 w-2.5 rounded-full bg-fuchsia-300" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </button>
    </main>
  );
}
