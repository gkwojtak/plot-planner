"use client";

import { create } from "zustand";

export type Vec2 = { x: number; y: number };

export type PlotKind = "rectangle" | "polygon";
export type RoadEdge = "north" | "south" | "east" | "west";
export type WorkflowStep = "plot" | "house" | "place" | "analyze" | "share";

export type PlotState = {
  kind: PlotKind;
  widthM: number;
  depthM: number;
  /**
   * Source of truth for geometry. For rectangle, derived from width/depth.
   * For polygon (Sprint 5), this is the editable point list.
   */
  points: Vec2[];
  roadEdge: RoadEdge;
  northRotationDeg: number;
};

export type PlacementState = {
  /** Position of house center on the plot, in meters from plot origin. */
  position: Vec2;
  rotationDeg: number;
};

export type ProjectMeta = {
  id: string | null; // null until first save
  name: string;
};

export type ProjectStore = {
  meta: ProjectMeta;
  plot: PlotState;
  /** id of the catalog house design currently picked, or null. */
  selectedHouseId: string | null;
  placement: PlacementState;
  step: WorkflowStep;

  setProjectName: (name: string) => void;
  setPlotDimensions: (width: number, depth: number) => void;
  setRoadEdge: (edge: RoadEdge) => void;
  setNorthRotation: (deg: number) => void;
  selectHouse: (id: string | null) => void;
  setPlacement: (placement: Partial<PlacementState>) => void;
  setStep: (step: WorkflowStep) => void;
};

const rectanglePoints = (w: number, d: number): Vec2[] => [
  { x: -w / 2, y: -d / 2 },
  { x: w / 2, y: -d / 2 },
  { x: w / 2, y: d / 2 },
  { x: -w / 2, y: d / 2 },
];

const initialPlot: PlotState = {
  kind: "rectangle",
  widthM: 20,
  depthM: 35,
  points: rectanglePoints(20, 35),
  roadEdge: "south",
  northRotationDeg: 0,
};

const initialPlacement: PlacementState = {
  position: { x: 0, y: -4 },
  rotationDeg: 0,
};

export const useProject = create<ProjectStore>((set) => ({
  meta: { id: null, name: "Mój nowy projekt" },
  plot: initialPlot,
  selectedHouseId: "system-mala-kostka",
  placement: initialPlacement,
  step: "plot",

  setProjectName: (name) => set((s) => ({ meta: { ...s.meta, name } })),

  setPlotDimensions: (widthM, depthM) =>
    set((s) => ({
      plot: {
        ...s.plot,
        widthM,
        depthM,
        points: rectanglePoints(widthM, depthM),
      },
    })),

  setRoadEdge: (roadEdge) => set((s) => ({ plot: { ...s.plot, roadEdge } })),

  setNorthRotation: (deg) =>
    set((s) => ({ plot: { ...s.plot, northRotationDeg: deg } })),

  selectHouse: (id) => set({ selectedHouseId: id }),

  setPlacement: (patch) =>
    set((s) => ({ placement: { ...s.placement, ...patch } })),

  setStep: (step) => set({ step }),
}));

// Selectors — keep React renders narrow.
export const selectPlotArea = (s: ProjectStore) => {
  if (s.plot.kind === "rectangle") return s.plot.widthM * s.plot.depthM;
  const pts = s.plot.points;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
};
