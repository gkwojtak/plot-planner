import "server-only";
import proj4 from "proj4";
import type { OsmBuilding, OsmEnvironment, OsmRoad } from "@/lib/store/project";

proj4.defs(
  "EPSG:2180",
  "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
);

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS_M = 150;

function roadWidth(kind: string): number {
  switch (kind) {
    case "secondary":
      return 9;
    case "tertiary":
      return 7;
    case "residential":
      return 6;
    case "service":
      return 4;
    case "footway":
    case "path":
    case "cycleway":
      return 1.5;
    default:
      return 5;
  }
}

function estimateHeight(tags: Record<string, string>): number {
  if (tags["height"]) {
    const h = parseFloat(tags["height"]);
    if (!isNaN(h) && h > 0) return h;
  }
  if (tags["building:levels"]) {
    const lvl = parseFloat(tags["building:levels"]);
    if (!isNaN(lvl) && lvl > 0) return lvl * 3;
  }
  return 6;
}

type OverpassNode = { lat: number; lon: number };
type OverpassElement = {
  type: string;
  id: number;
  tags?: Record<string, string>;
  geometry?: OverpassNode[];
};

export async function fetchOsmEnvironment(
  lat: number,
  lon: number,
): Promise<OsmEnvironment | null> {
  // Re-derive centroid in EPSG:2180 from WGS84 (option a — no API change needed)
  const [cx, cy] = proj4("EPSG:4326", "EPSG:2180", [lon, lat]);

  const query = `[out:json][timeout:25];(way["building"](around:${RADIUS_M},${lat},${lon});way["highway"](around:${RADIUS_M},${lat},${lon}););out body geom;`;

  let data: { elements: OverpassElement[] };
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        // Overpass returns 406 if it can't classify the client. A real UA also
        // makes us a good citizen — they ask for it in their usage policy.
        "User-Agent": "PlotPlanner/0.1 (+https://github.com/gkwojtak/plot-planner)",
      },
      body: `data=${encodeURIComponent(query)}`,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }

  const buildings: OsmBuilding[] = [];
  const roads: OsmRoad[] = [];

  for (const el of data.elements ?? []) {
    if (el.type !== "way" || !el.geometry || !el.tags) continue;

    const localPts = el.geometry.map((node) => {
      const [ex, ey] = proj4("EPSG:4326", "EPSG:2180", [node.lon, node.lat]);
      return { x: ex - cx, y: ey - cy };
    });

    if (el.tags["building"]) {
      if (localPts.length < 3) continue;
      // Remove closing duplicate point if present
      const last = localPts[localPts.length - 1];
      const first = localPts[0];
      const pts =
        last.x === first.x && last.y === first.y
          ? localPts.slice(0, -1)
          : localPts;
      if (pts.length < 3) continue;

      // Skip buildings whose centroid is within 5 m of origin (user's own plot)
      const bcx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const bcy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      if (Math.sqrt(bcx * bcx + bcy * bcy) < 5) continue;

      buildings.push({ points: pts, heightM: estimateHeight(el.tags) });
    } else if (el.tags["highway"]) {
      if (localPts.length < 2) continue;
      const kind = el.tags["highway"];
      roads.push({ points: localPts, kind, widthM: roadWidth(kind) });
    }
  }

  return { buildings, roads };
}
