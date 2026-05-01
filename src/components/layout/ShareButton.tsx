"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/store/project";
import { createOrGetShareLink, revokeShareLink } from "@/lib/share/actions";

type DialogState =
  | { kind: "closed" }
  | { kind: "not-saved" }
  | { kind: "loading" }
  | { kind: "success"; url: string }
  | { kind: "error"; message: string };

export function ShareButton() {
  const projectId = useProject((s) => s.meta.id);
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isOpen = dialog.kind !== "closed";

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setDialog({ kind: "closed" });
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setDialog({ kind: "closed" });
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  async function handleOpen() {
    if (isOpen) {
      setDialog({ kind: "closed" });
      return;
    }
    if (!projectId) {
      setDialog({ kind: "not-saved" });
      return;
    }
    setDialog({ kind: "loading" });
    const result = await createOrGetShareLink(projectId);
    if (result.ok) {
      setDialog({ kind: "success", url: result.url });
    } else {
      setDialog({ kind: "error", message: result.message ?? result.error });
    }
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleRevoke() {
    if (!projectId) return;
    const confirmed = window.confirm(
      "Wyłączyć link? Adres przestanie działać.",
    );
    if (!confirmed) return;
    await revokeShareLink(projectId);
    setDialog({ kind: "closed" });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex h-9 items-center gap-2 rounded-chip bg-accent text-accent-foreground px-3 text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        {dialog.kind === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Udostępnij</span>
      </button>

      {isOpen && dialog.kind !== "loading" && (
        <div className="absolute right-0 top-full mt-2 w-[360px] rounded-panel border border-border bg-surface p-5 shadow-panel-lg">
          {dialog.kind === "not-saved" && (
            <>
              <p className="text-sm font-semibold text-fg">
                Projekt nie jest zapisany
              </p>
              <p className="mt-1 text-xs text-fg-muted">
                Zapisz projekt zanim go udostępnisz.
              </p>
              <button
                type="button"
                onClick={() => setDialog({ kind: "closed" })}
                className="mt-4 inline-flex h-8 items-center rounded-md bg-accent px-3 text-xs font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
              >
                OK
              </button>
            </>
          )}

          {dialog.kind === "error" && (
            <>
              <p className="text-sm font-semibold text-fg">
                Udostępnij projekt
              </p>
              <p className="mt-2 text-xs text-status-error">{dialog.message}</p>
              <button
                type="button"
                onClick={() => setDialog({ kind: "closed" })}
                className="mt-4 inline-flex h-8 items-center rounded-md bg-accent px-3 text-xs font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
              >
                OK
              </button>
            </>
          )}

          {dialog.kind === "success" && (
            <>
              <p className="text-sm font-semibold text-fg">
                Udostępnij projekt
              </p>
              <p className="mt-1 text-xs text-fg-muted">
                Każdy z linkiem zobaczy projekt w trybie podglądu.
              </p>
              <input
                readOnly
                value={dialog.url}
                onClick={(e) => e.currentTarget.select()}
                className={cn(
                  "mt-3 w-full rounded-md border border-border bg-surface-2",
                  "px-3 py-2 text-xs text-fg tabular-nums",
                  "focus:outline-none focus:ring-1 focus:ring-accent",
                )}
              />
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(dialog.url)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Skopiowano!
                    </>
                  ) : (
                    "Skopiuj"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRevoke}
                  className="inline-flex h-8 items-center px-3 text-xs font-medium text-status-error hover:underline transition-colors"
                >
                  Wyłącz link
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
