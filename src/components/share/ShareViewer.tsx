"use client";

import { useEffect, useRef } from "react";
import { Scene } from "@/components/scene/Scene";
import { useProject } from "@/lib/store/project";
import type { LoadedProject } from "@/lib/projects/queries";
import { ShareTopBar } from "./ShareTopBar";
import { ShareSidePanel } from "./ShareSidePanel";
import { ShareVariantBar } from "./ShareVariantBar";

/**
 * Read-only project viewer used at /share/[token].
 * Hydrates the store from server data and forces step to a non-editable mode
 * so the scene's drag/rotate controllers stay inactive.
 */
export function ShareViewer({ project }: { project: LoadedProject }) {
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (lastId.current === project.id) return;
    lastId.current = project.id;

    useProject.setState({
      meta: { id: null, name: project.name }, // null id — Save would be a no-op anyway, but it's hidden
      plot: {
        kind: project.plot.kind,
        widthM: project.plot.widthM,
        depthM: project.plot.depthM,
        points:
          project.plot.points.length > 0
            ? project.plot.points
            : rectanglePoints(project.plot.widthM, project.plot.depthM),
        roadEdge: project.plot.roadEdge,
        northRotationDeg: project.plot.northRotationDeg,
      },
      selectedHouseId: project.selectedHouseSlug,
      scenarios: project.scenarios,
      currentScenario: "A",
      placement: project.scenarios.A,
      // Force a non-editable step. PlacementController only enables drag for "place".
      step: "analyze",
    });
  }, [project]);

  return (
    <div className="relative flex h-dvh w-dvw flex-col overflow-hidden bg-bg">
      <ShareTopBar />
      <div className="relative flex flex-1 overflow-hidden">
        <Scene />
        <ShareSidePanel className="absolute right-4 top-4 bottom-24 z-10 hidden md:flex" />
      </div>
      <ShareVariantBar />
    </div>
  );
}

function rectanglePoints(w: number, d: number) {
  return [
    { x: -w / 2, y: -d / 2 },
    { x: w / 2, y: -d / 2 },
    { x: w / 2, y: d / 2 },
    { x: -w / 2, y: d / 2 },
  ];
}
