"use client";

import { useEffect, useRef } from "react";
import { useProject } from "@/lib/store/project";
import type { LoadedProject } from "@/lib/projects/queries";

/**
 * Sets the Zustand store from server-loaded project data exactly once,
 * before the user sees the page. Re-runs when `project.id` changes
 * (i.e. user navigates between projects without remount of the workspace).
 */
export function ProjectHydrator({ project }: { project: LoadedProject }) {
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (lastId.current === project.id) return;
    lastId.current = project.id;

    useProject.setState({
      meta: { id: project.id, name: project.name },
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
      placement: {
        position: { x: project.placement.x, y: project.placement.y },
        rotationDeg: project.placement.rotationDeg,
      },
    });
  }, [project]);

  return null;
}

function rectanglePoints(w: number, d: number) {
  return [
    { x: -w / 2, y: -d / 2 },
    { x: w / 2, y: -d / 2 },
    { x: w / 2, y: d / 2 },
    { x: -w / 2, y: d / 2 },
  ];
}
