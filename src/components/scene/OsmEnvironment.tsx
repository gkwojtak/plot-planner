"use client";

import { useProject } from "@/lib/store/project";
import type { OsmBuilding, OsmRoad, Vec2 } from "@/lib/store/project";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bboxOf(pts: Vec2[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

// ─── Building ────────────────────────────────────────────────────────────────

function OsmBuildingMesh({ building }: { building: OsmBuilding }) {
  const { points, heightM } = building;

  // Use bbox-center + BoxGeometry — simple, stable, matches maquette aesthetic.
  const bb = bboxOf(points);
  const w = Math.max(1, bb.maxX - bb.minX);
  const d = Math.max(1, bb.maxY - bb.minY);
  const cx = (bb.minX + bb.maxX) / 2;
  // y_north in local coords maps to scene.z
  const cz = (bb.minY + bb.maxY) / 2;

  if (w < 0.5 || d < 0.5) return null;

  return (
    <mesh position={[cx, heightM / 2, cz]} castShadow receiveShadow>
      <boxGeometry args={[w, heightM, d]} />
      <meshStandardMaterial color="#DDD5C6" roughness={0.9} metalness={0} />
    </mesh>
  );
}

// ─── Road segment ─────────────────────────────────────────────────────────────

function OsmRoadMesh({ road }: { road: OsmRoad }) {
  const { points, widthM } = road;

  return (
    <group>
      {points.slice(0, -1).map((a, i) => {
        const b = points[i + 1];
        // local x=east → scene.x, local y=north → scene.z
        const dx = b.x - a.x;
        const dz = b.y - a.y;
        const len = Math.sqrt(dx * dx + dz * dz);
        if (len < 0.01) return null;

        const cx = (a.x + b.x) / 2;
        const cz = (a.y + b.y) / 2;
        // PlaneGeometry lies in XY by default; rotate -PI/2 around X to lay flat,
        // then rotate around Y to align with segment direction.
        // atan2(dz, dx) gives heading in XZ plane.
        const yaw = Math.atan2(dz, dx);

        return (
          <mesh
            key={i}
            position={[cx, 0.003, cz]}
            rotation={[-Math.PI / 2, 0, yaw]}
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

// ─── Main component ───────────────────────────────────────────────────────────

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
