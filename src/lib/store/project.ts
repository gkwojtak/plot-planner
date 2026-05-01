"use client";

import { create } from "zustand";

export type Vec2 = { x: number; y: number };

export type PlotKind = "rectangle" | "polygon";
export type RoadEdge = "north" | "south" | "east" | "west";
export type WorkflowStep = "plot" | "house" | "place" | "analyze" | "share";
export type ScenarioLetter = "A" | "B" | "C";

export const SCENARIO_LETTERS: ScenarioLetter[] = ["A", "B", "C"];

export type PlotState = {
  kind: PlotKind;
  widthM: number;
  depthM: number;
  points: Vec2[];
  roadEdge: RoadEdge;
  northRotationDeg: number;
};

export type PlacementState = {
  position: Vec2;
  rotationDeg: number;
};

export type ProjectMeta = {
  id: string | null;
  name: string;
};

export type SnapStep = 5 | 15;

export type ProjectStore = {
  meta: ProjectMeta;
  plot: PlotState;
  selectedHouseId: string | null;
  scenarios: Record<ScenarioLetter, PlacementState>;
  currentScenario: ScenarioLetter;
  /** Active placement = mirror of scenarios[currentScenario] for fast scene reads. */
  placement: PlacementState;
  step: WorkflowStep;
  snapStep: SnapStep;

  setProjectName: (name: string) => void;
  setPlotDimensions: (width: number, depth: number) => void;
  setRoadEdge: (edge: RoadEdge) => void;
  setNorthRotation: (deg: number) => void;
  selectHouse: (id: string | null) => void;
  setPlacement: (placement: Partial<PlacementState>) => void;
  switchScenario: (letter: ScenarioLetter) => void;
  setStep: (step: WorkflowStep) => void;
  setSnapStep: (s: SnapStep) => void;
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

const initialScenarios: Record<ScenarioLetter, PlacementState> = {
  A: { ...initialPlacement, position: { ...initialPlacement.position } },
  B: { ...initialPlacement, position: { ...initialPlacement.position } },
  C: { ...initialPlacement, position: { ...initialPlacement.position } },
};

export const useProject = create<ProjectStore>((set) => ({
  meta: { id: null, name: "Mój nowy projekt" },
  plot: initialPlot,
  selectedHouseId: "system-mala-kostka",
  scenarios: initialScenarios,
  currentScenario: "A",
  placement: initialScenarios.A,
  step: "plot",
  snapStep: 15,

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
    set((s) => {
      const next: PlacementState = {
        position: patch.position ?? s.placement.position,
        rotationDeg: patch.rotationDeg ?? s.placement.rotationDeg,
      };
      return {
        placement: next,
        scenarios: { ...s.scenarios, [s.currentScenario]: next },
      };
    }),

  switchScenario: (letter) =>
    set((s) => ({
      currentScenario: letter,
      placement: s.scenarios[letter],
    })),

  setStep: (step) => set({ step }),

  setSnapStep: (s) => set({ snapStep: s }),
}));

// Selectors
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
