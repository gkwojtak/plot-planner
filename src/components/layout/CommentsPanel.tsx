"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { addComment, deleteComment } from "@/lib/comments/actions";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/lib/store/project";

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
};

export function CommentsPanel() {
  const projectId = useProject((s) => s.meta.id);

  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!projectId) {
      setComments([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const [commentsRes, userRes] = await Promise.all([
      supabase
        .from("comments")
        .select("id, body, created_at, author_id")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.auth.getUser(),
    ]);
    setCurrentUserId(userRes.data.user?.id ?? null);
    setComments((commentsRes.data ?? []) as CommentRow[]);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (!projectId) {
    return (
      <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs text-fg-muted">
        <MessageSquare className="mb-2 h-4 w-4" />
        Zapisz projekt, żeby dodawać komentarze.
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || !projectId) return;
    setError(null);
    startTransition(async () => {
      const res = await addComment({ projectId, body: trimmed });
      if (!res.ok) {
        setError(res.message ?? "Nie udało się dodać komentarza.");
        return;
      }
      setBody("");
      fetchComments();
    });
  }

  function handleDelete(id: string) {
    if (!projectId) return;
    if (!window.confirm("Usunąć komentarz?")) return;
    startTransition(async () => {
      await deleteComment(id, projectId);
      fetchComments();
    });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notatka do siebie albo na potem..."
          rows={2}
          maxLength={2000}
          className={cn(
            "w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-fg placeholder:text-fg-muted",
            "outline-none focus:border-accent focus:ring-1 focus:ring-accent/20",
          )}
        />
        {error && <div className="text-xs text-status-error">{error}</div>}
        <button
          type="submit"
          disabled={busy || !body.trim()}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-chip bg-accent px-3 text-xs font-medium text-accent-foreground",
            "transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <Send className="h-3.5 w-3.5" />
          Dodaj
        </button>
      </form>

      {loading ? (
        <p className="text-xs italic text-fg-muted">Ładowanie...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs italic text-fg-muted">
          Brak komentarzy. Twoje notatki są prywatne — widzi je tylko właściciel projektu.
        </p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="flex items-baseline justify-between gap-2 text-[11px] text-fg-muted">
                <span className="font-medium">
                  {c.author_id === currentUserId ? "Ja" : "Współpracownik"}
                </span>
                <div className="flex items-center gap-2">
                  <span>{formatRelative(c.created_at)}</span>
                  {c.author_id === currentUserId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      aria-label="Usuń komentarz"
                      className="text-fg-muted hover:text-status-error transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-fg leading-snug">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return "przed chwilą";
  if (diffMin < 60) return `${diffMin} min temu`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} godz. temu`;
  return new Date(iso).toLocaleDateString("pl-PL");
}
