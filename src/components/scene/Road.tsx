"use client";

export function Road({
  plotWidth,
  plotDepth,
}: {
  plotWidth: number;
  plotDepth: number;
}) {
  const roadZ = plotDepth / 2 + 4; // road sits south of the plot
  const sidewalkZ = plotDepth / 2 + 1.25;

  return (
    <group>
      {/* Sidewalk */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, sidewalkZ]}
        receiveShadow
      >
        <planeGeometry args={[plotWidth + 30, 1.5]} />
        <meshStandardMaterial color="#C9C5BD" roughness={1} />
      </mesh>

      {/* Road asphalt */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.004, roadZ]}
        receiveShadow
      >
        <planeGeometry args={[plotWidth + 30, 5]} />
        <meshStandardMaterial color="#5B5B60" roughness={0.95} />
      </mesh>

      {/* Center line */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.006, roadZ]}
      >
        <planeGeometry args={[plotWidth + 30, 0.12]} />
        <meshBasicMaterial color="#E8E6E0" />
      </mesh>
    </group>
  );
}
