import "server-only";
import proj4 from "proj4";
import type { Vec2, LatLon } from "@/lib/store/project";

proj4.defs(
  "EPSG:2180",
  "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
);

type ImportSuccess = {
  ok: true;
  points: Vec2[];
  locationWgs84: LatLon;
  polygonWgs84: LatLon[];
  areaM2: number;
};

type ImportError = {
  ok: false;
  error: "not_found" | "network" | "parse_error";
};

export type UldkResult = ImportSuccess | ImportError;

function parseWkt(wkt: string): { x: number; y: number }[] | null {
  // Handle POLYGON((...)) and MULTIPOLYGON(((...))) — take first ring only
  const inner = wkt
    .replace(/^MULTIPOLYGON\s*\(\(\(/i, "")
    .replace(/^POLYGON\s*\(\(/i, "")
    .replace(/\)\).*$/s, "");

  if (!inner || inner === wkt) return null;

  const pairs = inner.trim().split(",");
  const pts: { x: number; y: number }[] = [];

  for (const pair of pairs) {
    const parts = pair.trim().split(/\s+/);
    if (parts.length < 2) return null;
    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);
    if (isNaN(x) || isNaN(y)) return null;
    pts.push({ x, y });
  }

  // Remove closing duplicate point if polygon is closed
  if (
    pts.length > 1 &&
    pts[0].x === pts[pts.length - 1].x &&
    pts[0].y === pts[pts.length - 1].y
  ) {
    pts.pop();
  }

  return pts.length >= 3 ? pts : null;
}

function shoelaceArea(pts: Vec2[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

export async function fetchPlotByUldkId(id: string): Promise<UldkResult> {
  const url = `https://uldk.gugik.gov.pl/?request=GetParcelById&id=${encodeURIComponent(id)}&result=geom_wkt`;

  let text: string;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: "network" };
    text = await res.text();
  } catch {
    return { ok: false, error: "network" };
  }

  const lines = text.trim().split("\n");
  if (lines.length < 2 || lines[0].trim() !== "0") {
    return { ok: false, error: "not_found" };
  }

  const wkt = lines.slice(1).join("\n").trim();
  const pts2180 = parseWkt(wkt);
  if (!pts2180) return { ok: false, error: "parse_error" };

  // Centroid in EPSG:2180
  const cx = pts2180.reduce((s, p) => s + p.x, 0) / pts2180.length;
  const cy = pts2180.reduce((s, p) => s + p.y, 0) / pts2180.length;

  // Convert centroid to WGS84
  const [cLon, cLat] = proj4("EPSG:2180", "EPSG:4326", [cx, cy]);
  const locationWgs84: LatLon = { lat: cLat, lon: cLon };

  // Convert all points to WGS84 for polygon overlay
  const polygonWgs84: LatLon[] = pts2180.map((p) => {
    const [lon, lat] = proj4("EPSG:2180", "EPSG:4326", [p.x, p.y]);
    return { lat, lon };
  });

  // Build plot-local coords (meters, origin at centroid, Y north-positive)
  const localPoints: Vec2[] = pts2180.map((p) => ({
    x: p.x - cx,
    y: p.y - cy,
  }));

  const areaM2 = shoelaceArea(localPoints);

  return {
    ok: true,
    points: localPoints,
    locationWgs84,
    polygonWgs84,
    areaM2,
  };
}
