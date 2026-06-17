"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Minus,
  Layers,
  LocateFixed,
  Radio,
  X,
  Boxes,
  Users,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

type Activity = "High Activity" | "Medium" | "Low";

interface Zone {
  id: string;
  name: string;
  area: string;
  activity: Activity;
  color: string;
  fill: string;
  marker: string;
  points: string;
  label: { x: number; y: number };
  dot: { x: number; y: number };
  batches: number;
  items: number;
  crews: number;
  value: number;
}

// Coordinates are on a 1000 x 560 overlay laid over the aerial photo.
// The stadium sits in the center, so zones wrap around it.
const zones: Zone[] = [
  {
    id: "A",
    name: "Zone A",
    area: "Plaza North",
    activity: "High Activity",
    color: "#22c55e",
    fill: "rgba(34,197,94,0.28)",
    marker: "#22c55e",
    points: "40,30 330,30 300,120 150,150 40,130",
    label: { x: 70, y: 70 },
    dot: { x: 210, y: 95 },
    batches: 8,
    items: 3120,
    crews: 4,
    value: 4210,
  },
  {
    id: "B",
    name: "Zone B",
    area: "East Concourse",
    activity: "Medium",
    color: "#eab308",
    fill: "rgba(234,179,8,0.26)",
    marker: "#eab308",
    points: "690,30 960,30 960,170 800,180 720,110",
    label: { x: 790, y: 70 },
    dot: { x: 880, y: 100 },
    batches: 6,
    items: 1840,
    crews: 3,
    value: 5620,
  },
  {
    id: "C",
    name: "Zone C",
    area: "South Plaza",
    activity: "High Activity",
    color: "#ef4444",
    fill: "rgba(239,68,68,0.26)",
    marker: "#ef4444",
    points: "40,360 220,350 300,430 280,530 40,530",
    label: { x: 70, y: 480 },
    dot: { x: 180, y: 440 },
    batches: 5,
    items: 2450,
    crews: 5,
    value: 2860,
  },
  {
    id: "D",
    name: "Zone D",
    area: "West Concourse",
    activity: "Low",
    color: "#3E6CA8",
    fill: "rgba(62,108,168,0.24)",
    marker: "#3E6CA8",
    points: "360,450 650,450 650,530 360,530",
    label: { x: 450, y: 492 },
    dot: { x: 505, y: 480 },
    batches: 4,
    items: 2120,
    crews: 2,
    value: 3380,
  },
  {
    id: "E",
    name: "Zone E",
    area: "Service Area",
    activity: "Medium",
    color: "#a855f7",
    fill: "rgba(168,85,247,0.28)",
    marker: "#a855f7",
    points: "720,360 960,360 960,530 720,530 700,440",
    label: { x: 752, y: 480 },
    dot: { x: 840, y: 440 },
    batches: 6,
    items: 1640,
    crews: 3,
    value: 2980,
  },
];

const activityStyles: Record<Activity, string> = {
  "High Activity": "bg-emerald-500/90 text-white",
  Medium: "bg-amber-500/90 text-white",
  Low: "bg-sky-500/90 text-white",
};

export function InteractiveStadiumMap() {
  const [selected, setSelected] = useState<Zone | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showZones, setShowZones] = useState(true);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a1018]">
      {/* aerial photo base */}
      <div
        className="absolute inset-0 origin-center transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        <img
          src="/stadium-aerial.jpg"
          alt="Aerial view of Mercedes-Benz Stadium"
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,24,0.20),rgba(8,14,24,0.50))]" />

        {/* zone overlays */}
        {showZones && (
          <svg
            viewBox="0 0 1000 560"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            {zones.map((z) => {
              const isActive = hover === z.id || selected?.id === z.id;
              return (
                <g
                  key={z.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover(z.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setSelected(z)}
                >
                  <polygon
                    points={z.points}
                    fill={z.fill}
                    stroke={z.color}
                    strokeWidth={isActive ? 3.5 : 2}
                    opacity={isActive ? 1 : 0.92}
                    style={{ transition: "all 0.2s" }}
                  />
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* zone labels + markers (fixed, not zoomed) */}
      {showZones && (
        <svg
          viewBox="0 0 1000 560"
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          {zones.map((z) => (
            <g
              key={z.id}
              className="pointer-events-auto cursor-pointer"
              onClick={() => setSelected(z)}
            >
              <foreignObject x={z.label.x} y={z.label.y - 38} width="190" height="64">
                <div className="inline-block rounded-lg bg-black/55 px-2.5 py-1.5 backdrop-blur-sm">
                  <div className="text-[15px] font-bold leading-tight text-white">{z.name}</div>
                  <div className="text-[11px] leading-tight text-slate-300">{z.area}</div>
                  <span
                    className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${activityStyles[z.activity]}`}
                  >
                    {z.activity}
                  </span>
                </div>
              </foreignObject>

              <circle cx={z.dot.x} cy={z.dot.y} r="11" fill={z.marker} opacity="0.4" className="map-ping" />
              <circle cx={z.dot.x} cy={z.dot.y} r="7" fill={z.marker} stroke="#fff" strokeWidth="2" />
            </g>
          ))}
        </svg>
      )}

      {/* top-left controls */}
      <div className="absolute left-4 top-4 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(1)))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0c1320]/90 text-slate-200 backdrop-blur transition hover:bg-white/10"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(1)))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0c1320]/90 text-slate-200 backdrop-blur transition hover:bg-white/10"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowZones((s) => !s)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0c1320]/90 backdrop-blur transition hover:bg-white/10 ${showZones ? "text-emerald-400" : "text-slate-200"}`}
          aria-label="Toggle zone overlays"
        >
          <Layers className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setSelected(null);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0c1320]/90 text-slate-200 backdrop-blur transition hover:bg-white/10"
          aria-label="Recenter"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      {/* live pill */}
      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-emerald-400/30 bg-[#0c1320]/90 px-3 py-1.5 text-xs font-medium text-emerald-200 backdrop-blur">
        <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
        Live View
      </div>

      {/* zone detail popover */}
      {selected && (
        <div className="animate-scale-in absolute bottom-4 right-4 w-72 rounded-2xl border border-white/10 bg-[#101826]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selected.marker }} />
                <span className="text-base font-semibold text-white">{selected.name}</span>
              </div>
              <div className="text-xs text-slate-400">{selected.area}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <span
            className={`mt-2 inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${activityStyles[selected.activity]}`}
          >
            {selected.activity}
          </span>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Stat icon={<Boxes className="h-3.5 w-3.5" />} label="Batches" value={`${selected.batches}`} />
            <Stat icon={<Users className="h-3.5 w-3.5" />} label="Crews" value={`${selected.crews}`} />
            <Stat icon={<ArrowUpRight className="h-3.5 w-3.5" />} label="Items" value={selected.items.toLocaleString()} />
            <Stat icon={<DollarSign className="h-3.5 w-3.5" />} label="Value" value={`$${selected.value.toLocaleString()}`} />
          </div>

          <Link
            href="/dispatch"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-lime-400 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Dispatch crew to {selected.name}
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
      <div className="flex items-center gap-1 text-[11px] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-semibold text-slate-100">{value}</div>
    </div>
  );
}
