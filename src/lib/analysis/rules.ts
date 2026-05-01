import type {
  PlotState,
  PlacementState,
  Vec2,
} from "@/lib/store/project";
import type { HouseDesign, WallSide } from "@/lib/catalog/houses";

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

const SETBACK_MIN_M = 3;      // ściana bez okien/drzwi
const SETBACK_OPENINGS_M = 4; // ściana z oknami lub drzwiami
const WARNING_MARGIN_M = 0.5; // strefa ostrzeżenia powyżej minimum

const WALL_LABELS: Record<WallSide, string> = {
  front: "Ściana frontowa",
  back:  "Ściana tylna",
  left:  "Ściana lewa",
  right: "Ściana prawa",
};

/**
 * Compute house's 4 corners in plot-local coords given placement + dimensions.
 * Local frame before rotation:
 *   front-left  = (-halfW, -halfD)   → index 0
 *   front-right = ( halfW, -halfD)   → index 1
 *   back-right  = ( halfW,  halfD)   → index 2
 *   back-left   = (-halfW,  halfD)   → index 3
 * "front" faces south (negative Y) before any rotation is applied.
 */
function houseCorners(
  house: HouseDesign,
  placement: PlacementState,
): Vec2[] {
  const halfW = house.widthM / 2;
  const halfD = house.depthM / 2;
  const local: Vec2[] = [
    { x: -halfW, y: -halfD }, // 0 front-left
    { x:  halfW, y: -halfD }, // 1 front-right
    { x:  halfW, y:  halfD }, // 2 back-right
    { x: -halfW, y:  halfD }, // 3 back-left
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
 * Wall segments derived from corners (after rotation):
 *   front = corners[0] → corners[1]
 *   right = corners[1] → corners[2]
 *   back  = corners[2] → corners[3]
 *   left  = corners[3] → corners[0]
 */
function wallSegments(corners: Vec2[]): Record<WallSide, [Vec2, Vec2]> {
  return {
    front: [corners[0], corners[1]],
    right: [corners[1], corners[2]],
    back:  [corners[2], corners[3]],
    left:  [corners[3], corners[0]],
  };
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
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
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

/**
 * Min distance from a wall segment to the plot boundary.
 * Samples N points along the wall segment and picks the closest distance
 * to any plot edge. N=10 is sufficient for MVP precision.
 */
function wallToPlotDistance(wallA: Vec2, wallB: Vec2, plotPoly: Vec2[]): number {
  const N = 10;
  let min = Infinity;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p: Vec2 = {
      x: wallA.x + t * (wallB.x - wallA.x),
      y: wallA.y + t * (wallB.y - wallA.y),
    };
    min = Math.min(min, pointToPolygonDistance(p, plotPoly));
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

  // Rules 2–5: per-wall setback checks
  const segments = wallSegments(corners);
  const sides: WallSide[] = ["front", "back", "left", "right"];

  for (const side of sides) {
    const opening = house.wallOpenings.find((o) => o.side === side);
    const hasOpening = opening ? opening.hasWindow || opening.hasDoor : false;
    const required = hasOpening ? SETBACK_OPENINGS_M : SETBACK_MIN_M;
    const [segA, segB] = segments[side];
    const dist = wallToPlotDistance(segA, segB, plot.points);
    const label = WALL_LABELS[side];
    const openingDesc = hasOpening ? "z oknami/drzwiami" : "bez okien i drzwi";

    let status: RuleStatus;
    let title: string;
    let message: string;

    if (dist < required) {
      status = "failed";
      title = `${label} za blisko granicy`;
      message = `${label} (${openingDesc}) jest ${formatPL(dist)} m od granicy. Wymagane minimum ${required} m. Przesuń dom dalej od granicy.`;
    } else if (dist < required + WARNING_MARGIN_M) {
      status = "warning";
      title = `${label} blisko granicy`;
      message = `${label} (${openingDesc}) jest ${formatPL(dist)} m od granicy — wymagane ${required} m. Margines jest bardzo mały.`;
    } else {
      status = "passed";
      title = `${label} — odległość w porządku`;
      message = `${label} (${openingDesc}) jest ${formatPL(dist)} m od granicy. Wymagane minimum ${required} m.`;
    }

    results.push({ id: `setback_${side}`, status, title, message });
  }

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
