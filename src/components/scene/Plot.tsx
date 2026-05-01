"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useProject, type Vec2 } from "@/lib/store/project";

export function Plot({ width, depth }: { width: number; depth: number }) {
  const kind = useProject((s) => s.plot.kind);
  const points = useProject((s) => s.plot.points);

  // For rectangle kind, regenerate canonical points from width/depth so the
  // scene reacts to width/depth changes even when polygon list is stale.
  const effectivePoints = useMemo<Vec2[]>(
    () =>
      kind === "rectangle"
        ? [
            { x: -width / 2, y: -depth / 2 },
            { x: width / 2, y: -depth / 2 },
            { x: width / 2, y: depth / 2 },
            { x: -width / 2, y: depth / 2 },
          ]
        : points,
    [kind, width, depth, points],
  );

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (effectivePoints.length === 0) return s;
    s.moveTo(effectivePoints[0].x, effectivePoints[0].y);
    for (let i = 1; i < effectivePoints.length; i++) {
      s.lineTo(effectivePoints[i].x, effectivePoints[i].y);
    }
    s.closePath();
    return s;
  }, [effectivePoints]);

  return (
    <group>
      {/* Grass surface — plot polygon */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#A4B585" roughness={0.95} />
      </mesh>

      {/* Plot boundary outline */}
      <PlotOutline points={effectivePoints} />

      {/* Setback zone (3 m) — only rendered for rectangle kind on MVP */}
      {kind === "rectangle" && (
        <RectangleSetback width={width} depth={depth} setback={3} />
      )}
    </group>
  );
}

function PlotOutline({ points }: { points: Vec2[] }) {
  const positions = useMemo(() => {
    if (points.length === 0) return new Float32Array();
    const arr: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      arr.push(a.x, 0.005, a.y, b.x, 0.005, b.y);
    }
    return new Float32Array(arr);
  }, [points]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#3A4A2E" />
    </lineSegments>
  );
}

function RectangleSetback({
  width,
  depth,
  setback,
}: {
  width: number;
  depth: number;
  setback: number;
}) {
  const inner = {
    w: Math.max(0.1, width - setback * 2),
    d: Math.max(0.1, depth - setback * 2),
  };

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[inner.w, inner.d]} />
      <meshBasicMaterial color="#2347D9" transparent opacity={0.06} />
    </mesh>
  );
}
