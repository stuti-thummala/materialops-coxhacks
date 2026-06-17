"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import {
  Flag,
  CupSoda,
  Recycle,
  Tag,
  LayoutGrid,
  Megaphone,
  Leaf,
  Package,
  Boxes,
  X,
  ArrowUpRight,
  Scale,
  MapPin,
  Route,
} from "lucide-react";
import Link from "next/link";
import type { ZoneId } from "@/lib/types";
import { siteZones } from "./siteZones";
import { trashAnchors, type TrashAnchor } from "./trashAnchors";
import { RecoveryScene } from "./RecoveryScene";
import { materialBatches } from "@/lib/mockData";
import { titleCase } from "@/lib/formatters";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
/** Street View camera height above ground, metres. Tuned so object bases land
 * on the real ground plane rather than floating above it. */
const CAM_HEIGHT = 3;

type Vec3 = readonly [number, number, number];

function dirVec(headingDeg: number, pitchDeg: number): Vec3 {
  const h = (headingDeg * Math.PI) / 180;
  const p = (pitchDeg * Math.PI) / 180;
  const cp = Math.cos(p);
  return [cp * Math.sin(h), Math.sin(p), cp * Math.cos(h)];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function norm(a: Vec3): Vec3 {
  const m = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / m, a[1] / m, a[2] / m];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

interface Projection {
  px: number;
  py: number;
  sizePx: number;
  opacity: number;
  visible: boolean;
}

const WORLD_UP: Vec3 = [0, 1, 0];

type IconCmp = typeof Package;

/** Pick a floating-marker icon from the material/label keywords. */
function iconFor(material: string): IconCmp {
  const m = material.toLowerCase();
  if (/banner|vinyl|sign(?!s? *core)/.test(m)) return Flag;
  if (/foam|placard/.test(m)) return Megaphone;
  if (/cup|tumbler/.test(m)) return CupSoda;
  if (/bottle|pet|plastic|film|ldpe/.test(m)) return Recycle;
  if (/lanyard/.test(m)) return Tag;
  if (/carpet|tile|rug/.test(m)) return LayoutGrid;
  if (/food|organic|compost|fiber/.test(m)) return Leaf;
  if (/cardboard|carton|box|paper/.test(m)) return Package;
  return Boxes;
}

/** Project a ground-anchored object onto screen space for the current camera. */
function projectAnchor(
  anchor: TrashAnchor,
  cam: { heading: number; pitch: number; zoom: number },
  w: number,
  h: number,
): Projection {
  const forward = dirVec(cam.heading, cam.pitch);
  const right = norm(cross(WORLD_UP, forward));
  const up = cross(forward, right);

  const objPitch = -(Math.atan(CAM_HEIGHT / anchor.distance) * 180) / Math.PI;
  const obj = dirVec(anchor.bearing, objPitch);

  const oz = dot(obj, forward);
  if (oz <= 0.05) return { px: 0, py: 0, sizePx: 0, opacity: 0, visible: false };

  const fovX = (180 / 2 ** cam.zoom) * (Math.PI / 180);
  const tanHalfX = Math.tan(fovX / 2);
  const tanHalfY = (tanHalfX * h) / w;

  const ndcX = dot(obj, right) / oz / tanHalfX;
  const ndcY = dot(obj, up) / oz / tanHalfY;

  const px = (0.5 + 0.5 * ndcX) * w;
  const py = (0.5 - 0.5 * ndcY) * h;
  const sizePx = ((anchor.size / anchor.distance) * w) / (2 * tanHalfX);

  // Fade only as an object pans off the sides; keep grounded objects (which sit
  // low in the frame) fully opaque, and hard-cull once truly out of view.
  const ex = Math.abs(ndcX);
  const ey = Math.abs(ndcY);
  if (ex > 1.3 || ey > 1.2) return { px, py, sizePx, opacity: 0, visible: false };
  const opacity = ex > 1 ? Math.max(0, 1.3 - ex) : 1;
  return { px, py, sizePx, opacity, visible: opacity > 0.02 };
}

function applyAll(
  stage: HTMLDivElement,
  pano: google.maps.StreetViewPanorama,
  spriteEls: (HTMLDivElement | null)[],
  anchors: TrashAnchor[],
): void {
  const pov = pano.getPov();
  const cam = {
    heading: pov.heading ?? 0,
    pitch: pov.pitch ?? 0,
    zoom: pano.getZoom() ?? 1,
  };
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  for (let i = 0; i < anchors.length; i++) {
    applySprite(spriteEls[i], anchors[i], cam, w, h);
  }
}

export function StreetViewScene({
  zoneId,
  override,
  dynamicAnchors,
  extraAnchors,
}: Readonly<{
  zoneId: ZoneId;
  /** Street-view an arbitrary coordinate (a live field drop) instead of the zone. */
  override?: { lat: number; lng: number; heading: number };
  /** Material anchors to render instead of the zone's static set. */
  dynamicAnchors?: TrashAnchor[];
  /** Live batch anchors appended to the zone's set (e.g. a fresh Biltmore scan). */
  extraAnchors?: TrashAnchor[];
}>) {
  const zone = siteZones.find((z) => z.id === zoneId) ?? siteZones[0];
  const sv = override ?? zone.sv;
  const baseAnchors = dynamicAnchors ?? trashAnchors[zoneId] ?? [];
  const anchors =
    extraAnchors && extraAnchors.length > 0
      ? [...baseAnchors, ...extraAnchors]
      : baseAnchors;

  const panoRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const spriteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panoObj = useRef<google.maps.StreetViewPanorama | null>(null);
  const rafId = useRef<number>(0);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [selectedAnchor, setSelectedAnchor] = useState<TrashAnchor | null>(null);

  useEffect(() => {
    if (!GOOGLE_KEY) {
      setStatus("failed");
      return undefined;
    }
    let cancelled = false;
    const loader = new Loader({ apiKey: GOOGLE_KEY, version: "weekly" });

    // Google invokes this global if the key is invalid / API not enabled —
    // fall back to the static recovery scene instead of Google's error overlay.
    (globalThis as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
      if (!cancelled) setStatus("failed");
    };

    const tick = () => {
      const stage = stageRef.current;
      const pano = panoObj.current;
      if (stage && pano) applyAll(stage, pano, spriteRefs.current, anchors);
      rafId.current = requestAnimationFrame(tick);
    };

    const onReady = ({ StreetViewPanorama }: google.maps.StreetViewLibrary) => {
      if (cancelled || !panoRef.current) return;
      panoObj.current = new StreetViewPanorama(panoRef.current, {
        position: { lat: sv.lat, lng: sv.lng },
        pov: { heading: sv.heading, pitch: 0 },
        zoom: 1,
        visible: true,
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        showRoadLabels: false,
        enableCloseButton: false,
        linksControl: true,
        panControl: false,
        zoomControl: true,
      });
      setStatus("ready");
      rafId.current = requestAnimationFrame(tick);
    };

    loader
      .importLibrary("streetView")
      .then(onReady)
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      panoObj.current = null;
    };
  }, [zoneId, sv.lat, sv.lng, sv.heading, anchors]);

  if (status === "failed") return <RecoveryScene zoneId={zoneId} />;

  return (
    <div ref={stageRef} className="absolute inset-0 overflow-hidden bg-[#040d14]">
      <div ref={panoRef} className="absolute inset-0" />

      {/* floating batch markers anchored to the live panorama */}
      <div className="pointer-events-none absolute inset-0 z-[20]">
        {anchors.map((a, i) => (
          <div
            key={a.id}
            ref={(el) => {
              spriteRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 w-[154px] will-change-transform"
            style={{ opacity: 0 }}
          >
            <FloatingBatchMarker
              anchor={a}
              onSelect={a.batchId ? () => setSelectedAnchor(a) : undefined}
            />
          </div>
        ))}
      </div>

      {selectedAnchor && (
        <BatchDetailCard
          anchor={selectedAnchor}
          onClose={() => setSelectedAnchor(null)}
        />
      )}

      {status === "loading" && (
        <div className="absolute inset-0 z-[30] flex items-center justify-center bg-[#040d14] text-sm text-cyan-200/70">
          Loading live Street View…
        </div>
      )}
    </div>
  );
}

/** Imperatively position/scale a sprite from its projection (keeps the rAF loop
 * off the React render path for smooth tracking). */
function applySprite(
  el: HTMLDivElement | null,
  anchor: TrashAnchor,
  cam: { heading: number; pitch: number; zoom: number },
  w: number,
  h: number,
): void {
  if (!el) return;
  const p = projectAnchor(anchor, cam, w, h);
  if (!p.visible) {
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    return;
  }
  const scale = Math.min(1.3, Math.max(0.72, p.sizePx / 150));
  el.style.opacity = String(p.opacity);
  el.style.pointerEvents = "auto";
  el.style.transform = `translate(${p.px}px, ${p.py}px) scale(${scale}) translate(-50%, -100%)`;
}

function FloatingBatchMarker({
  anchor,
  onSelect,
}: Readonly<{ anchor: TrashAnchor; onSelect?: () => void }>) {
  const Icon = iconFor(anchor.material);
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!onSelect}
      className="group batch-float relative flex w-full flex-col items-center disabled:cursor-default"
    >
      {/* glowing material icon disc */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/50 bg-[#06121b]/85 shadow-[0_0_26px_rgba(34,211,238,0.5)] backdrop-blur transition group-enabled:group-hover:scale-110 group-enabled:group-hover:border-cyan-200">
        <span className="absolute inset-0 rounded-2xl border border-cyan-300/40 [animation:cmd-pulse_2.4s_ease-out_infinite]" />
        <Icon className="h-7 w-7 text-cyan-100" />
      </div>

      {/* batch id chip */}
      {anchor.batchId ? (
        <div className="mt-2 rounded-full border border-cyan-300/60 bg-[#06121b]/95 px-3 py-0.5 text-[13px] font-bold tracking-wide text-white shadow-lg backdrop-blur">
          {anchor.batchId}
        </div>
      ) : (
        <div className="mt-2 rounded-full border border-white/20 bg-[#06121b]/95 px-3 py-0.5 text-[11px] font-semibold text-white/80 shadow-lg backdrop-blur">
          {anchor.label}
        </div>
      )}
      <div className="mt-0.5 whitespace-nowrap text-[10px] font-medium text-cyan-100/80">
        {anchor.label} · {anchor.conf}%
      </div>

      {/* tether to ground */}
      <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
    </button>
  );
}

function BatchDetailCard({
  anchor,
  onClose,
}: Readonly<{ anchor: TrashAnchor; onClose: () => void }>) {
  const view = resolveBatchView(anchor);
  return (
    <div className="pointer-events-auto absolute right-4 top-16 z-[600] w-72 rounded-2xl border border-cyan-400/30 bg-[#06121b]/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
            Batch {view.id}
            {view.isLive && (
              <span className="rounded-full bg-fuchsia-500/20 px-1.5 py-0.5 text-[8.5px] font-bold text-fuchsia-300">
                NEW · BILTMORE
              </span>
            )}
          </div>
          <div className="font-display text-lg font-semibold text-white">
            {view.material}
          </div>
          <div className="text-[11px] text-white/50">{view.materialType}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close batch details"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat icon={<Boxes className="h-3 w-3" />} label="Items" value={view.items} />
        <Stat icon={<Scale className="h-3 w-3" />} label="Weight" value={view.weight} />
        <Stat icon={<MapPin className="h-3 w-3" />} label="Destination" value={view.destination} />
        <Stat icon={<Route className="h-3 w-3" />} label="Path" value={view.path} />
      </div>

      <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.05] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wide text-cyan-300/80">
          Chain of custody
        </div>
        <div className="mt-0.5 text-[13px] font-semibold text-white">
          {view.stage}
        </div>
        <div className="text-[11px] text-white/50">ETA {view.eta}</div>
      </div>

      {view.passportId && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">
              Material passport
            </div>
            <div className="font-mono text-[12px] font-semibold text-white">
              {view.passportId}
            </div>
          </div>
          <Link
            href={`/passport/${view.passportId}`}
            className="flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
          >
            View
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      <Link
        href={view.href}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 py-2 text-[13px] font-semibold text-[#06121b] transition hover:brightness-110"
      >
        Open in Material Batches
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

type BatchView = {
  id: string;
  material: string;
  materialType: string;
  items: string;
  weight: string;
  destination: string;
  path: string;
  stage: string;
  eta: string;
  href: string;
  isLive: boolean;
  passportId?: string;
};

/** Build a uniform detail view from either a seeded MaterialBatch or, for a live
 * Biltmore field recovery, the inline detail carried on the anchor. */
function resolveBatchView(anchor: TrashAnchor): BatchView {
  const batch = anchor.batchId
    ? materialBatches.find((b) => b.id === anchor.batchId)
    : undefined;
  if (batch) {
    return {
      id: batch.id,
      material: batch.material,
      materialType: batch.materialType,
      items: batch.items.toLocaleString(),
      weight: `${batch.estimatedWeightLbs} lbs`,
      destination: batch.destination,
      path: titleCase(batch.bestPath),
      stage: STATUS_STAGE[batch.status] ?? "Logged",
      eta: batch.eta,
      href: `/batches/${batch.id}`,
      isLive: false,
    };
  }
  const fd = anchor.fieldDetail;
  return {
    id: fd?.passportId ?? anchor.batchId ?? "—",
    material: anchor.label,
    materialType: fd?.materialType ?? anchor.material,
    items: fd?.items ?? "1 capture",
    weight: fd ? `${fd.weightLbs} lbs` : "—",
    destination: fd?.destination ?? "Pending routing",
    path: fd?.path ?? "Sort On-Site",
    stage: fd?.stage ?? "Recovered · awaiting pickup",
    eta: fd?.eta ?? "Routing…",
    href: "/batches",
    isLive: true,
    passportId: fd?.passportId,
  };
}

const STATUS_STAGE: Record<string, string> = {
  ready: "Tagged & staged for pickup",
  staging: "Being grouped & tagged",
  scheduled: "Pickup scheduled",
  "in-transit": "In transit to partner",
};

function Stat({
  icon,
  label,
  value,
}: Readonly<{ icon: React.ReactNode; label: string; value: string }>) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-[9.5px] uppercase tracking-wide text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 truncate text-[12px] font-semibold text-white">
        {value}
      </div>
    </div>
  );
}
