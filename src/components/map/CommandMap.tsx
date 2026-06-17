"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  STADIUM_CENTER,
  GEO_ZONES,
  buildArc,
  pointOnPath,
} from "@/lib/stadiumGeo";
import { recoveryZones } from "@/lib/mockData";
import type { ZoneId } from "@/lib/types";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/** Biltmore Innovation Center origin (lng, lat) — the live-demo new line. */
const BILTMORE_COORD: [number, number] = [-84.38786, 33.78068];
const BILTMORE_COLOR = "#B5567A";

/** Cohesive "command spectrum" — a single cool green→teal→cyan→blue family so
 * the markers read as one unified system on the dark map instead of a scattered
 * rainbow. Tuned bright enough to glow cinematically over satellite/3D. */
const ZONE_COLOR: Record<ZoneId, string> = {
  "stadium-bowl": "#34D399",
  "home-depot-backyard": "#4ADE80",
  "fan-plaza": "#2DD4BF",
  "arena-district": "#22D3EE",
  gwcc: "#38BDF8",
  "parking-logistics": "#818CF8",
};

interface FlowParticle {
  el: HTMLDivElement;
  marker: mapboxgl.Marker;
  arcIndex: number;
  t: number;
  speed: number;
}

const STYLE_URL: Record<"3d" | "satellite", string> = {
  "3d": "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

function zoneName(id: ZoneId): string {
  return recoveryZones.find((z) => z.id === id)?.shortName ?? id;
}

function makeZoneMarkerEl(color: string, label: string, items: number): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "cmd-zone-marker";
  el.style.cursor = "pointer";
  el.innerHTML = `
    <span class="cmd-zone-dot" style="--c:${color}"></span>
    <span class="cmd-zone-pulse" style="--c:${color}"></span>
    <span class="cmd-zone-label">
      <b style="color:${color}">${label}</b>
      <i>${items.toLocaleString()} items</i>
    </span>`;
  return el;
}

function makeParticleEl(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "cmd-flow-particle";
  el.style.setProperty("--c", color);
  return el;
}

interface Arc {
  id: ZoneId;
  color: string;
  path: [number, number][];
}

function buildArcs(): Arc[] {
  return GEO_ZONES.map((z) => ({
    id: z.id,
    color: ZONE_COLOR[z.id],
    path: buildArc(z.coord, STADIUM_CENTER, 48, 0.18),
  }));
}

function firstLabelLayerId(map: mapboxgl.Map): string | undefined {
  const layers = map.getStyle().layers ?? [];
  const found = layers.find(
    (l) => l.type === "symbol" && Boolean((l.layout as Record<string, unknown>)?.["text-field"]),
  );
  return found?.id;
}

function addBuildings(map: mapboxgl.Map, beforeId?: string): void {
  map.addLayer(
    {
      id: "cmd-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 12,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["get", "height"],
          0,
          "#1b2733",
          40,
          "#243445",
          120,
          "#2d4258",
        ],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.92,
      },
    },
    beforeId,
  );
}

function addArcLayers(map: mapboxgl.Map, arcs: Arc[]): void {
  map.addSource("cmd-arcs", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: arcs.map((a, idx) => ({
        type: "Feature",
        properties: { color: a.color, idx },
        geometry: { type: "LineString", coordinates: a.path },
      })),
    },
  });
  // Soft static glow under every arc.
  map.addLayer({
    id: "cmd-arc-glow",
    type: "line",
    source: "cmd-arcs",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": ["get", "color"],
      "line-width": 5,
      "line-blur": 6,
      "line-opacity": 0.22,
    },
  });
  // One animated flow layer per arc, each filtered to its own feature so the
  // dash phase can be offset independently — this is what desyncs the lines so
  // they don't all pulse in lockstep.
  arcs.forEach((_, idx) => {
    map.addLayer({
      id: `cmd-arc-flow-${idx}`,
      type: "line",
      source: "cmd-arcs",
      filter: ["==", ["get", "idx"], idx],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 2,
        "line-opacity": 0.9,
        "line-dasharray": DASH_SEQ[0],
      },
    });
  });
}

function addHub(map: mapboxgl.Map): void {
  map.addSource("cmd-hub", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: STADIUM_CENTER },
    },
  });
  map.addLayer({
    id: "cmd-hub-glow",
    type: "circle",
    source: "cmd-hub",
    paint: {
      "circle-radius": 22,
      "circle-color": "#1F9D66",
      "circle-opacity": 0.18,
      "circle-blur": 1,
    },
  });
}

function addZoneMarkers(map: mapboxgl.Map, onSelect?: (id: ZoneId) => void): void {
  GEO_ZONES.forEach((z) => {
    const meta = recoveryZones.find((r) => r.id === z.id);
    const el = makeZoneMarkerEl(ZONE_COLOR[z.id], zoneName(z.id), meta?.itemCount ?? 0);
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect?.(z.id);
    });
    new mapboxgl.Marker({ element: el, anchor: "left" }).setLngLat(z.coord).addTo(map);
  });
}

function createFlowParticles(map: mapboxgl.Map, arcs: Arc[]): FlowParticle[] {
  // One gentle comet per arc, riding zone → central recovery hub. Staggered
  // start phase + slow speed so the scene reads as a calm, continuous flow of
  // material into the hub rather than darting markers.
  return arcs.map((arc, i) => {
    const el = makeParticleEl(arc.color);
    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat(arc.path[0])
      .addTo(map);
    return {
      el,
      marker,
      arcIndex: i,
      t: (i / arcs.length) * 1, // spread starting positions along the arcs
      speed: 0.00026 + (i % 3) * 0.00004, // subtle per-arc variation
    };
  });
}

function stepFlowParticles(particles: FlowParticle[], arcs: Arc[], dt: number): void {
  particles.forEach((p) => {
    p.t += p.speed * dt;
    if (p.t >= 1) p.t -= 1;
    p.marker.setLngLat(pointOnPath(arcs[p.arcIndex].path, p.t));
    // Fade in/out at the endpoints so particles don't pop.
    const edge = Math.min(p.t, 1 - p.t);
    p.el.style.opacity = String(Math.min(1, edge * 6));
  });
}

function updateArcDashes(map: mapboxgl.Map, arcCount: number, dashStep: number): void {
  for (let idx = 0; idx < arcCount; idx++) {
    const layerId = `cmd-arc-flow-${idx}`;
    if (!map.getLayer(layerId)) continue;
    const phase = Math.round((idx / arcCount) * DASH_SEQ.length);
    map.setPaintProperty(
      layerId,
      "line-dasharray",
      DASH_SEQ[(dashStep + phase) % DASH_SEQ.length],
    );
  }
}

// Smooth, slow "lit segment travelling along a dark line" dash frames. Each
// frame nudges a short bright dash forward through the cycle.
const DASH_CYCLE = 13;
const DASH_LIT = 2;
const DASH_STEPS = 30;
const DASH_SEQ: number[][] = Array.from({ length: DASH_STEPS }, (_, k) => {
  const before = (k / DASH_STEPS) * (DASH_CYCLE - DASH_LIT);
  const after = DASH_CYCLE - DASH_LIT - before;
  return [0, before, DASH_LIT, Math.max(0.01, after)];
});

export default function CommandMap({
  styleMode = "3d",
  focusZoneId = null,
  showAgents = true,
  biltmoreActive = false,
  onZoneSelect,
}: Readonly<{
  styleMode?: "3d" | "satellite";
  focusZoneId?: ZoneId | null;
  showAgents?: boolean;
  biltmoreActive?: boolean;
  onZoneSelect?: (id: ZoneId) => void;
}>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const rafRef = useRef<number>(0);
  const orbitingRef = useRef(false);
  const biltmoreRafRef = useRef<number>(0);
  const onZoneSelectRef = useRef(onZoneSelect);
  const [ready, setReady] = useState(false);

  // Keep the marker click handler pointing at the latest callback without
  // re-initialising the whole map.
  useEffect(() => {
    onZoneSelectRef.current = onZoneSelect;
  }, [onZoneSelect]);

  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: STYLE_URL[styleMode],
      center: [STADIUM_CENTER[0] - 0.006, STADIUM_CENTER[1] - 0.006],
      zoom: 14.2,
      pitch: 30,
      bearing: -20,
      antialias: true,
      attributionControl: false,
    });
    mapRef.current = map;

    const arcs = buildArcs();

    map.on("style.load", () => {
      if (map.getSource("composite")) addBuildings(map, firstLabelLayerId(map));
      // The animated recovery arcs belong to the 3D command center. On the
      // satellite walk-through (showAgents=false) they clutter the imagery, so
      // we skip them there and keep the view clean.
      if (showAgents) addArcLayers(map, arcs);
      addHub(map);
      addZoneMarkers(map, (id) => onZoneSelectRef.current?.(id));
      const particles = showAgents ? createFlowParticles(map, arcs) : [];

      // Cinematic intro fly-in, then a slow orbit.
      map.flyTo({
        center: STADIUM_CENTER,
        zoom: 16.1,
        pitch: 62,
        bearing: 28,
        duration: 6500,
        essential: true,
      });

      orbitingRef.current = false;
      map.once("moveend", () => {
        orbitingRef.current = true;
      });

      // Hand control to the user: any manual interaction stops the auto-orbit
      // so scroll-zoom, pan and rotate feel natural instead of fighting it.
      const stopOrbit = () => {
        orbitingRef.current = false;
      };
      map.on("mousedown", stopOrbit);
      map.on("wheel", stopOrbit);
      map.on("dragstart", stopOrbit);
      map.on("touchstart", stopOrbit);

      let dashStep = 0;
      let lastDash = 0;
      let lastFrame = 0;
      const animate = (time: number) => {
        const dt = lastFrame ? Math.min(48, time - lastFrame) : 16;
        lastFrame = time;

        // Advance the dash phase slowly; offset each arc's frame so the flow
        // lines travel out of sync with one another.
        if (time - lastDash > 155) {
          dashStep = (dashStep + 1) % DASH_SEQ.length;
          updateArcDashes(map, arcs.length, dashStep);
          lastDash = time;
        }
        stepFlowParticles(particles, arcs, dt);
        if (orbitingRef.current) map.setBearing(map.getBearing() + 0.0022);
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
      setReady(true);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [styleMode, showAgents]);

  // Fly to a selected zone when the rail changes (and pause the auto-orbit).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusZoneId) return;
    const zone = GEO_ZONES.find((z) => z.id === focusZoneId);
    if (!zone) return;
    orbitingRef.current = false;
    map.flyTo({
      center: zone.coord,
      zoom: 16.6,
      pitch: 60,
      bearing: map.getBearing(),
      duration: 2200,
      essential: true,
    });
  }, [focusZoneId]);

  // Draw the live Biltmore Innovation Center recovery line once a Biltmore
  // field drop exists (or the demo inject button is pressed).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !biltmoreActive) return;

    const path = buildArc(BILTMORE_COORD, STADIUM_CENTER, 56, 0.26);

    const addBiltmoreLayers = () => {
      if (map.getSource("cmd-biltmore")) return;
      map.addSource("cmd-biltmore", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: path },
        },
      });
      map.addLayer({
        id: "cmd-biltmore-glow",
        type: "line",
        source: "cmd-biltmore",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": BILTMORE_COLOR,
          "line-width": 6,
          "line-blur": 6,
          "line-opacity": 0.3,
        },
      });
      map.addLayer({
        id: "cmd-biltmore-flow",
        type: "line",
        source: "cmd-biltmore",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": BILTMORE_COLOR,
          "line-width": 2.6,
          "line-opacity": 1,
          "line-dasharray": DASH_SEQ[0],
        },
      });
    };

    if (map.isStyleLoaded()) addBiltmoreLayers();
    else map.once("style.load", addBiltmoreLayers);

    // Origin marker labelled as the new incoming recovery.
    const markerEl = document.createElement("div");
    markerEl.className = "cmd-zone-marker";
    markerEl.innerHTML = `
      <span class="cmd-zone-dot" style="--c:${BILTMORE_COLOR}"></span>
      <span class="cmd-zone-pulse" style="--c:${BILTMORE_COLOR}"></span>
      <span class="cmd-zone-label">
        <b style="color:${BILTMORE_COLOR}">BILTMORE · NEW</b>
        <i>incoming recovery</i>
      </span>`;
    const marker = new mapboxgl.Marker({ element: markerEl, anchor: "left" })
      .setLngLat(BILTMORE_COORD)
      .addTo(map);

    const pEl = makeParticleEl(BILTMORE_COLOR);
    const pMarker = new mapboxgl.Marker({ element: pEl, anchor: "center" })
      .setLngLat(path[0])
      .addTo(map);

    let t = 0;
    let dashStep = 0;
    let lastDash = 0;
    let lastFrame = 0;
    const tick = (time: number) => {
      const dt = lastFrame ? Math.min(48, time - lastFrame) : 16;
      lastFrame = time;
      t += 0.00026 * dt;
      if (t >= 1) t -= 1;
      pMarker.setLngLat(pointOnPath(path, t));
      const edge = Math.min(t, 1 - t);
      pEl.style.opacity = String(Math.min(1, edge * 6));
      if (time - lastDash > 150) {
        dashStep = (dashStep + 1) % DASH_SEQ.length;
        if (map.getStyle?.() && map.getLayer("cmd-biltmore-flow")) {
          map.setPaintProperty(
            "cmd-biltmore-flow",
            "line-dasharray",
            DASH_SEQ[dashStep],
          );
        }
        lastDash = time;
      }
      biltmoreRafRef.current = requestAnimationFrame(tick);
    };
    biltmoreRafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(biltmoreRafRef.current);
      marker.remove();
      pMarker.remove();
      // The map's style may already be gone (style switch / unmount), in which
      // case getLayer/getSource throw — guard on a loaded style and swallow any
      // late teardown races.
      if (!map.getStyle?.()) return;
      try {
        ["cmd-biltmore-flow", "cmd-biltmore-glow"].forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        if (map.getSource("cmd-biltmore")) map.removeSource("cmd-biltmore");
      } catch {
        /* style torn down mid-cleanup — nothing to remove */
      }
    };
  }, [biltmoreActive, ready]);

  if (!TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0b1118] p-8 text-center">
        <div className="max-w-md font-mono text-sm text-emerald-300/80">
          <div className="mb-2 text-emerald-400">MAPBOX TOKEN MISSING</div>
          <p className="text-white/60">
            {"Add "}
            <code className="text-amber-300">NEXT_PUBLIC_MAPBOX_TOKEN</code>
            {" to "}
            <code className="text-amber-300">.env.local</code>
            {" and restart the dev server to launch the 3D recovery scene."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0b1118]">
          <div className="font-mono text-xs tracking-[0.3em] text-emerald-400/80">
            INITIALIZING RECOVERY SCENE…
          </div>
        </div>
      )}
    </div>
  );
}
