import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Vec2,
  RoadEdge,
  PlotKind,
  ScenarioLetter,
  PlacementState,
} from "@/lib/store/project";

export type LoadedProject = {
  id: string;
  name: string;
  plot: {
    kind: PlotKind;
    widthM: number;
    depthM: number;
    points: Vec2[];
    roadEdge: RoadEdge;
    northRotationDeg: number;
  };
  selectedHouseSlug: string | null;
  scenarios: Record<ScenarioLetter, PlacementState>;
};

const DEFAULT_PLACEMENT: PlacementState = {
  position: { x: 0, y: -4 },
  rotationDeg: 0,
};

/**
 * Load a single project + its plot + all scenarios with placements.
 * RLS guarantees the caller can only read their own projects.
 * Returns null if not found / not authorised.
 */
export async function loadProject(id: string): Promise<LoadedProject | null> {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (!project) return null;

  const { data: plot } = await supabase
    .from("plots")
    .select("kind, width_m, depth_m, points, road_edge, north_rotation_deg")
    .eq("project_id", id)
    .maybeSingle();

  // All scenarios + their placements + the underlying house design slug
  const { data: scenarioRows } = await supabase
    .from("scenarios")
    .select(
      `name,
       placements (
         position_x,
         position_y,
         rotation_deg,
         house_designs ( catalog_slug )
       )`,
    )
    .eq("project_id", id)
    .order("position", { ascending: true });

  type PlacementRow = {
    position_x: number;
    position_y: number;
    rotation_deg: number;
    // PostgREST returns the joined row as an array even for a FK 1:1.
    house_designs: { catalog_slug: string | null }[] | null;
  };
  type ScenarioRow = { name: string; placements: PlacementRow[] };

  const rows = (scenarioRows ?? []) as unknown as ScenarioRow[];

  const scenarios: Record<ScenarioLetter, PlacementState> = {
    A: { ...DEFAULT_PLACEMENT, position: { ...DEFAULT_PLACEMENT.position } },
    B: { ...DEFAULT_PLACEMENT, position: { ...DEFAULT_PLACEMENT.position } },
    C: { ...DEFAULT_PLACEMENT, position: { ...DEFAULT_PLACEMENT.position } },
  };

  let selectedSlug: string | null = null;

  for (const row of rows) {
    const letter = row.name as ScenarioLetter;
    if (!(letter in scenarios)) continue;
    const placement = row.placements?.[0];
    if (placement) {
      scenarios[letter] = {
        position: {
          x: Number(placement.position_x),
          y: Number(placement.position_y),
        },
        rotationDeg: Number(placement.rotation_deg),
      };
      selectedSlug ??= placement.house_designs?.[0]?.catalog_slug ?? null;
    }
  }

  return {
    id: project.id,
    name: project.name,
    plot: {
      kind: (plot?.kind as PlotKind) ?? "rectangle",
      widthM: Number(plot?.width_m ?? 20),
      depthM: Number(plot?.depth_m ?? 35),
      points: (plot?.points as Vec2[]) ?? [],
      roadEdge: (plot?.road_edge as RoadEdge) ?? "south",
      northRotationDeg: Number(plot?.north_rotation_deg ?? 0),
    },
    selectedHouseSlug: selectedSlug,
    scenarios,
  };
}
