"use client";

import { Edges } from "@react-three/drei";

export function Plot({ width, depth }: { width: number; depth: number }) {
  return (
    <group>
      {/* Grass surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#A4B585" roughness={0.95} />
      </mesh>

      {/* Plot boundary outline — deep, matte stroke */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges threshold={0} color="#3A4A2E" />
      </mesh>

      {/* 3m setback zone — soft accent overlay */}
      <SetbackZone width={width} depth={depth} setback={3} />
    </group>
  );
}

function SetbackZone({
  width,
  depth,
  setback,
}: {
  width: number;
  depth: number;
  setback: number;
}) {
  // Inner rectangle = buildable area; the strip between outer plot and inner is the setback.
  const inner = {
    w: Math.max(0.1, width - setback * 2),
    d: Math.max(0.1, depth - setback * 2),
  };

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[inner.w, inner.d]} />
      <meshBasicMaterial color="#2347D9" transparent opacity={0.06} />
      <Edges threshold={0} color="#2347D9" />
    </mesh>
  );
}
