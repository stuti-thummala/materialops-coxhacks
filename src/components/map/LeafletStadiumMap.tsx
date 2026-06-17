"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { SiteZone } from "./siteZones";

function FlyController({ target }: { target: SiteZone | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 18, { duration: 1.1 });
    }
  }, [target, map]);
  return null;
}

export default function LeafletStadiumMap({
  zones,
  selected,
  onSelect,
  labels = true,
}: Readonly<{
  zones: SiteZone[];
  selected: SiteZone | null;
  onSelect: (z: SiteZone) => void;
  labels?: boolean;
}>) {
  const MBS: [number, number] = [33.755489, -84.400906];

  return (
    <MapContainer
      center={MBS}
      zoom={16}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#06121b" }}
    >
      {/* Esri World Imagery — real satellite, no API key required */}
      <TileLayer
        attribution='Imagery &copy; Esri, Maxar, Earthstar Geographics'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
      />
      {labels && (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
      )}

      {zones.map((z) => (
        <Polygon
          key={`poly-${z.id}`}
          positions={z.polygon}
          pathOptions={{
            color: z.color,
            weight: selected?.id === z.id ? 3 : 1.5,
            fillColor: z.color,
            fillOpacity: selected?.id === z.id ? 0.32 : 0.16,
          }}
          eventHandlers={{ click: () => onSelect(z) }}
        />
      ))}

      {zones.map((z) => (
        <CircleMarker
          key={`dot-${z.id}`}
          center={[z.lat, z.lng]}
          radius={selected?.id === z.id ? 10 : 7}
          pathOptions={{
            color: "#06121b",
            weight: 2,
            fillColor: z.color,
            fillOpacity: 1,
          }}
          eventHandlers={{ click: () => onSelect(z) }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={selected?.id === z.id}>
            <span className="text-[11px] font-semibold">{z.short}</span>
          </Tooltip>
        </CircleMarker>
      ))}

      <FlyController target={selected} />
    </MapContainer>
  );
}
