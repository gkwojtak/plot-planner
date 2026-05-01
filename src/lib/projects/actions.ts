"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PlotState } from "@/lib/store/project";

export type SaveProjectInput = {
  /** null = new project; otherwise update existing. */
  id: string | null;
  name: string;
  plot: PlotState;
  selectedHouseId: string | null;
  /** Procedural placement of the house in scene coords (meters). */
  placement: { x: number; y: number; rotationDeg: number };
};

export type SaveProjectResult =
  | { ok: true; id: string }
  | { ok: false; error: "not_authenticated" | "db_error"; message?: string };

/**
 * Upsert a project + its plot + scenario(A) + placement.
 * Returns the project id (existing or newly created).
 */
export async function saveProject(
  input: SaveProjectInput,
): Promise<SaveProjectResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "not_authenticated" };

  const area_m2 =
    input.plot.kind === "rectangle"
      ? input.plot.widthM * input.plot.depthM
      : shoelaceArea(input.plot.points);

  // 1) project row
  let projectId = input.id;
  if (!projectId) {
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: input.name })
      .select("id")
      .single();
    if (error || !data)
      return { ok: false, error: "db_error", message: error?.message };
    projectId = data.id;
  } else {
    const { error } = await supabase
      .from("projects")
      .update({ name: input.name })
      .eq("id", projectId);
    if (error) return { ok: false, error: "db_error", message: error.message };
  }

  // 2) plot — upsert by project_id (unique)
  const { error: plotErr } = await supabase.from("plots").upsert(
    {
      project_id: projectId,
      name: "Działka",
      kind: input.plot.kind,
      width_m: input.plot.widthM,
      depth_m: input.plot.depthM,
      points: input.plot.points,
      area_m2,
      road_edge: input.plot.roadEdge,
      north_rotation_deg: input.plot.northRotationDeg,
    },
    { onConflict: "project_id" },
  );
  if (plotErr)
    return { ok: false, error: "db_error", message: plotErr.message };

  // 3) scenario A + placement (only if a house is selected)
  if (input.selectedHouseId) {
    const houseDb = await resolveHouseDesignId(supabase, input.selectedHouseId);
    if (houseDb) {
      const { data: scenario, error: scErr } = await supabase
        .from("scenarios")
        .upsert(
          { project_id: projectId, name: "A", position: 0 },
          { onConflict: "project_id,name", ignoreDuplicates: false },
        )
        .select("id")
        .single();

      if (!scErr && scenario) {
        await supabase.from("placements").upsert(
          {
            scenario_id: scenario.id,
            house_design_id: houseDb,
            position_x: input.placement.x,
            position_y: input.placement.y,
            rotation_deg: input.placement.rotationDeg,
          },
          { onConflict: "scenario_id" },
        );
      }
    }
  }

  revalidatePath(`/projects/${projectId}`);
  return { ok: true, id: projectId! };
}

function shoelaceArea(pts: { x: number; y: number }[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(a) / 2;
}

async function resolveHouseDesignId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  catalogSlug: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("house_designs")
    .select("id")
    .eq("catalog_slug", catalogSlug)
    .maybeSingle();
  return data?.id ?? null;
}
