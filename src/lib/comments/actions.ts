"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddCommentInput = { projectId: string; body: string };
export type AddCommentResult =
  | { ok: true }
  | { ok: false; error: "not_authenticated" | "empty" | "db_error"; message?: string };

export async function addComment(
  input: AddCommentInput,
): Promise<AddCommentResult> {
  const body = input.body.trim();
  if (!body) return { ok: false, error: "empty" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const { error } = await supabase.from("comments").insert({
    project_id: input.projectId,
    author_id: user.id,
    body,
  });
  if (error) return { ok: false, error: "db_error", message: error.message };

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true };
}

export async function deleteComment(commentId: string, projectId: string) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}
