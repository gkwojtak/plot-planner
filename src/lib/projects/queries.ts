import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Vec2, RoadEdge, PlotKind } from "@/lib/store/project";

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
  placement: { x: number; y: number; rotationDeg: number };
};

/**
 * Load a single project + its plot + first scenario's placement.
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

  // First scenario (A) + its placement + the underlying house design slug.
  const { data: scenario } = await supabase
    .from("scenarios")
    .select(
      `id,
       placements (
         position_x,
         position_y,
         rotation_deg,
         house_designs ( catalog_slug )
       )`,
    )
    .eq("project_id", id)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  type PlacementRow = {
    position_x: number;
    position_y: number;
    rotation_deg: number;
    house_designs: { catalog_slug: string | null } | null;
  };
  const placementRow = scenario?.placements?.[0] as PlacementRow | undefined;

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
    selectedHouseSlug: placementRow?.house_designs?.catalog_slug ?? null,
    placement: {
      x: Number(placementRow?.position_x ?? 0),
      y: Number(placementRow?.position_y ?? -4),
      rotationDeg: Number(placementRow?.rotation_deg ?? 0),
    },
  };
}
