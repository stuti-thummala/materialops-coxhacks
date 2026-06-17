"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Satellite,
  Footprints,
  Radio,
  Boxes,
  DollarSign,
  ArrowUpRight,
  Navigation,
  Box,
  Maximize2,
  Minimize2,
  Camera,
  Route,
} from "lucide-react";
import { siteZones, type SiteZone } from "./siteZones";
import { FieldGuideOverlay } from "./FieldGuideOverlay";
import { StreetViewScene } from "./StreetViewScene";
import type { TrashAnchor } from "./trashAnchors";
import { materialBatches } from "@/lib/mockData";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";
import {
  kindToMaterial,
  sizeForVolume,
  type SpotReport,
} from "@/lib/spotReports";

const CommandMap = dynamic(() => import("./CommandMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0b1118] text-sm text-emerald-200/60">
      Initializing 3D recovery scene…
    </div>
  ),
});

type Mode = "command" | "satellite" | "street";

/** Roll every field capture into ONE batch anchor — a single glowing marker
 * for the whole Biltmore drop carrying its passport, item count and value,
 * instead of one floating tab per item. */
function batchAnchorForDrops(
  drops: ReadonlyArray<SpotReport>,
  bearing?: number,
): TrashAnchor {
  const newest = drops[0];
  const types = Array.from(new Set(drops.map((r) => r.ai.type)));
  const weightLbs =
    Math.round(drops.reduce((sum, r) => sum + (Number(r.ai.estWeightLbs) || 0), 0) * 10) / 10;
  const valueUsd = Math.round(drops.reduce((sum, r) => sum + (Number(r.ai.valueUsd) || 0), 0));
  return {
    id: `${newest.passportId}-batch`,
    label: "Biltmore Field Recovery",
    material: kindToMaterial(newest.kind),
    bearing: bearing ?? newest.coords?.heading ?? 0,
    distance: 7,
    size: sizeForVolume(newest.volume),
    conf: Math.round(newest.ai.confidence * 100),
    batchId: newest.passportId,
    fieldDetail: {
      materialType: types.join(", "),
      weightLbs,
      destination: newest.disposal?.dropOff.name ?? "ReUse Hub ATL",
      path: newest.ai.path,
      stage: "Recovered · awaiting pickup",
      eta: newest.disposal ? `${newest.disposal.etaMin} min to drop-off` : "Live · just now",
      origin: newest.locationDetail,
      passportId: newest.passportId,
      items: `${types.length} item${types.length === 1 ? "" : "s"}`,
      valueUsd,
    },
  };
}

export function StadiumExplorer({
  className = "",
  initialMode = "command",
}: Readonly<{ className?: string; initialMode?: Mode }>) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [selected, setSelected] = useState<SiteZone>(siteZones[0]);
  const [liveDropId, setLiveDropId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const spotReports = useMaterialOpsStore((s) => s.spotReports);
  const fieldDrops = useMemo(
    () => spotReports.filter((r) => r.coords),
    [spotReports],
  );
  // The field captures from the mobile app all belong to ONE live recovery
  // batch (the Biltmore drop) — surface them as a single batch entry keyed by
  // the batch passport, not a row per item.
  const fieldBatch = useMemo(() => {
    if (fieldDrops.length === 0) return null;
    const newest = fieldDrops[0];
    const types = Array.from(new Set(fieldDrops.map((r) => r.ai.type)));
    return {
      passportId: newest.passportId,
      label: newest.coords?.label?.split("·")[0]?.trim() ?? "Field capture",
      count: types.length,
      types,
      newestId: newest.id,
    };
  }, [fieldDrops]);
  // Off-campus Biltmore recovery line lights up only once a Biltmore scan has
  // been accepted on the mobile app — mirrors the command & dispatch maps.
  const biltmoreActive = useMemo(
    () =>
      spotReports.some(
        (r) => r.coords && r.zoneName.toLowerCase().includes("biltmore"),
      ),
    [spotReports],
  );
  const liveDrop = fieldDrops.find((r) => r.id === liveDropId) ?? null;
  const dropAnchors = useMemo(
    () => (liveDrop && fieldDrops.length > 0 ? [batchAnchorForDrops(fieldDrops)] : []),
    [liveDrop, fieldDrops],
  );

  // Once a Biltmore scan has landed, surface that fresh batch as a single
  // floating tab inside the *other* zone walk-throughs too — sells the "it's
  // live, not a preset zone" story to anyone exploring the venue after.
  const liveBatchAnchors = useMemo(
    () =>
      fieldDrops.length > 0
        ? [batchAnchorForDrops(fieldDrops, selected.sv.heading - 16)]
        : [],
    [fieldDrops, selected.sv.heading],
  );

  // When a fresh field capture lands, jump the view to it — this is the
  // "ops dashboard updates the moment a photo comes in" moment.
  const newestDropId = fieldDrops[0]?.id ?? null;
  const lastSeenDrop = useRef<string | null>(null);
  useEffect(() => {
    if (newestDropId && newestDropId !== lastSeenDrop.current) {
      lastSeenDrop.current = newestDropId;
      setLiveDropId(newestDropId);
      setMode("street");
    }
  }, [newestDropId]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void rootRef.current?.requestFullscreen();
    }
  };

  const zoneBatches = materialBatches.filter((b) => b.sourceZone === selected.id);

  // Clicking a marker / label on the map selects that zone, exactly like
  // clicking its entry in the side rail.
  const selectZoneById = (id: SiteZone["id"]) => {
    const zone = siteZones.find((z) => z.id === id);
    if (!zone) return;
    setSelected(zone);
    setLiveDropId(null);
  };

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden border border-white/10 bg-[#06121b] ${
        fullscreen ? "h-screen w-screen rounded-none" : `rounded-2xl ${className}`
      }`}
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_260px]">
        {/* map / street view stage */}
        <div className="relative h-full min-h-[360px]">
          {mode === "command" && (
            <CommandMap
              styleMode="3d"
              focusZoneId={selected.id}
              showAgents={false}
              onZoneSelect={selectZoneById}
              biltmoreActive={biltmoreActive}
            />
          )}
          {mode === "satellite" && (
            <CommandMap
              styleMode="satellite"
              focusZoneId={selected.id}
              showAgents={false}
              onZoneSelect={selectZoneById}
              biltmoreActive={biltmoreActive}
            />
          )}
          {mode === "street" && liveDrop && (
            <StreetViewScene
              key={liveDrop.id}
              zoneId={selected.id}
              override={liveDrop.coords}
              dynamicAnchors={dropAnchors}
            />
          )}
          {mode === "street" && !liveDrop && (
            <StreetViewScene
              key={selected.id}
              zoneId={selected.id}
              extraAnchors={liveBatchAnchors}
            />
          )}

          {/* cinematic grade — vignette, atmospheric tint, top/bottom letterbox
              fade — over the map modes so it feels like a live ops feed */}
          {mode !== "street" && (
            <div className="pointer-events-none absolute inset-0 z-[400]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_46%,rgba(4,9,14,0.55)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,16,24,0.55)_0%,transparent_18%,transparent_78%,rgba(6,16,24,0.7)_100%)]" />
              <div className="absolute inset-0 mix-blend-soft-light bg-[linear-gradient(120deg,rgba(45,212,191,0.16)_0%,transparent_45%,rgba(56,189,248,0.14)_100%)]" />
            </div>
          )}

          {/* AI guidance overlay (walk-through, zone view only) */}
          {mode === "street" && !liveDrop && <FieldGuideOverlay zoneId={selected.id} />}

          {/* live field-drop banner */}
          {mode === "street" && liveDrop && fieldBatch && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] max-w-xs rounded-xl border border-emerald-400/30 bg-[#06121b]/90 p-3 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                <Camera className="h-3.5 w-3.5" />
                Live field batch · passport {fieldBatch.passportId}
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                Biltmore Field Recovery · {fieldBatch.types.length} items
              </div>
              <div className="mt-0.5 text-[11px] text-white/55">
                {fieldBatch.types.join(", ")}
              </div>
              {liveDrop.disposal && (
                <div className="mt-2 flex items-start gap-1.5 border-t border-white/10 pt-2 text-[11px] text-emerald-200/80">
                  <Route className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-300" />
                  <span>
                    {liveDrop.disposal.path} → {liveDrop.disposal.dropOff.name} ·{" "}
                    {liveDrop.disposal.distanceMi} mi · ETA {liveDrop.disposal.etaMin} min
                  </span>
                </div>
              )}
            </div>
          )}

          {/* mode toggle */}
          <div className="absolute left-3 top-3 z-[500] flex overflow-hidden rounded-xl border border-white/10 bg-[#06121b]/90 backdrop-blur">
            <ModeBtn active={mode === "command"} onClick={() => setMode("command")}>
              <Box className="h-4 w-4" /> 3D Recovery
            </ModeBtn>
            <ModeBtn active={mode === "satellite"} onClick={() => setMode("satellite")}>
              <Satellite className="h-4 w-4" /> Satellite
            </ModeBtn>
            <ModeBtn active={mode === "street"} onClick={() => setMode("street")}>
              <Footprints className="h-4 w-4" /> Walk-through
            </ModeBtn>
          </div>

          {/* live pill */}
          <div className="absolute right-3 top-3 z-[500] flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-[#06121b]/90 px-3 py-1.5 text-xs font-medium text-emerald-200 backdrop-blur">
              <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              {livePillLabel(mode)}
            </div>
            <button
              onClick={toggleFullscreen}
              title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#06121b]/90 text-white/70 backdrop-blur transition hover:text-white"
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* zone rail */}
        <div className="flex flex-col border-t border-white/10 bg-[#081923] lg:border-l lg:border-t-0">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="font-display text-sm font-semibold text-white">
              Recovery district
            </div>
            <div className="text-[11px] text-white/45">
              {siteZones.length} zones · click to {mode === "street" ? "walk" : "fly"} there
            </div>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
            {fieldBatch && (
              <div className="mb-2 space-y-1.5">
                <div className="flex items-center gap-1.5 px-1 text-[10.5px] font-semibold uppercase tracking-wide text-emerald-300/80">
                  <Radio className="h-3 w-3 animate-pulse" />
                  Live field batch
                </div>
                <button
                  onClick={() => {
                    setLiveDropId(fieldBatch.newestId);
                    setMode("street");
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    liveDropId !== null && mode === "street"
                      ? "border-emerald-400/40 bg-emerald-400/[0.08]"
                      : "border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <Camera className="h-3.5 w-3.5 flex-shrink-0 text-emerald-300" />
                  <span className="flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-white">
                        {fieldBatch.passportId}
                      </span>
                      <span className="rounded-full bg-emerald-400/15 px-1.5 text-[10px] font-semibold text-emerald-200">
                        {fieldBatch.count} items
                      </span>
                    </span>
                    <span className="block text-[10.5px] text-white/45">
                      {fieldBatch.label} · {fieldBatch.types.join(", ")}
                    </span>
                  </span>
                  {liveDropId !== null && mode === "street" && (
                    <Navigation className="h-3.5 w-3.5 text-emerald-300" />
                  )}
                </button>
              </div>
            )}
            {siteZones.map((z) => {
              const active = z.id === selected.id && !(liveDrop && mode === "street");
              return (
                <button
                  key={z.id}
                  onClick={() => {
                    setSelected(z);
                    setLiveDropId(null);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-white/20 bg-white/[0.07]"
                      : "border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full ring-1 ring-white/50"
                    style={{
                      background: z.color,
                      boxShadow: `0 0 6px ${z.color}, 0 0 12px ${z.color}99`,
                    }}
                  />
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold text-white">
                      {z.short}
                    </span>
                    <span className="block text-[10.5px] text-white/45">
                      {z.batches} batches · {z.items.toLocaleString()} items
                    </span>
                  </span>
                  {active && <Navigation className="h-3.5 w-3.5 text-emerald-300" />}
                </button>
              );
            })}
          </div>

          {/* selected zone stats */}
          <div className="border-t border-white/10 p-3">
            <div className="grid grid-cols-3 gap-1.5">
              <MiniStat icon={<Boxes className="h-3 w-3" />} value={`${selected.batches}`} label="Batches" />
              <MiniStat icon={<ArrowUpRight className="h-3 w-3" />} value={selected.items.toLocaleString()} label="Items" />
              <MiniStat icon={<DollarSign className="h-3 w-3" />} value={`$${(selected.value / 1000).toFixed(1)}k`} label="Value" />
            </div>
            {zoneBatches.length > 0 && (
              <Link
                href={`/batches/${zoneBatches[0].id}`}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 py-2 text-[13px] font-semibold text-[#06121b] transition hover:brightness-110"
              >
                Open {zoneBatches[0].id}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function livePillLabel(mode: Mode): string {
  if (mode === "street") return "AI Object Scan · On-site";
  if (mode === "satellite") return "Satellite · Mercedes-Benz Stadium";
  return "Live · Recovery Command";
}

function ModeBtn({
  children,
  active,
  onClick,
}: Readonly<{ children: React.ReactNode; active: boolean; onClick: () => void }>) {  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition ${
        active ? "bg-[#1F9D66] text-white" : "text-white/70 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MiniStat({
  icon,
  value,
  label,
}: Readonly<{ icon: React.ReactNode; value: string; label: string }>) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-semibold text-white">{value}</div>
    </div>
  );
}
