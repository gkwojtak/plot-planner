"use client";

import { useEffect } from "react";
import { useProject, type PlacementState } from "@/lib/store/project";

const DEFAULT_WIDTH = 20;
const DEFAULT_DEPTH = 35;

const rectanglePoints = (w: number, d: number) => [
  { x: -w / 2, y: -d / 2 },
  { x: w / 2, y: -d / 2 },
  { x: w / 2, y: d / 2 },
  { x: -w / 2, y: d / 2 },
];

const defaultPlacement: PlacementState = {
  position: { x: 0, y: -4 },
  rotationDeg: 0,
};

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
      scenarios: {
        A: { ...defaultPlacement, position: { ...defaultPlacement.position } },
        B: { ...defaultPlacement, position: { ...defaultPlacement.position } },
        C: { ...defaultPlacement, position: { ...defaultPlacement.position } },
      },
      currentScenario: "A",
      placement: defaultPlacement,
      step: "plot",
    });
  }, []);

  return null;
}
