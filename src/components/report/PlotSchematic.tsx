import type {
  Vec2,
  PlacementState,
  PlotState,
} from "@/lib/store/project";
import type { HouseDesign } from "@/lib/catalog/houses";

type Props = {
  plot: PlotState;
  house: HouseDesign | null;
  placement: PlacementState;
  width?: number;
  height?: number;
};

/**
 * Top-down schematic view of plot + house — pure SVG, print-safe.
 */
export function PlotSchematic({
  plot,
  house,
  placement,
  width = 600,
  height = 600,
}: Props) {
  const padding = 24;

  // Bounding box of plot points (with a margin for setback)
  const pts = plot.points;
  const minX = Math.min(...pts.map((p) => p.x)) - 4;
  const maxX = Math.max(...pts.map((p) => p.x)) + 4;
  const minY = Math.min(...pts.map((p) => p.y)) - 4;
  const maxY = Math.max(...pts.map((p) => p.y)) + 4;
  const w = maxX - minX;
  const h = maxY - minY;

  // Compute scale so plot fits inside (width-2*padding) × (height-2*padding)
  const drawW = width - padding * 2;
  const drawH = height - padding * 2;
  const scale = Math.min(drawW / w, drawH / h);

  const project = (p: Vec2) => ({
    x: padding + (p.x - minX) * scale,
    y: padding + (maxY - p.y) * scale, // Y flipped (SVG Y goes down, plot Y goes up)
  });

  const plotPath =
    pts
      .map((p, i) => {
        const pp = project(p);
        return `${i === 0 ? "M" : "L"} ${pp.x.toFixed(1)} ${pp.y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  // House corners (rotated)
  let housePath: string | null = null;
  if (house) {
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
    const corners = local.map((p) => ({
      x: placement.position.x + p.x * cos - p.y * sin,
      y: placement.position.y + p.x * sin + p.y * cos,
    }));
    housePath =
      corners
        .map((p, i) => {
          const pp = project(p);
          return `${i === 0 ? "M" : "L"} ${pp.x.toFixed(1)} ${pp.y.toFixed(1)}`;
        })
        .join(" ") + " Z";
  }

  // Inset polygon for setback (3 m) — only safe for rectangle, skip for polygon
  let setbackPath: string | null = null;
  if (plot.kind === "rectangle") {
    const setbackPts: Vec2[] = [
      { x: -plot.widthM / 2 + 3, y: -plot.depthM / 2 + 3 },
      { x: plot.widthM / 2 - 3, y: -plot.depthM / 2 + 3 },
      { x: plot.widthM / 2 - 3, y: plot.depthM / 2 - 3 },
      { x: -plot.widthM / 2 + 3, y: plot.depthM / 2 - 3 },
    ];
    setbackPath =
      setbackPts
        .map((p, i) => {
          const pp = project(p);
          return `${i === 0 ? "M" : "L"} ${pp.x.toFixed(1)} ${pp.y.toFixed(1)}`;
        })
        .join(" ") + " Z";
  }

  // Compass — N arrow at top
  const compassX = width - padding - 40;
  const compassY = padding + 10;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block"
    >
      {/* Plot fill */}
      <path d={plotPath} fill="#E6ECDB" stroke="#3A4A2E" strokeWidth={1.5} />

      {/* Setback overlay */}
      {setbackPath && (
        <path
          d={setbackPath}
          fill="none"
          stroke="#2347D9"
          strokeWidth={0.8}
          strokeDasharray="4 3"
        />
      )}

      {/* House */}
      {housePath && (
        <path
          d={housePath}
          fill="#FAFAF7"
          stroke="#1A1A1F"
          strokeWidth={1.2}
        />
      )}

      {/* Plot vertices markers */}
      {pts.map((p, i) => {
        const pp = project(p);
        return (
          <g key={i}>
            <circle cx={pp.x} cy={pp.y} r={2.5} fill="#3A4A2E" />
          </g>
        );
      })}

      {/* Compass */}
      <g transform={`translate(${compassX} ${compassY})`}>
        <circle cx={15} cy={15} r={14} fill="white" stroke="#1A1A1F" strokeWidth={0.8} />
        <text x={15} y={9} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#1A1A1F">
          N
        </text>
        <line x1={15} y1={11} x2={15} y2={20} stroke="#C25A4A" strokeWidth={1.5} />
      </g>

      {/* Scale label */}
      <text
        x={padding}
        y={height - 8}
        fontSize={10}
        fill="#6B6B73"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Skala 1 m ≈ {scale.toFixed(1)} px
      </text>
    </svg>
  );
}
