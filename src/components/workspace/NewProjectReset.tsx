"use client";

import { useEffect } from "react";
import { useProject } from "@/lib/store/project";

const DEFAULT_WIDTH = 20;
const DEFAULT_DEPTH = 35;

const rectanglePoints = (w: number, d: number) => [
  { x: -w / 2, y: -d / 2 },
  { x: w / 2, y: -d / 2 },
  { x: w / 2, y: d / 2 },
  { x: -w / 2, y: d / 2 },
];

/**
 * Resets the store to a fresh new-project state on `/`.
 * Without this, navigating from `/projects/[id]` to `/` would leave the loaded
 * project's id in the store — Zapisz would silently update the wrong project.
 */
export function NewProjectReset() {
  useEffect(() => {
    if (useProject.getState().meta.id === null) return;
    useProject.setState({
      meta: { id: null, name: "Mój nowy projekt" },
      plot: {
        kind: "rectangle",
        widthM: DEFAULT_WIDTH,
        depthM: DEFAULT_DEPTH,
        points: rectanglePoints(DEFAULT_WIDTH, DEFAULT_DEPTH),
        roadEdge: "south",
        northRotationDeg: 0,
      },
      selectedHouseId: "system-mala-kostka",
      placement: { position: { x: 0, y: -4 }, rotationDeg: 0 },
      step: "plot",
    });
  }, []);

  return null;
}
