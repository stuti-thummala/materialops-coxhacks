"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers,
  Route,
  Radio,
  Boxes,
  Users,
  DollarSign,
  ArrowUpRight,
  X,
  Maximize2,
  TrendingUp,
} from "lucide-react";
import { recoveryZones, materialBatches } from "@/lib/mockData";
import { forecastEvent, DEFAULT_EVENT, type EventProfile } from "@/lib/forecast";
import type { ZoneId } from "@/lib/types";

interface ZoneNode {
  id: ZoneId;
  name: string;
  short: string;
  x: number;
  y: number;
  color: string;
  batches: number;
  items: number;
  value: number;
  activity: "high" | "medium" | "low";
}

const COLORS: Record<string, string> = {
  emerald: "#1F9D66",
  blue: "#2F6FDB",
  cyan: "#2E8B82",
  teal: "#3E8C7A",
  lime: "#5E8C4A",
};

// Positions on a 1000 x 700 stage, arranged around the central stadium.
const POS: Record<ZoneId, { x: number; y: number; activity: ZoneNode["activity"] }> = {
  "stadium-bowl": { x: 500, y: 92, activity: "high" },
  gwcc: { x: 848, y: 214, activity: "high" },
  "arena-district": { x: 848, y: 470, activity: "medium" },
  "fan-plaza": { x: 500, y: 604, activity: "high" },
  "home-depot-backyard": { x: 152, y: 470, activity: "medium" },
  "parking-logistics": { x: 152, y: 214, activity: "low" },
};

const PARTNER_EXITS = [
  { name: "Sims Metal", from: "gwcc" as ZoneId, x: 980, y: 150 },
  { name: "ReUse Hub ATL", from: "arena-district" as ZoneId, x: 980, y: 540 },
  { name: "Interface Flooring", from: "fan-plaza" as ZoneId, x: 520, y: 686 },
];

const CENTER = { x: 500, y: 348 };

function petalPath(): string {
  // One pinwheel ETFE petal pointing up from the oculus, asymmetric for swirl.
  return "M506 300 L452 150 Q500 120 566 138 L520 300 Z";
}

/** Load-intensity color for the forecast heat (share of the busiest zone). */
function loadColor(intensity: number): string {
  if (intensity > 0.66) return "#C34A36"; // hotspot — stage crews first
  if (intensity > 0.33) return "#C9831A"; // warm
  return "#1F9D66"; // light
}

export function StadiumOpsMap({
  className = "",
  event = DEFAULT_EVENT,
  defaultForecastMode = false,
}: {
  className?: string;
  event?: EventProfile;
  defaultForecastMode?: boolean;
}) {
  const [selected, setSelected] = useState<ZoneId | null>(null);
  const [hover, setHover] = useState<ZoneId | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [forecastMode, setForecastMode] = useState(defaultForecastMode);
  const [roofOpen, setRoofOpen] = useState(true);

  const forecast = useMemo(() => forecastEvent(event), [event]);

  const zones: ZoneNode[] = useMemo(
    () =>
      recoveryZones.map((z) => ({
        id: z.id as ZoneId,
        name: z.name,
        short: z.shortName,
        x: POS[z.id as ZoneId].x,
        y: POS[z.id as ZoneId].y,
        color: COLORS[z.color] ?? "#1F9D66",
        batches: z.batchCount,
        items: z.itemCount,
        value: z.estimatedValue,
        activity: POS[z.id as ZoneId].activity,
      })),
    [],
  );

  const maxForecast = Math.max(...forecast.zones.map((z) => z.totalLbs));
  const forecastFor = (id: ZoneId) =>
    forecast.zones.find((z) => z.zoneId === id);

  const selectedZone = zones.find((z) => z.id === selected) ?? null;
  const selectedBatches = materialBatches.filter(
    (b) => b.sourceZone === selected,
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
      style={{
        background:
          "radial-gradient(120% 90% at 50% 10%, #0d2a3f 0%, #081923 55%, #050f17 100%)",
      }}
    >
      {/* ambient grid */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#3ad8c7" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <svg viewBox="0 0 1000 700" className="relative h-full w-full">
        <defs>
          <radialGradient id="pitch" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#1f9d66" />
            <stop offset="100%" stopColor="#0c5c3b" />
          </radialGradient>
          <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fe9ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#2f6fdb" stopOpacity="0.12" />
          </linearGradient>
          <radialGradient id="halo" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#0d2533" stopOpacity="0" />
            <stop offset="92%" stopColor="#2E8B82" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2E8B82" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* recovery circuit (orbiting particles path) */}
        <path
          id="circuit"
          d="M120 348 a 380 256 0 1 0 760 0 a 380 256 0 1 0 -760 0"
          fill="none"
          stroke={showRoutes ? "rgba(90,220,255,0.22)" : "transparent"}
          strokeWidth="1.5"
          strokeDasharray="3 7"
        />

        {/* stadium building envelope */}
        <ellipse
          cx={CENTER.x}
          cy={CENTER.y}
          rx="330"
          ry="222"
          fill="rgba(13,37,51,0.65)"
          stroke="rgba(120,214,255,0.25)"
          strokeWidth="2"
        />
        <ellipse cx={CENTER.x} cy={CENTER.y} rx="330" ry="222" fill="url(#halo)" />

        {/* halo board ring */}
        <ellipse
          cx={CENTER.x}
          cy={CENTER.y}
          rx="232"
          ry="150"
          fill="none"
          stroke="rgba(34,211,238,0.5)"
          strokeWidth="6"
          strokeDasharray="2 6"
        />

        {/* pitch */}
        <ellipse cx={CENTER.x} cy={CENTER.y} rx="150" ry="92" fill="url(#pitch)" />
        <ellipse
          cx={CENTER.x}
          cy={CENTER.y}
          rx="150"
          ry="92"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />
        <line
          x1={CENTER.x}
          y1={CENTER.y - 92}
          x2={CENTER.x}
          y2={CENTER.y + 92}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r="26"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />

        {/* signature 8-petal pinwheel roof */}
        <g style={{ transition: "opacity 0.6s" }} opacity={0.92}>
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={petalPath()}
              fill="url(#petal)"
              stroke="rgba(159,233,255,0.5)"
              strokeWidth="1.2"
              style={{
                transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
                transform: `rotate(${i * 45}deg) translateY(${roofOpen ? -22 : 6}px) scale(${roofOpen ? 0.82 : 1.04})`,
                transition: "transform 0.9s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          ))}
          {/* oculus aperture ring */}
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={roofOpen ? 58 : 30}
            fill="none"
            stroke="rgba(159,233,255,0.8)"
            strokeWidth="2"
            style={{ transition: "all 0.9s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </g>

        {/* export spokes to partners */}
        {showRoutes &&
          PARTNER_EXITS.map((p) => {
            const z = zones.find((zz) => zz.id === p.from);
            if (!z) return null;
            const d = `M${z.x} ${z.y} Q${(z.x + p.x) / 2} ${(z.y + p.y) / 2 - 40} ${p.x} ${p.y}`;
            return (
              <g key={p.name}>
                <path id={`exit-${p.from}`} d={d} fill="none" stroke="rgba(94,140,74,0.45)" strokeWidth="1.5" strokeDasharray="2 6" />
                <circle r="3.5" fill="#5E8C4A" filter="url(#glow)">
                  <animateMotion dur="3.4s" repeatCount="indefinite" rotate="auto">
                    <mpath href={`#exit-${p.from}`} />
                  </animateMotion>
                </circle>
                <foreignObject x={p.x - 46} y={p.y - 12} width="120" height="26">
                  <div className="rounded-md border border-[#5E8C4A]/40 bg-[#0a1822]/90 px-2 py-0.5 text-center text-[9px] font-semibold text-[#b6cda3]">
                    {p.name}
                  </div>
                </foreignObject>
              </g>
            );
          })}

        {/* orbiting recovery particles */}
        {showRoutes &&
          [0, 2.3, 4.6, 7, 9.3, 11.6].map((begin, i) => (
            <circle key={i} r="3" fill="#2E8B82" filter="url(#glow)">
              <animateMotion
                dur="14s"
                repeatCount="indefinite"
                rotate="auto"
                begin={`-${begin}s`}
              >
                <mpath href="#circuit" />
              </animateMotion>
            </circle>
          ))}

        {/* zone nodes */}
        {zones.map((z) => {
          const active = hover === z.id || selected === z.id;
          const f = forecastFor(z.id);
          const intensity = f ? f.totalLbs / maxForecast : 0;
          const tone = forecastMode && f ? loadColor(intensity) : z.color;
          return (
            <g
              key={z.id}
              className="cursor-pointer"
              onMouseEnter={() => setHover(z.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setSelected(z.id)}
            >
              <circle cx={z.x} cy={z.y} r={active ? 11 : 8} fill={z.color} stroke="#06121b" strokeWidth="2.5" filter="url(#glow)" />
              <foreignObject
                x={z.x - 82}
                y={z.y - (forecastMode ? 72 : 54)}
                width="164"
                height={forecastMode ? 64 : 42}
              >
                <div className={`text-center transition ${active ? "scale-105" : ""}`}>
                  <div className="inline-block rounded-md bg-[#06121b]/85 px-2 py-1 backdrop-blur-sm">
                    <div className="text-[11px] font-bold leading-none text-white">{z.short}</div>
                    {forecastMode && f ? (
                      <>
                        <div
                          className="mt-1 text-[9px] font-semibold leading-none"
                          style={{ color: tone }}
                        >
                          ~{f.totalLbs.toLocaleString()} lbs · {f.recommendedCrews} crew
                          {f.recommendedCrews > 1 ? "s" : ""}
                        </div>
                        <div className="mt-1 text-[8px] leading-none text-cyan-200/60">
                          peak {f.peakWindow}
                        </div>
                      </>
                    ) : (
                      <div className="mt-0.5 text-[8.5px] leading-none text-cyan-200/70">
                        {z.batches} batches
                      </div>
                    )}
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* top-left controls */}
      <div className="absolute left-4 top-4 flex flex-col gap-1.5">
        <MapBtn active={showRoutes} onClick={() => setShowRoutes((v) => !v)} title="Routes">
          <Route className="h-4 w-4" />
        </MapBtn>
        <MapBtn active={forecastMode} onClick={() => setForecastMode((v) => !v)} title="Forecast overlay">
          <TrendingUp className="h-4 w-4" />
        </MapBtn>
        <MapBtn active={roofOpen} onClick={() => setRoofOpen((v) => !v)} title="Toggle roof">
          <Layers className="h-4 w-4" />
        </MapBtn>
      </div>

      {/* live / mode pill */}
      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-emerald-400/30 bg-[#06121b]/85 px-3 py-1.5 text-xs font-medium text-emerald-200 backdrop-blur">
        <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
        {forecastMode ? "Forecast — next FIFA match" : "Live recovery circuit"}
      </div>

      {/* legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-white/10 bg-[#06121b]/80 px-3 py-2 text-[10px] text-slate-300 backdrop-blur">
        {forecastMode ? (
          <>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" />Hotspot · stage first</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Moderate load</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Light load</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" />Recovery flow</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-lime-400" />Partner export</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Zone activity</span>
          </>
        )}
      </div>

      {/* detail popover */}
      {selectedZone && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-4 right-4 w-72 rounded-2xl border border-white/10 bg-[#0b1a26]/95 p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedZone.color }} />
                <span className="font-display text-base font-semibold text-white">{selectedZone.short}</span>
              </div>
              <div className="text-xs text-slate-400">{selectedZone.name}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat icon={<Boxes className="h-3.5 w-3.5" />} label="Batches" value={`${selectedZone.batches}`} />
            <Stat icon={<ArrowUpRight className="h-3.5 w-3.5" />} label="Items" value={selectedZone.items.toLocaleString()} />
            <Stat icon={<DollarSign className="h-3.5 w-3.5" />} label="Value" value={`$${selectedZone.value.toLocaleString()}`} />
            <Stat icon={<Users className="h-3.5 w-3.5" />} label="Forecast" value={`${(forecastFor(selectedZone.id)?.totalLbs ?? 0).toLocaleString()} lbs`} />
          </div>

          {selectedBatches.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {selectedBatches.slice(0, 3).map((b) => (
                <Link
                  key={b.id}
                  href={`/batches/${b.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-cyan-400/40"
                >
                  <span className="font-medium">{b.id}</span>
                  <span className="text-slate-400">{b.material}</span>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/dispatch"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 py-2.5 text-sm font-semibold text-[#06121b] transition hover:brightness-110"
          >
            <Maximize2 className="h-4 w-4" /> Dispatch to {selectedZone.short}
          </Link>
        </motion.div>
      )}
    </div>
  );
}

function MapBtn({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#06121b]/85 backdrop-blur transition hover:bg-white/10 ${
        active ? "text-cyan-300" : "text-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-[10px] text-slate-400">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
