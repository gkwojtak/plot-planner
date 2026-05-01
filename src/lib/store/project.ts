"use client";

import { create } from "zustand";

export type Vec2 = { x: number; y: number };

export type PlotKind = "rectangle" | "polygon";
export type RoadEdge = "north" | "south" | "east" | "west";
export type WorkflowStep = "plot" | "house" | "place" | "analyze" | "share";
export type ScenarioLetter = "A" | "B" | "C";

export const SCENARIO_LETTERS: ScenarioLetter[] = ["A", "B", "C"];

export type LatLon = { lat: number; lon: number };

export type OsmBuilding = {
  /** Polygon in plot-local meters (x=east, y=north). */
  points: Vec2[];
  heightM: number;
};

export type OsmRoad = {
  /** Polyline in plot-local meters. */
  points: Vec2[];
  /** OSM highway value: residential | tertiary | secondary | service | footway | etc. */
  kind: string;
  widthM: number;
};

export type OsmEnvironment = {
  buildings: OsmBuilding[];
  roads: OsmRoad[];
};

export type PlotState = {
  kind: PlotKind;
  widthM: number;
  depthM: number;
  points: Vec2[];
  roadEdge: RoadEdge;
  northRotationDeg: number;
  locationWgs84?: LatLon | null;
  uldkId?: string | null;
  polygonWgs84?: LatLon[] | null;
  osmEnvironment?: OsmEnvironment | null;
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
  setPlotKind: (kind: PlotKind) => void;
  movePlotPoint: (index: number, point: Vec2) => void;
  addPlotPoint: () => void;
  removePlotPoint: (index: number) => void;
  setPlotFromImport: (payload: {
    points: Vec2[];
    locationWgs84: LatLon;
    polygonWgs84: LatLon[];
    uldkId: string;
    areaM2: number;
  }) => void;
  setOsmEnvironment: (env: OsmEnvironment | null) => void;
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
  osmEnvironment: null,
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

  setPlotKind: (kind) =>
    set((s) => {
      if (kind === s.plot.kind) return s;
      // Switching to polygon: keep current 4 corners as editable points.
      // Switching to rectangle: derive from current points' bounding box.
      if (kind === "polygon") {
        return { plot: { ...s.plot, kind } };
      }
      const bbox = pointsBBox(s.plot.points);
      const widthM = Math.max(5, Math.round((bbox.maxX - bbox.minX) * 2) / 2);
      const depthM = Math.max(5, Math.round((bbox.maxY - bbox.minY) * 2) / 2);
      return {
        plot: {
          ...s.plot,
          kind,
          widthM,
          depthM,
          points: rectanglePoints(widthM, depthM),
        },
      };
    }),

  movePlotPoint: (index, point) =>
    set((s) => {
      if (s.plot.kind !== "polygon") return s;
      const pts = s.plot.points.slice();
      pts[index] = point;
      return { plot: { ...s.plot, points: pts } };
    }),

  addPlotPoint: () =>
    set((s) => {
      if (s.plot.kind !== "polygon") return s;
      // Insert a midpoint between the last and first points
      const pts = s.plot.points;
      const last = pts[pts.length - 1];
      const first = pts[0];
      const mid: Vec2 = {
        x: (last.x + first.x) / 2,
        y: (last.y + first.y) / 2,
      };
      return { plot: { ...s.plot, points: [...pts, mid] } };
    }),

  removePlotPoint: (index) =>
    set((s) => {
      if (s.plot.kind !== "polygon") return s;
      if (s.plot.points.length <= 3) return s;
      const pts = s.plot.points.filter((_, i) => i !== index);
      return { plot: { ...s.plot, points: pts } };
    }),

  setPlotFromImport: (payload) =>
    set((s) => {
      const bbox = pointsBBox(payload.points);
      const widthM = Math.max(5, Math.round((bbox.maxX - bbox.minX) * 2) / 2);
      const depthM = Math.max(5, Math.round((bbox.maxY - bbox.minY) * 2) / 2);
      // Centre house on the polygon centroid so it doesn't end up outside
      // the imported parcel.
      const cx =
        payload.points.reduce((a, p) => a + p.x, 0) / payload.points.length;
      const cy =
        payload.points.reduce((a, p) => a + p.y, 0) / payload.points.length;
      const centeredPlacement: PlacementState = {
        position: { x: cx, y: cy },
        rotationDeg: 0,
      };
      return {
        plot: {
          ...s.plot,
          kind: "polygon" as PlotKind,
          points: payload.points,
          widthM,
          depthM,
          locationWgs84: payload.locationWgs84,
          polygonWgs84: payload.polygonWgs84,
          uldkId: payload.uldkId,
          osmEnvironment: null,
        },
        scenarios: {
          A: { ...centeredPlacement, position: { ...centeredPlacement.position } },
          B: { ...centeredPlacement, position: { ...centeredPlacement.position } },
          C: { ...centeredPlacement, position: { ...centeredPlacement.position } },
        },
        placement: centeredPlacement,
        currentScenario: "A",
      };
    }),

  setOsmEnvironment: (env) =>
    set((s) => ({ plot: { ...s.plot, osmEnvironment: env } })),
}));

function pointsBBox(pts: Vec2[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

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
