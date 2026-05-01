"use client";

export function NeighborBuildings({
  plotWidth,
  plotDepth,
}: {
  plotWidth: number;
  plotDepth: number;
}) {
  const halfW = plotWidth / 2;
  const halfD = plotDepth / 2;

  return (
    <group>
      {/* Left neighbor */}
      <Building
        position={[-halfW - 12, 0, -halfD + 8]}
        size={[9, 6, 11]}
        color="#E2DBCE"
      />
      {/* Right neighbor */}
      <Building
        position={[halfW + 11, 0, -halfD + 5]}
        size={[10, 5.5, 10]}
        color="#E8E0D2"
      />
      {/* Across the road */}
      <Building
        position={[-6, 0, halfD + 14]}
        size={[12, 7, 10]}
        color="#DDD5C6"
      />
      <Building
        position={[12, 0, halfD + 13]}
        size={[9, 6, 9]}
        color="#E2DBCE"
      />
    </group>
  );
}

function Building({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  const [w, h, d] = size;
  return (
    <mesh position={[position[0], h / 2, position[2]]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
