import type {
  PlotState,
  PlacementState,
  Vec2,
} from "@/lib/store/project";
import type { HouseDesign } from "@/lib/catalog/houses";

export type RuleStatus = "passed" | "warning" | "failed" | "missing_data";

export type RuleResult = {
  id: string;
  status: RuleStatus;
  title: string;
  message: string;
};

export type AnalysisSummary = {
  results: RuleResult[];
  overall: RuleStatus;
};

const SETBACK_MIN_M = 3; // ściana bez okien
const SETBACK_OPENINGS_M = 4; // ściana z oknami/drzwiami

/**
 * Compute house's 4 corners in plot-local coords given placement + dimensions.
 * Uses the house's center placement and rotation around Y.
 */
function houseCorners(
  house: HouseDesign,
  placement: PlacementState,
): Vec2[] {
  const halfW = house.widthM / 2;
  const halfD = house.depthM / 2;
  const local: Vec2[] = [
    { x: -halfW, y: -halfD },
    { x: halfW, y: -halfD },
    { x: halfW, y: halfD },
    { x: -halfW, y: halfD },
  ];
  const a = (placement.rotationDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return local.map((p) => ({
    x: placement.position.x + p.x * cos - p.y * sin,
    y: placement.position.y + p.x * sin + p.y * cos,
  }));
}

/**
 * Distance from a point to a line segment.
 */
function pointToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Returns true if point is inside polygon (ray casting).
 */
function pointInPolygon(p: Vec2, poly: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Min distance from a point to any edge of a polygon.
 */
function pointToPolygonDistance(p: Vec2, poly: Vec2[]): number {
  let min = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    min = Math.min(min, pointToSegment(p, a, b));
  }
  return min;
}

export function analyzePlacement(
  plot: PlotState,
  house: HouseDesign | null,
  placement: PlacementState,
): AnalysisSummary {
  const results: RuleResult[] = [];

  if (!house) {
    return {
      results: [
        {
          id: "no_house",
          status: "missing_data",
          title: "Brak wybranego domu",
          message: "Wybierz dom z katalogu, żeby uruchomić analizę.",
        },
      ],
      overall: "missing_data",
    };
  }

  const corners = houseCorners(house, placement);

  // Rule 1: budynek mieści się w granicach działki
  const allInside = corners.every((c) => pointInPolygon(c, plot.points));
  results.push(
    allInside
      ? {
          id: "in_plot",
          status: "passed",
          title: "Budynek mieści się w granicach działki",
          message: "Wszystkie 4 narożniki bryły są wewnątrz działki.",
        }
      : {
          id: "in_plot",
          status: "failed",
          title: "Budynek wychodzi poza granicę działki",
          message:
            "Część bryły znajduje się poza działką. Przesuń dom albo zmień jego wymiary.",
        },
  );

  // Rule 2: minimalna odległość ściany od granicy (3 m, ściana bez okien)
  const minDist = Math.min(
    ...corners.map((c) => pointToPolygonDistance(c, plot.points)),
  );

  if (!allInside) {
    results.push({
      id: "setback_3m",
      status: "failed",
      title: "Odległość od granicy",
      message: `Najbliższy narożnik wystaje poza działkę (odl. ${formatPL(minDist)} m).`,
    });
  } else if (minDist < SETBACK_MIN_M) {
    results.push({
      id: "setback_3m",
      status: "failed",
      title: "Za blisko granicy",
      message: `Bryła jest ${formatPL(minDist)} m od granicy. Wymagane minimum 3 m dla ściany bez okien.`,
    });
  } else if (minDist < SETBACK_OPENINGS_M) {
    results.push({
      id: "setback_3m",
      status: "warning",
      title: "Granica setback 3 m OK",
      message: `Bryła jest ${formatPL(minDist)} m od granicy — ściana z oknami wymaga 4 m.`,
    });
  } else {
    results.push({
      id: "setback_3m",
      status: "passed",
      title: "Bezpieczna odległość od granicy",
      message: `Najbliższy narożnik ${formatPL(minDist)} m od granicy. Dla ściany z oknami też wystarczy.`,
    });
  }

  // Rule 3: brak danych o oknach — informacja
  results.push({
    id: "openings_missing",
    status: "missing_data",
    title: "Brak danych o oknach",
    message:
      "Nie wiemy, które ściany mają okna/drzwi. Walidacja 4 m działa zachowawczo.",
  });

  return {
    results,
    overall: aggregate(results),
  };
}

function aggregate(results: RuleResult[]): RuleStatus {
  if (results.some((r) => r.status === "failed")) return "failed";
  if (results.some((r) => r.status === "warning")) return "warning";
  if (results.every((r) => r.status === "passed")) return "passed";
  return "missing_data";
}

function formatPL(n: number) {
  return n.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
