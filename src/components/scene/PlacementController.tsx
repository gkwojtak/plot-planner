"use client";

import { useRef } from "react";
import { type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useProject } from "@/lib/store/project";
import { analyzePlacement } from "@/lib/analysis/rules";
import { House } from "./House";
import type { HouseDesign } from "@/lib/catalog/houses";

type Props = {
  house: HouseDesign;
  plotWidth: number;
  plotDepth: number;
};

/**
 * Wraps House with drag/rotate behaviour.
 * - Active only when current step === 'place'.
 * - Drag: invisible XZ catcher plane + pointer capture; clamps house center
 *   so the bounding box stays inside the plot.
 */
export function PlacementController({ house, plotWidth, plotDepth }: Props) {
  const step = useProject((s) => s.step);
  const placement = useProject((s) => s.placement);
  const setPlacement = useProject((s) => s.setPlacement);
  const plot = useProject((s) => s.plot);

  const isPlacing = step === "place";
  const showHighlight = isPlacing || step === "analyze";

  const analysis = analyzePlacement(plot, house, placement);
  const ringColor =
    analysis.overall === "failed"
      ? "#C25A4A"
      : analysis.overall === "warning"
        ? "#D49A2A"
        : "#2347D9";
  const dragging = useRef(false);
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  // Half extents for clamping (axis-aligned bbox; rotation snapping happens
  // at a coarse 15°, so AABB clamp is good enough for MVP).
  const halfW = house.widthM / 2;
  const halfD = house.depthM / 2;
  const limitX = Math.max(0, plotWidth / 2 - halfW);
  const limitZ = Math.max(0, plotDepth / 2 - halfD);

  function clampPos(x: number, z: number) {
    return {
      x: Math.min(limitX, Math.max(-limitX, x)),
      z: Math.min(limitZ, Math.max(-limitZ, z)),
    };
  }

  function handleDown(e: ThreeEvent<PointerEvent>) {
    if (!isPlacing) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    dragOffset.current = {
      x: placement.position.x - e.point.x,
      z: placement.position.y - e.point.z,
    };
  }

  function handleMove(e: ThreeEvent<PointerEvent>) {
    if (!dragging.current) return;
    e.stopPropagation();
    const next = clampPos(
      e.point.x + dragOffset.current.x,
      e.point.z + dragOffset.current.z,
    );
    setPlacement({ position: { x: next.x, y: next.z } });
  }

  function handleUp(e: ThreeEvent<PointerEvent>) {
    if (!dragging.current) return;
    e.stopPropagation();
    dragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }

  const houseRotationRad = (placement.rotationDeg * Math.PI) / 180;

  return (
    <group>
      {/* Invisible drag catcher — only mounted in placing mode so it doesn't
          block clicks on other scene elements otherwise. */}
      {isPlacing && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.05, 0]}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          visible={false}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* The house — receives pointer-down to start a drag. */}
      <group
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      >
        <House
          position={[placement.position.x, 0, placement.position.y]}
          rotation={houseRotationRad}
          width={house.widthM}
          depth={house.depthM}
          height={house.heightM}
          modelUrl={house.modelUrl}
          openings={house.wallOpenings}
        />
      </group>

      {/* Highlight ring when in placing mode or analyse step.
          Color reflects overall analysis status (passed/warning/failed). */}
      {showHighlight && (
        <mesh
          position={[placement.position.x, 0.06, placement.position.y]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              Math.max(halfW, halfD) + 0.4,
              Math.max(halfW, halfD) + 0.7,
              48,
            ]}
          />
          <meshBasicMaterial color={ringColor} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}
