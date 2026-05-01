"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, SoftShadows, Environment } from "@react-three/drei";
import { useTheme } from "next-themes";
import { Ground } from "./Ground";
import { Plot } from "./Plot";
import { House } from "./House";
import { Road } from "./Road";
import { Trees } from "./Trees";
import { NeighborBuildings } from "./NeighborBuildings";
import { DimensionLabels } from "./DimensionLabels";

const PLOT_WIDTH = 20; // m
const PLOT_DEPTH = 35; // m

export function SceneCanvas() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [42, 36, 48], fov: 30, near: 0.1, far: 500 }}
    >
      <color attach="background" args={[isDark ? "#1A1A1F" : "#F5F4F0"]} />
      <fog attach="fog" args={[isDark ? "#1A1A1F" : "#F5F4F0", 80, 200]} />

      <SoftShadows size={20} samples={10} focus={0.6} />

      {/* Lighting — soft architectural maquette feel */}
      <ambientLight intensity={isDark ? 0.55 : 0.7} />
      <directionalLight
        position={[25, 40, 18]}
        intensity={isDark ? 1.1 : 1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.1}
        shadow-camera-far={150}
        shadow-bias={-0.0005}
      />
      <Environment preset={isDark ? "night" : "city"} />

      {/* World */}
      <Ground />
      <Road plotWidth={PLOT_WIDTH} plotDepth={PLOT_DEPTH} />
      <Plot width={PLOT_WIDTH} depth={PLOT_DEPTH} />
      <House
        position={[0, 0, -4]}
        rotation={0}
        width={10}
        depth={12}
        height={7}
      />
      <Trees plotWidth={PLOT_WIDTH} plotDepth={PLOT_DEPTH} />
      <NeighborBuildings plotWidth={PLOT_WIDTH} plotDepth={PLOT_DEPTH} />
      <DimensionLabels width={PLOT_WIDTH} depth={PLOT_DEPTH} />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={25}
        maxDistance={90}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
