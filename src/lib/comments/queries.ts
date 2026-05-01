import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Comment = {
  id: string;
  body: string;
  authorEmail: string | null;
  createdAt: string;
};

export async function loadComments(projectId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, body, created_at, author_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!data) return [];

  // Get current user email — for MVP we only need to show "Ja" vs nothing
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email ?? null;

  return data.map((row) => ({
    id: row.id,
    body: row.body,
    authorEmail: row.author_id === user?.id ? userEmail : null,
    createdAt: row.created_at,
  }));
}
