"use client";

type HouseProps = {
  position: [number, number, number];
  rotation: number;
  width: number;
  depth: number;
  height: number;
};

export function House({ position, rotation, width, depth, height }: HouseProps) {
  const wallY = height / 2;
  const roofThickness = 0.4;
  const roofOverhang = 0.5;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Walls */}
      <mesh position={[0, wallY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#EFEAE0" roughness={0.85} />
      </mesh>

      {/* Flat roof slab with overhang — cleaner architectural maquette feel */}
      <mesh
        position={[0, height + roofThickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[width + roofOverhang * 2, roofThickness, depth + roofOverhang * 2]}
        />
        <meshStandardMaterial color="#7A5239" roughness={0.75} />
      </mesh>

      {/* Door — wood plate on the south face */}
      <mesh position={[0, 1.05, depth / 2 + 0.011]}>
        <planeGeometry args={[1.2, 2.1]} />
        <meshStandardMaterial color="#7A5239" roughness={0.6} />
      </mesh>

      {/* Window strips on the south face — subtle blue accent */}
      <mesh position={[-width / 4, 4.5, depth / 2 + 0.011]}>
        <planeGeometry args={[2.5, 1.2]} />
        <meshStandardMaterial color="#2347D9" opacity={0.55} transparent />
      </mesh>
      <mesh position={[width / 4, 4.5, depth / 2 + 0.011]}>
        <planeGeometry args={[2.5, 1.2]} />
        <meshStandardMaterial color="#2347D9" opacity={0.55} transparent />
      </mesh>
    </group>
  );
}
