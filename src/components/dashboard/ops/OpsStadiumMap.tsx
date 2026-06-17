"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Minus,
  Layers,
  LocateFixed,
  Crosshair,
  X,
  Boxes,
  Users,
  ArrowRight,
} from "lucide-react";

type Status = "Active" | "On Track" | "Monitor" | "Attention" | "Standby";

interface Zone {
  id: string;
  name: string;
  color: string;
  status: Status;
  batches: number;
  crews: number;
  weight: string;
  points: string;
  label: { x: number; y: number };
  dot: { x: number; y: number };
  note: string;
}

const statusBadge: Record<Status, string> = {
  Active: "bg-ops-green/15 text-ops-green border-ops-green/30",
  "On Track": "bg-ops-blue/15 text-ops-blue border-ops-blue/30",
  Monitor: "bg-ops-amber/15 text-ops-amber border-ops-amber/30",
  Attention: "bg-ops-red/15 text-ops-red border-ops-red/30",
  Standby: "bg-ops-muted/15 text-ops-muted border-ops-muted/30",
};

const zones: Zone[] = [
  {
    id: "fan-plaza",
    name: "Fan Plaza",
    color: "#7251B5",
    status: "Active",
    batches: 9,
    crews: 4,
    weight: "3.2 t",
    points: "20,20 300,20 250,140 120,170 20,150",
    label: { x: 34, y: 44 },
    dot: { x: 150, y: 92 },
    note: "Heavy reusable cup volume after gates closed.",
  },
  {
    id: "north-gate",
    name: "North Gate",
    color: "#C34A36",
    status: "Attention",
    batches: 14,
    crews: 3,
    weight: "4.8 t",
    points: "320,20 680,20 640,120 360,120",
    label: { x: 430, y: 44 },
    dot: { x: 500, y: 78 },
    note: "Cardboard backlog exceeding crew capacity.",
  },
  {
    id: "concourse",
    name: "Concourse",
    color: "#C9831A",
    status: "Monitor",
    batches: 11,
    crews: 3,
    weight: "2.7 t",
    points: "700,20 980,20 980,160 850,170 740,120",
    label: { x: 770, y: 44 },
    dot: { x: 870, y: 96 },
    note: "Mixed recyclables awaiting sort verification.",
  },
  {
    id: "west-entrance",
    name: "West Entrance",
    color: "#2F6FDB",
    status: "On Track",
    batches: 6,
    crews: 2,
    weight: "1.9 t",
    points: "20,180 130,180 150,360 20,380",
    label: { x: 24, y: 204 },
    dot: { x: 95, y: 280 },
    note: "Steady flow, no intervention needed.",
  },
  {
    id: "south-gate",
    name: "South Gate",
    color: "#C9831A",
    status: "Monitor",
    batches: 8,
    crews: 2,
    weight: "2.3 t",
    points: "870,180 980,190 980,380 850,360",
    label: { x: 838, y: 204 },
    dot: { x: 912, y: 280 },
    note: "Vendor packaging accumulating near exits.",
  },
  {
    id: "vendor-village",
    name: "Vendor Village",
    color: "#1F9D66",
    status: "On Track",
    batches: 7,
    crews: 3,
    weight: "2.1 t",
    points: "20,410 150,400 230,470 200,540 20,540",
    label: { x: 26, y: 432 },
    dot: { x: 120, y: 478 },
    note: "Food-service compostables flowing to sort line.",
  },
  {
    id: "transit-dropoff",
    name: "Transit Drop-Off",
    color: "#2F6FDB",
    status: "Standby",
    batches: 4,
    crews: 1,
    weight: "1.1 t",
    points: "330,440 670,440 670,540 330,540",
    label: { x: 430, y: 470 },
    dot: { x: 500, y: 498 },
    note: "Low activity, crew on standby rotation.",
  },
  {
    id: "loading-dock",
    name: "Loading Dock",
    color: "#1F9D66",
    status: "Active",
    batches: 10,
    crews: 4,
    weight: "5.4 t",
    points: "760,400 980,410 980,540 720,540 690,470",
    label: { x: 770, y: 432 },
    dot: { x: 868, y: 482 },
    note: "Baled material staged for partner pickup.",
  },
];

export function OpsStadiumMap() {
  const [selected, setSelected] = useState<Zone | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showZones, setShowZones] = useState(true);

  return (
    <div className="relative h-full min-h-[560px] w-full overflow-hidden border border-ops-border bg-ops-navy">
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,37,51,0.18),rgba(13,37,51,0.45))]" />

        {showZones && (
          <svg
            viewBox="0 0 1000 560"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            {zones.map((z) => {
              const isActive = hover === z.id || selected?.id === z.id;
              return (
                <polygon
                  key={z.id}
                  points={z.points}
                  fill={z.color}
                  fillOpacity={isActive ? 0.42 : 0.26}
                  stroke={z.color}
                  strokeWidth={isActive ? 3 : 1.75}
                  className="cursor-pointer"
                  style={{ transition: "all 0.2s" }}
                  onMouseEnter={() => setHover(z.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setSelected(z)}
                />
              );
            })}
          </svg>
        )}
      </div>

      {/* zone labels (fixed) */}
      {showZones && (
        <div className="pointer-events-none absolute inset-0">
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setSelected(z)}
              className="pointer-events-auto absolute -translate-x-0 cursor-pointer text-left"
              style={{
                left: `${(z.label.x / 1000) * 100}%`,
                top: `${(z.label.y / 560) * 100}%`,
              }}
            >
              <div className="inline-block rounded-md border border-ops-border bg-ops-surface/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: z.color }}
                  />
                  <span className="font-display text-[13px] font-semibold leading-tight text-ops-ink">
                    {z.name}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-ops-muted">
                  <span className="flex items-center gap-0.5">
                    <Boxes className="h-3 w-3" /> {z.batches}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Users className="h-3 w-3" /> {z.crews}
                  </span>
                  <span
                    className={`rounded border px-1 py-px text-[9px] font-semibold uppercase ${statusBadge[z.status]}`}
                  >
                    {z.status}
                  </span>
                </div>
              </div>
            </button>
          ))}

          {/* zone marker dots */}
          {zones.map((z) => (
            <span
              key={`${z.id}-dot`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(z.dot.x / 1000) * 100}%`,
                top: `${(z.dot.y / 560) * 100}%`,
              }}
            >
              <span
                className="map-ping absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: z.color, opacity: 0.4 }}
              />
              <span
                className="relative block h-3 w-3 rounded-full border-2 border-white"
                style={{ backgroundColor: z.color }}
              />
            </span>
          ))}
        </div>
      )}

      {/* map controls on left */}
      <div className="absolute left-4 top-4 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(1)))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-ops-border bg-ops-surface text-ops-ink shadow-sm transition hover:bg-white"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(1)))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-ops-border bg-ops-surface text-ops-ink shadow-sm transition hover:bg-white"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowZones((s) => !s)}
          className={`flex h-9 w-9 items-center justify-center rounded-md border border-ops-border bg-ops-surface shadow-sm transition hover:bg-white ${showZones ? "text-ops-green" : "text-ops-ink"}`}
          aria-label="Toggle zone overlays"
        >
          <Layers className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setSelected(null);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-ops-border bg-ops-surface text-ops-ink shadow-sm transition hover:bg-white"
          aria-label="Recenter"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      {/* legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-ops-border bg-ops-surface/95 px-3 py-1.5 text-[11px] font-medium text-ops-muted shadow-sm backdrop-blur-sm">
        <Crosshair className="h-3.5 w-3.5 text-ops-green" />
        8 recovery zones · live telemetry
      </div>

      {/* zone detail popover */}
      {selected && (
        <div className="animate-scale-in absolute bottom-4 right-4 w-72 rounded-lg border border-ops-border bg-ops-surface p-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selected.color }} />
                <span className="font-display text-base font-semibold text-ops-ink">
                  {selected.name}
                </span>
              </div>
              <span
                className={`mt-1.5 inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${statusBadge[selected.status]}`}
              >
                {selected.status}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-ops-border text-ops-muted hover:bg-ops-bg"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2.5 text-xs leading-relaxed text-ops-muted">{selected.note}</p>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat label="Batches" value={`${selected.batches}`} />
            <Stat label="Crews" value={`${selected.crews}`} />
            <Stat label="Weight" value={selected.weight} />
          </div>

          <Link
            href="/dispatch"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-ops-navy py-2.5 text-sm font-semibold text-white transition hover:bg-ops-navy/90"
          >
            Dispatch crew to {selected.name}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md border border-ops-border bg-ops-bg px-1.5 py-2">
      <div className="font-display text-base font-bold text-ops-ink">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-ops-muted">
        {label}
      </div>
    </div>
  );
}
