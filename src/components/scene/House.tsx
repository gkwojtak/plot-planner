"use client";

import { Suspense, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Preload the two real model URLs so they're ready before the user picks them.
useGLTF.preload("/models/house-cottage.glb");
useGLTF.preload("/models/house-barn.glb");

type HouseProps = {
  position: [number, number, number];
  rotation: number;
  width: number;
  depth: number;
  height: number;
  modelUrl?: string | null;
};

/** Renders a glTF model scaled so its bounding-box width matches `targetWidth`. */
function GltfHouse({
  modelUrl,
  position,
  rotation,
  targetWidth,
}: {
  modelUrl: string;
  position: [number, number, number];
  rotation: number;
  targetWidth: number;
}) {
  const { scene } = useGLTF(modelUrl);

  // Clone so multiple instances of the same model don't share material state.
  const cloned = useRef<THREE.Group | null>(null);

  // Compute uniform scale so model width matches targetWidth.
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);

  // Avoid divide-by-zero if model hasn't loaded bounding box yet.
  const modelWidth = size.x > 0 ? size.x : 1;
  const scale = targetWidth / modelWidth;

  // Shift model so its base sits at y=0 (some models have their origin at centre).
  const minY = box.min.y;
  const yOffset = -minY * scale;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <primitive
        ref={cloned}
        object={scene.clone(true)}
        scale={[scale, scale, scale]}
        position={[0, yOffset, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/** Procedural box-house fallback (original implementation). */
function ProceduralHouse({
  position,
  rotation,
  width,
  depth,
  height,
}: {
  position: [number, number, number];
  rotation: number;
  width: number;
  depth: number;
  height: number;
}) {
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

export function House({ position, rotation, width, depth, height, modelUrl }: HouseProps) {
  if (modelUrl) {
    return (
      <Suspense
        fallback={
          <ProceduralHouse
            position={position}
            rotation={rotation}
            width={width}
            depth={depth}
            height={height}
          />
        }
      >
        <GltfHouse
          modelUrl={modelUrl}
          position={position}
          rotation={rotation}
          targetWidth={width}
        />
      </Suspense>
    );
  }

  return (
    <ProceduralHouse
      position={position}
      rotation={rotation}
      width={width}
      depth={depth}
      height={height}
    />
  );
}
