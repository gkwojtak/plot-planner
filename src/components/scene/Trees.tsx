"use client";

import { useMemo } from "react";
import * as THREE from "three";

type TreeSpec = { x: number; z: number; scale: number };

export function Trees({
  plotWidth,
  plotDepth,
}: {
  plotWidth: number;
  plotDepth: number;
}) {
  const trees = useMemo<TreeSpec[]>(() => {
    const halfW = plotWidth / 2;
    const halfD = plotDepth / 2;
    return [
      // On-plot
      { x: halfW - 2, z: -halfD + 3, scale: 1.0 },
      { x: -halfW + 2, z: -halfD + 6, scale: 1.2 },
      { x: -halfW + 2.5, z: halfD - 4, scale: 0.85 },
      // Surroundings
      { x: -halfW - 6, z: -halfD - 2, scale: 1.4 },
      { x: halfW + 6, z: -halfD - 4, scale: 1.1 },
      { x: -halfW - 8, z: 0, scale: 1.3 },
      { x: halfW + 9, z: 6, scale: 1.0 },
      { x: -halfW - 4, z: halfD + 8, scale: 1.2 },
      { x: halfW + 7, z: halfD + 9, scale: 1.4 },
    ];
  }, [plotWidth, plotDepth]);

  // Instanced geometry for performance
  const trunkGeom = useMemo(() => new THREE.CylinderGeometry(0.18, 0.22, 1.6, 6), []);
  const crownGeom = useMemo(() => new THREE.SphereGeometry(1.1, 12, 8), []);

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.scale}>
          <mesh
            geometry={trunkGeom}
            position={[0, 0.8, 0]}
            castShadow
          >
            <meshStandardMaterial color="#7A5239" roughness={0.9} />
          </mesh>
          <mesh
            geometry={crownGeom}
            position={[0, 2.2, 0]}
            castShadow
          >
            <meshStandardMaterial color="#5B8A4E" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
