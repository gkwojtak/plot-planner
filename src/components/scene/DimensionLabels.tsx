"use client";

import { Html, Line } from "@react-three/drei";

/**
 * In-scene dimension labels. Inspired by 3D Builder pergola configurator —
 * annotations live IN the 3D scene rather than in side panels.
 */
export function DimensionLabels({
  width,
  depth,
}: {
  width: number;
  depth: number;
}) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const offset = 1.5;

  return (
    <group>
      {/* Width line — south edge, offset outward */}
      <Line
        points={[
          [-halfW, 0.02, halfD + offset],
          [halfW, 0.02, halfD + offset],
        ]}
        color="#2347D9"
        lineWidth={1}
      />
      <Html
        position={[0, 0.02, halfD + offset + 0.6]}
        center
        distanceFactor={20}
      >
        <DimChip>{width.toFixed(1).replace(".", ",")} m</DimChip>
      </Html>

      {/* Depth line — east edge, offset outward */}
      <Line
        points={[
          [halfW + offset, 0.02, -halfD],
          [halfW + offset, 0.02, halfD],
        ]}
        color="#2347D9"
        lineWidth={1}
      />
      <Html
        position={[halfW + offset + 0.6, 0.02, 0]}
        center
        distanceFactor={20}
      >
        <DimChip>{depth.toFixed(1).replace(".", ",")} m</DimChip>
      </Html>
    </group>
  );
}

function DimChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-chip bg-surface px-2 py-1 text-[11px] font-medium tabular text-accent shadow-panel border border-border whitespace-nowrap">
      {children}
    </span>
  );
}
