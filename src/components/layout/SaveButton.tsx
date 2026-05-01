"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check, AlertCircle } from "lucide-react";
import { saveProject } from "@/lib/projects/actions";
import { useProject } from "@/lib/store/project";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

export function SaveButton({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [, startTransition] = useTransition();

  async function handleSave() {
    if (!isAuthenticated) {
      router.push("/auth/login?next=/");
      return;
    }
    setStatus({ kind: "saving" });

    const state = useProject.getState();
    const result = await saveProject({
      id: state.meta.id,
      name: state.meta.name,
      plot: state.plot,
      selectedHouseId: state.selectedHouseId,
      placement: {
        x: state.placement.position.x,
        y: state.placement.position.y,
        rotationDeg: state.placement.rotationDeg,
      },
    });

    if (result.ok) {
      const wasNew = state.meta.id === null;
      useProject.setState((s) => ({ meta: { ...s.meta, id: result.id } }));
      setStatus({ kind: "saved" });
      if (wasNew) {
        // First save — give the URL the project id so refresh keeps the work.
        startTransition(() => router.replace(`/projects/${result.id}`));
      } else {
        startTransition(() => router.refresh());
      }
      setTimeout(() => setStatus({ kind: "idle" }), 1800);
    } else {
      setStatus({
        kind: "error",
        message: result.message ?? "Nie udało się zapisać.",
      });
      setTimeout(() => setStatus({ kind: "idle" }), 3000);
    }
  }

  const Icon = (() => {
    switch (status.kind) {
      case "saving":
        return Loader2;
      case "saved":
        return Check;
      case "error":
        return AlertCircle;
      default:
        return Save;
    }
  })();

  const label = (() => {
    switch (status.kind) {
      case "saving":
        return "Zapisywanie…";
      case "saved":
        return "Zapisano";
      case "error":
        return "Błąd";
      default:
        return "Zapisz";
    }
  })();

  return (
    <button
      onClick={handleSave}
      disabled={status.kind === "saving"}
      title={status.kind === "error" ? status.message : label}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-chip border px-3 text-sm transition-colors",
        status.kind === "saved" &&
          "border-status-pass/40 bg-status-pass/10 text-status-pass",
        status.kind === "error" &&
          "border-status-error/40 bg-status-error/10 text-status-error",
        status.kind === "idle" &&
          "border-border bg-surface text-fg-muted hover:text-fg hover:bg-surface-2",
        status.kind === "saving" &&
          "border-border bg-surface text-fg-muted opacity-80",
      )}
    >
      <Icon
        className={cn("h-4 w-4", status.kind === "saving" && "animate-spin")}
      />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
