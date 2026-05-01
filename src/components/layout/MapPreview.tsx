"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import { useProject } from "@/lib/store/project";

export function MapPreview() {
  const locationWgs84 = useProject((s) => s.plot.locationWgs84);
  const polygonWgs84 = useProject((s) => s.plot.polygonWgs84);

  if (!locationWgs84) {
    return (
      <div className="border border-border bg-surface-2 rounded-lg p-4 text-xs text-fg-muted text-center">
        Aby zobaczyć mapę, zaimportuj działkę z Geoportalu.
      </div>
    );
  }

  const center: [number, number] = [locationWgs84.lat, locationWgs84.lon];
  const positions: [number, number][] = (polygonWgs84 ?? []).map((p) => [
    p.lat,
    p.lon,
  ]);

  return (
    <div className="overflow-hidden rounded-lg" style={{ height: 200 }}>
      <MapContainer
        center={center}
        zoom={18}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OSM contributors"
        />
        {positions.length >= 3 && (
          <Polygon
            positions={positions}
            pathOptions={{ color: "#2347D9", fillColor: "#2347D9", fillOpacity: 0.15, weight: 2 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
