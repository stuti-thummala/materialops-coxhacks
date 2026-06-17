"use client";

import { useMemo, useState } from "react";
import {
  Radio,
  Boxes,
  DollarSign,
  Truck,
  Flame,
  Plus,
  Minus,
  LocateFixed,
} from "lucide-react";
import { recoveryZones, materialBatches } from "@/lib/mockData";
import { useMaterialOpsStore } from "@/store/useMaterialOpsStore";

interface ZoneStat {
  id: string;
  name: string;
  short: string;
  cx: number;
  cy: number;
  batches: number;
  items: number;
  value: number;
  readyNow: number;
  intensity: number; // 0..1 load score driving the heat color
  offsite?: boolean;
}

// Footprint centers on a 900 x 460 stage (top-down venue layout).
const LAYOUT: Record<string, { cx: number; cy: number }> = {
  gwcc: { cx: 270, cy: 165 },
  "fan-plaza": { cx: 640, cy: 150 },
  "parking-logistics": { cx: 180, cy: 320 },
  "stadium-bowl": { cx: 460, cy: 250 },
  "arena-district": { cx: 730, cy: 315 },
  "home-depot-backyard": { cx: 440, cy: 370 },
};

// Off-campus live-demo origin. Lights up only when biltmoreActive is true.
// Volume/value are filled in live from the field captures in the store; the
// static numbers here are only a fallback if the store hasn't hydrated yet.
const BILTMORE = {
  id: "biltmore",
  name: "Biltmore Innovation Center",
  short: "Biltmore",
  cx: 340,
  cy: 58,
  batches: 1,
  items: 4,
  value: 7,
  readyNow: 1,
  intensity: 0.32,
  offsite: true as const,
};

/** Map a 0..1 load score onto a cool→hot gradient (green → amber → red). */
function heatColor(t: number): string {
  const stops: Array<[number, [number, number, number]]> = [
    [0, [31, 110, 90]], // cool teal-green
    [0.45, [31, 157, 102]], // green
    [0.7, [201, 131, 26]], // amber
    [1, [195, 74, 54]], // hot red
  ];
  let lo = stops[0];
  let hi = stops.at(-1) ?? stops[0];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const span = hi[0] - lo[0] || 1;
  const u = (t - lo[0]) / span;
  const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * u);
  const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * u);
  const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * u);
  return `rgb(${r}, ${g}, ${b})`;
}

function heatLabel(t: number): string {
  if (t > 0.7) return "Hot · dispatch first";
  if (t > 0.45) return "Elevated load";
  return "Steady load";
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 2.6;
const ZOOM_STEP = 0.35;
const ZOOM_DEFAULT = 1.35;

interface SiteRecoveryMapProps {
  readonly showBadges?: boolean;
  readonly height?: string;
  /** When true, the off-campus Biltmore Innovation Center lights up. */
  readonly biltmoreActive?: boolean;
}

export function SiteRecoveryMap({
  showBadges = false,
  height = "h-[420px]",
  biltmoreActive = false,
}: SiteRecoveryMapProps) {
  const spotReports = useMaterialOpsStore((s) => s.spotReports);

  // The off-campus Biltmore tile reflects the live field captures: item count
  // and recovered value come straight from the mobile drops, and it stays a
  // low-intensity "steady" tile so it never reads as "dispatch first".
  const biltmoreTile = useMemo<ZoneStat>(() => {
    const drops = spotReports.filter(
      (r) => r.coords && r.zoneName.toLowerCase().includes("biltmore"),
    );
    if (drops.length === 0) return BILTMORE;
    const value = Math.round(
      drops.reduce((sum, r) => sum + (Number(r.ai.valueUsd) || 0), 0),
    );
    return { ...BILTMORE, items: drops.length, value, readyNow: 1 };
  }, [spotReports]);

  const zones = useMemo<ZoneStat[]>(() => {
    const counts = recoveryZones.map((z) => z.itemCount);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const span = max - min || 1;
    return recoveryZones.map((z) => {
      const inZone = materialBatches.filter((b) => b.sourceZone === z.id);
      const ready = inZone.filter((b) => b.status === "ready").length;
      const highPri = inZone.filter((b) => b.priority === "high").length;
      // Load score blends raw volume with dispatch urgency.
      const base = (z.itemCount - min) / span;
      const urgency = Math.min(1, (ready + highPri) / 3);
      return {
        id: z.id,
        name: z.name,
        short: z.shortName,
        cx: LAYOUT[z.id]?.cx ?? 460,
        cy: LAYOUT[z.id]?.cy ?? 250,
        batches: z.batchCount,
        items: z.itemCount,
        value: z.estimatedValue,
        readyNow: ready,
        intensity: Math.max(0.08, Math.min(1, base * 0.7 + urgency * 0.3)),
      };
    });
  }, []);

  const allZones = useMemo<ZoneStat[]>(
    () => (biltmoreActive ? [...zones, biltmoreTile] : zones),
    [zones, biltmoreActive, biltmoreTile],
  );

  const hottest = useMemo(
    () => zones.reduce((a, b) => (b.intensity > a.intensity ? b : a), zones[0]),
    [zones],
  );

  const [activeId, setActiveId] = useState<string>(hottest.id);
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  const active =
    allZones.find((z) => z.id === activeId) ?? hottest;

  // Zoom by shrinking the viewBox around the venue center.
  // PAD adds breathing room so edge heat blobs are never clipped.
  const STAGE_W = 900;
  const STAGE_H = 460;
  const PAD = 80;
  const baseW = STAGE_W + PAD * 2;
  const baseH = STAGE_H + PAD * 2;
  const vw = baseW / zoom;
  const vh = baseH / zoom;
  const vx = STAGE_W / 2 - vw / 2;
  const vy = STAGE_H / 2 - vh / 2;
  const viewBox = `${vx} ${vy} ${vw} ${vh}`;

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => setZoom(ZOOM_DEFAULT);

  return (
    <div
      className={`relative ${height} w-full overflow-hidden rounded-lg border border-ops-border bg-[#0D2533]`}
    >
      <svg
        viewBox={viewBox}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        style={{
          fontFamily:
            "var(--font-plex), var(--font-inter), system-ui, sans-serif",
        }}
      >
        <defs>
          {/* light blur softens band edges without turning the field to mush */}
          <filter id="srmHeat" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          {/* soft drop shadow keeps labels legible over the heat field */}
          <filter id="srmText" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="0.5"
              stdDeviation="1.4"
              floodColor="#06141d"
              floodOpacity="0.95"
            />
          </filter>
          {allZones.map((z) => {
            const c = heatColor(z.intensity);
            // Stepped stops create clear concentric intensity bands.
            return (
              <radialGradient
                key={`grad-${z.id}`}
                id={`heat-${z.id}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={c} stopOpacity="0.95" />
                <stop offset="30%" stopColor={c} stopOpacity="0.95" />
                <stop offset="30%" stopColor={c} stopOpacity="0.7" />
                <stop offset="58%" stopColor={c} stopOpacity="0.7" />
                <stop offset="58%" stopColor={c} stopOpacity="0.42" />
                <stop offset="82%" stopColor={c} stopOpacity="0.42" />
                <stop offset="82%" stopColor={c} stopOpacity="0.18" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </radialGradient>
            );
          })}
        </defs>

        <rect x={vx} y={vy} width={vw} height={vh} fill="#0D2533" />

        {/* faint reference grid */}
        <g stroke="#26415a" strokeWidth="1" opacity="0.35">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v-${i * 112}`} x1={i * 112 - 112} y1={-80} x2={i * 112 - 112} y2={540} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h-${i * 115}`} x1={-80} y1={i * 115 - 115} x2={980} y2={i * 115 - 115} />
          ))}
        </g>

        {/* incoming Biltmore recovery line into the stadium */}
        {biltmoreActive && (
          <path
            d={`M ${BILTMORE.cx} ${BILTMORE.cy} Q 380 150 ${460} ${250}`}
            fill="none"
            stroke="#C34A36"
            strokeWidth="2.5"
            strokeDasharray="7 7"
            opacity="0.85"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="28"
              to="0"
              dur="1.1s"
              repeatCount="indefinite"
            />
          </path>
        )}

        {/* continuous heat field — clear banded blobs */}
        <g filter="url(#srmHeat)">
          {allZones.map((z) => {
            const r = z.offsite ? 66 : 92 + z.intensity * 78;
            return (
              <circle
                key={`blob-${z.id}`}
                cx={z.cx}
                cy={z.cy}
                r={r}
                fill={`url(#heat-${z.id})`}
              />
            );
          })}
        </g>

        {/* zone markers + labels (crisp, above the blur) */}
        {allZones.map((z) => {
          const isActive = z.id === activeId;
          const dot = heatColor(z.intensity);
          const pct = Math.round(z.intensity * 100);
          return (
            <g
              key={z.id}
              className="cursor-pointer"
              onMouseEnter={() => setActiveId(z.id)}
              onClick={() => setActiveId(z.id)}
            >
              {/* generous invisible hit area */}
              <circle cx={z.cx} cy={z.cy} r={64} fill="transparent" />

              {z.offsite && (
                <circle
                  cx={z.cx}
                  cy={z.cy}
                  r={22}
                  fill="none"
                  stroke="#C34A36"
                  strokeWidth="2"
                  opacity="0.9"
                >
                  <animate
                    attributeName="r"
                    from="14"
                    to="30"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.9"
                    to="0"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {isActive && (
                <circle
                  cx={z.cx}
                  cy={z.cy}
                  r={15}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity="0.75"
                />
              )}
              <circle
                cx={z.cx}
                cy={z.cy}
                r={isActive ? 8.5 : 6.5}
                fill={dot}
                stroke="#ffffff"
                strokeWidth={isActive ? 2.5 : 1.5}
              />

              <text
                x={z.cx}
                y={z.cy - 18}
                fill="#ffffff"
                fontSize="13"
                fontWeight="600"
                textAnchor="middle"
                filter="url(#srmText)"
              >
                {z.short}
                {z.offsite ? " · NEW" : ""}
              </text>
              <text
                x={z.cx}
                y={z.cy + 24}
                fill="#c6d4e0"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                filter="url(#srmText)"
              >
                {z.items.toLocaleString()} items · {pct}%
                {showBadges && z.readyNow > 0 ? ` · ${z.readyNow} ready` : ""}
              </text>
            </g>
          );
        })}
      </svg>

      {/* live indicator */}
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md border border-ops-green/30 bg-ops-surface/95 px-3 py-1.5 text-xs font-semibold text-ops-green shadow-sm backdrop-blur">
        <Radio className="h-3.5 w-3.5 animate-pulse text-ops-green" />
        Live View
      </div>

      {/* zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-ops-border bg-ops-surface text-ops-ink shadow-sm transition hover:bg-white disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-ops-border bg-ops-surface text-ops-ink shadow-sm transition hover:bg-white disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={resetZoom}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-ops-border bg-ops-surface text-ops-ink shadow-sm transition hover:bg-white"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      {/* selected-zone readout */}
      <div className="absolute left-3 top-3 w-[212px] rounded-lg border border-ops-border bg-ops-surface/95 p-3 shadow-md backdrop-blur">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: heatColor(active.intensity) }}
          />
          <span className="truncate text-sm font-semibold text-ops-ink">
            {active.name}
          </span>
        </div>
        <div
          className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: heatColor(active.intensity) }}
        >
          {active.offsite ? "New · low priority" : heatLabel(active.intensity)}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-ops-muted">
            <Boxes className="h-3.5 w-3.5" />
            <span className="font-semibold text-ops-ink">{active.batches}</span>
            <span>batches</span>
          </div>
          <div className="flex items-center gap-1.5 text-ops-muted">
            <Truck className="h-3.5 w-3.5" />
            <span className="font-semibold text-ops-ink">
              {active.items.toLocaleString()}
            </span>
            <span>items</span>
          </div>
          <div className="flex items-center gap-1.5 text-ops-muted">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="font-semibold text-ops-ink">
              ${active.value.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-ops-muted">
            <Flame className="h-3.5 w-3.5 text-ops-amber" />
            <span className="font-semibold text-ops-ink">{active.readyNow}</span>
            <span>ready</span>
          </div>
        </div>
      </div>

      {/* gradient heat legend */}
      <div className="absolute bottom-3 left-3 rounded-md border border-ops-border bg-ops-surface/90 px-3 py-2 shadow-sm backdrop-blur">
        <div className="text-[11px] font-semibold text-ops-ink">
          Recovery load
        </div>
        <div
          className="mt-1.5 h-2 w-40 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgb(31,110,90) 0%, rgb(31,157,102) 40%, rgb(201,131,26) 72%, rgb(195,74,54) 100%)",
          }}
        />
        <div className="mt-1 flex justify-between text-[10px] font-medium text-ops-muted">
          <span>Steady</span>
          <span>Hot</span>
        </div>
      </div>
    </div>
  );
}
