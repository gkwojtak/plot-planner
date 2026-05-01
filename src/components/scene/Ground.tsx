"use client";

export function Ground() {
  // Large background ground — soft greyish wash so the plot reads as the focus.
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.02, 0]}
      receiveShadow
    >
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#D8D5CF" roughness={1} />
    </mesh>
  );
}
