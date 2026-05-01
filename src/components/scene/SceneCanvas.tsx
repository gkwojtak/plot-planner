"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, SoftShadows, Environment } from "@react-three/drei";
import { useTheme } from "next-themes";
import { useProject } from "@/lib/store/project";
import { findHouse } from "@/lib/catalog/houses";
import { Ground } from "./Ground";
import { Plot } from "./Plot";
import { Road } from "./Road";
import { Trees } from "./Trees";
import { NeighborBuildings } from "./NeighborBuildings";
import { DimensionLabels } from "./DimensionLabels";
import { PlacementController } from "./PlacementController";
import { OsmEnvironment } from "./OsmEnvironment";

export function SceneCanvas() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const widthM = useProject((s) => s.plot.widthM);
  const depthM = useProject((s) => s.plot.depthM);
  const plotKind = useProject((s) => s.plot.kind);
  const selectedHouseId = useProject((s) => s.selectedHouseId);
  const step = useProject((s) => s.step);
  const isPlacing = step === "place";
  const house = findHouse(selectedHouseId);

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
      <Plot width={widthM} depth={depthM} />
      {house && (
        <PlacementController
          house={house}
          plotWidth={widthM}
          plotDepth={depthM}
        />
      )}
      {/* Synthetic environment (road/neighbors/labels) only fits rectangular
          demo plots aligned to the road. Polygon plots — especially imported
          ones — would be misaligned, so we hide it. */}
      {plotKind === "rectangle" && (
        <>
          <Road plotWidth={widthM} plotDepth={depthM} />
          <Trees plotWidth={widthM} plotDepth={depthM} />
          <NeighborBuildings plotWidth={widthM} plotDepth={depthM} />
          <DimensionLabels width={widthM} depth={depthM} />
        </>
      )}
      {/* Real OSM environment — shown for polygon (imported) plots when data is available */}
      <OsmEnvironment />

      <OrbitControls
        enablePan={false}
        enabled={!isPlacing}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={25}
        maxDistance={90}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
