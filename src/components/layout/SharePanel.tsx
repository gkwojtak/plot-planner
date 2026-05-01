"use client";

import Link from "next/link";
import { FileText, Share2 } from "lucide-react";
import { useProject } from "@/lib/store/project";
import { cn } from "@/lib/utils";
import { CommentsPanel } from "./CommentsPanel";

export function SharePanel() {
  const projectId = useProject((s) => s.meta.id);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          UDOSTĘPNIJ
        </div>
        <h2 className="mt-1 text-base font-semibold text-fg">Pokaż projekt</h2>
        <ul className="mt-3 space-y-2 text-sm text-fg">
          <li className="flex items-start gap-2">
            <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              <span className="font-medium">Udostępnij linkiem</span>
              <span className="block text-xs text-fg-muted">
                Użyj przycisku w górnym pasku — utworzy publiczny link tylko do podglądu.
              </span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              <span className="font-medium">Wyeksportuj PDF</span>
              <span className="block text-xs text-fg-muted">
                Otwórz raport i zapisz jako PDF z menu drukowania przeglądarki.
              </span>
              {projectId && (
                <Link
                  href={`/projects/${projectId}/report`}
                  target="_blank"
                  rel="noopener"
                  className={cn(
                    "mt-2 inline-flex h-8 items-center gap-1.5 rounded-chip border border-border bg-surface px-3 text-xs font-medium text-fg",
                    "transition-colors hover:bg-surface-2",
                  )}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Otwórz raport
                </Link>
              )}
            </span>
          </li>
        </ul>
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
          KOMENTARZE
        </div>
        <CommentsPanel />
      </div>
    </div>
  );
}
