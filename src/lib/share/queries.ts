import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { LoadedProject } from "@/lib/projects/queries";
import type {
  Vec2,
  RoadEdge,
  PlotKind,
  ScenarioLetter,
  PlacementState,
} from "@/lib/store/project";

const DEFAULT_PLACEMENT: PlacementState = {
  position: { x: 0, y: -4 },
  rotationDeg: 0,
};

type RpcShape = {
  id: string;
  name: string;
  plot: {
    kind: string;
    width_m: number | null;
    depth_m: number | null;
    points: Vec2[];
    road_edge: string | null;
    north_rotation_deg: number;
    area_m2: number;
  } | null;
  scenarios: Array<{
    name: string;
    position: number;
    placement: {
      position_x: number;
      position_y: number;
      rotation_deg: number;
      house_slug: string | null;
    } | null;
  }>;
};

/**
 * Load a project via a share token. Uses get_shared_project RPC which is
 * SECURITY DEFINER and validates the token, so anonymous viewers can read
 * shared projects without RLS access.
 */
export async function loadSharedProject(
  token: string,
): Promise<LoadedProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_project", {
    share_token: token,
  });
  if (error || !data) return null;

  const r = data as RpcShape;
  if (!r?.id) return null;

  const scenarios: Record<ScenarioLetter, PlacementState> = {
    A: { ...DEFAULT_PLACEMENT, position: { ...DEFAULT_PLACEMENT.position } },
    B: { ...DEFAULT_PLACEMENT, position: { ...DEFAULT_PLACEMENT.position } },
    C: { ...DEFAULT_PLACEMENT, position: { ...DEFAULT_PLACEMENT.position } },
  };
  let selectedSlug: string | null = null;

  for (const s of r.scenarios ?? []) {
    const letter = s.name as ScenarioLetter;
    if (!(letter in scenarios)) continue;
    if (s.placement) {
      scenarios[letter] = {
        position: {
          x: Number(s.placement.position_x),
          y: Number(s.placement.position_y),
        },
        rotationDeg: Number(s.placement.rotation_deg),
      };
      selectedSlug ??= s.placement.house_slug ?? null;
    }
  }

  return {
    id: r.id,
    name: r.name,
    plot: {
      kind: ((r.plot?.kind as PlotKind) ?? "rectangle"),
      widthM: Number(r.plot?.width_m ?? 20),
      depthM: Number(r.plot?.depth_m ?? 35),
      points: r.plot?.points ?? [],
      roadEdge: ((r.plot?.road_edge as RoadEdge) ?? "south"),
      northRotationDeg: Number(r.plot?.north_rotation_deg ?? 0),
    },
    selectedHouseSlug: selectedSlug,
    scenarios,
  };
}
