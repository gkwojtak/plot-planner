"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useProject } from "@/lib/store/project";
import type { OsmBuilding, OsmRoad } from "@/lib/store/project";

// ─── Building (extruded footprint) ──────────────────────────────────────────

function OsmBuildingMesh({ building }: { building: OsmBuilding }) {
  const { points, heightM } = building;

  const geometry = useMemo(() => {
    if (points.length < 3) return null;

    // Build Shape from footprint. We negate Y so the resulting extrude rotation
    // (-PI/2 around X) maps the shape's (x, -y_plot) into world (x, 0, +y_plot)
    // — matching Plot.tsx which now puts north at +Z.
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, -points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, -points[i].y);
    }
    shape.closePath();

    try {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: heightM,
        bevelEnabled: false,
        steps: 1,
      });
      // Smooth shading
      geo.computeVertexNormals();
      return geo;
    } catch {
      // Defensive: malformed polygons can crash triangulation
      return null;
    }
  }, [points, heightM]);

  if (!geometry) return null;

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#DDD5C6" roughness={0.9} metalness={0} />
    </mesh>
  );
}

// ─── Road segment ────────────────────────────────────────────────────────────

function OsmRoadMesh({ road }: { road: OsmRoad }) {
  const { points, widthM } = road;

  return (
    <group>
      {points.slice(0, -1).map((a, i) => {
        const b = points[i + 1];
        const dx = b.x - a.x;
        const dz = b.y - a.y;
        const len = Math.sqrt(dx * dx + dz * dz);
        if (len < 0.01) return null;

        const cx = (a.x + b.x) / 2;
        const cz = (a.y + b.y) / 2;
        const yaw = Math.atan2(dz, dx);

        return (
          <mesh
            key={i}
            position={[cx, 0.01, cz]}
            rotation={[-Math.PI / 2, 0, -yaw]}
            receiveShadow
          >
            <planeGeometry args={[len, widthM]} />
            <meshStandardMaterial color="#5B5B60" roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function OsmEnvironment() {
  const osmEnv = useProject((s) => s.plot.osmEnvironment);

  if (!osmEnv) return null;

  return (
    <group>
      {osmEnv.buildings.map((b, i) => (
        <OsmBuildingMesh key={`b-${i}`} building={b} />
      ))}
      {osmEnv.roads.map((r, i) => (
        <OsmRoadMesh key={`r-${i}`} road={r} />
      ))}
    </group>
  );
}
