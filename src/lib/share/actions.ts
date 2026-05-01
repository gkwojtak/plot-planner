"use server";

import { createClient } from "@/lib/supabase/server";

export type CreateShareLinkResult =
  | { ok: true; token: string; url: string }
  | { ok: false; error: "not_authenticated" | "db_error"; message?: string };

/**
 * Creates a new share link for the project (or returns the most recent active one).
 * Owner-only — RLS enforces.
 */
export async function createOrGetShareLink(
  projectId: string,
): Promise<CreateShareLinkResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  // Try existing first
  const { data: existing } = await supabase
    .from("share_links")
    .select("token")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let token = existing?.token as string | undefined;

  if (!token) {
    const { data, error } = await supabase
      .from("share_links")
      .insert({ project_id: projectId })
      .select("token")
      .single();
    if (error || !data) {
      return { ok: false, error: "db_error", message: error?.message };
    }
    token = data.token as string;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    ok: true,
    token,
    url: `${baseUrl}/share/${token}`,
  };
}

export type RevokeShareLinkResult = { ok: boolean; message?: string };

export async function revokeShareLink(
  projectId: string,
): Promise<RevokeShareLinkResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("share_links")
    .delete()
    .eq("project_id", projectId);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
