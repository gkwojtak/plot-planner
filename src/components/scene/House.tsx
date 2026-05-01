"use client";

import { Suspense, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { WallOpening } from "@/lib/catalog/houses";

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
  openings?: WallOpening[];
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

/**
 * Procedural box-house fallback.
 * Windows and doors are rendered based on the `openings` prop so the
 * visualisation matches the data that drives the setback analysis.
 * Face z-offsets: south (front) = +depth/2, north (back) = -depth/2,
 * east (right) = +width/2 on X axis, west (left) = -width/2 on X axis.
 */
function ProceduralHouse({
  position,
  rotation,
  width,
  depth,
  height,
  openings = [],
}: {
  position: [number, number, number];
  rotation: number;
  width: number;
  depth: number;
  height: number;
  openings?: WallOpening[];
}) {
  const wallY = height / 2;
  const roofThickness = 0.4;
  const roofOverhang = 0.5;
  const eps = 0.011; // small z-fight offset

  function hasDoor(side: WallOpening["side"]) {
    return openings.some((o) => o.side === side && o.hasDoor);
  }
  function hasWindow(side: WallOpening["side"]) {
    return openings.some((o) => o.side === side && o.hasWindow);
  }

  // Window strip Y centre — mid-height, same style as original
  const winY = Math.max(height * 0.6, 1.8);
  const winH = 1.2;
  const winW = Math.min(width * 0.35, 2.5);
  const winWsides = Math.min(depth * 0.35, 2.5);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Walls */}
      <mesh position={[0, wallY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#EFEAE0" roughness={0.85} />
      </mesh>

      {/* Flat roof slab with overhang */}
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

      {/* Front face (south, +Z in local frame) */}
      {hasDoor("front") && (
        <mesh position={[0, 1.05, depth / 2 + eps]}>
          <planeGeometry args={[1.2, 2.1]} />
          <meshStandardMaterial color="#7A5239" roughness={0.6} />
        </mesh>
      )}
      {hasWindow("front") && (
        <>
          <mesh position={[-width / 4, winY, depth / 2 + eps]}>
            <planeGeometry args={[winW, winH]} />
            <meshStandardMaterial color="#2347D9" opacity={0.55} transparent />
          </mesh>
          <mesh position={[width / 4, winY, depth / 2 + eps]}>
            <planeGeometry args={[winW, winH]} />
            <meshStandardMaterial color="#2347D9" opacity={0.55} transparent />
          </mesh>
        </>
      )}

      {/* Back face (north, -Z in local frame) */}
      {hasDoor("back") && (
        <mesh position={[0, 1.05, -(depth / 2 + eps)]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.2, 2.1]} />
          <meshStandardMaterial color="#7A5239" roughness={0.6} />
        </mesh>
      )}
      {hasWindow("back") && (
        <mesh position={[0, winY, -(depth / 2 + eps)]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[winW * 1.5, winH]} />
          <meshStandardMaterial color="#2347D9" opacity={0.55} transparent />
        </mesh>
      )}

      {/* Right face (east, +X in local frame) */}
      {hasDoor("right") && (
        <mesh position={[width / 2 + eps, 1.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 2.1]} />
          <meshStandardMaterial color="#7A5239" roughness={0.6} />
        </mesh>
      )}
      {hasWindow("right") && (
        <mesh position={[width / 2 + eps, winY, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[winWsides, winH]} />
          <meshStandardMaterial color="#2347D9" opacity={0.55} transparent />
        </mesh>
      )}

      {/* Left face (west, -X in local frame) */}
      {hasDoor("left") && (
        <mesh position={[-(width / 2 + eps), 1.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 2.1]} />
          <meshStandardMaterial color="#7A5239" roughness={0.6} />
        </mesh>
      )}
      {hasWindow("left") && (
        <mesh position={[-(width / 2 + eps), winY, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[winWsides, winH]} />
          <meshStandardMaterial color="#2347D9" opacity={0.55} transparent />
        </mesh>
      )}
    </group>
  );
}

export function House({ position, rotation, width, depth, height, modelUrl, openings }: HouseProps) {
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
            openings={openings}
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
      openings={openings}
    />
  );
}
