"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useProject } from "@/lib/store/project";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function ShareTopBar() {
  const name = useProject((s) => s.meta.name);

  return (
    <header className="relative z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"
        >
          <span className="text-sm font-semibold">P</span>
        </Link>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-fg">{name}</span>
          <span className="text-xs text-fg-muted">PlotPlanner — udostępniony projekt</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-chip border border-border bg-surface-2 px-3 py-1 text-xs text-fg-muted">
          <Eye className="h-3.5 w-3.5" />
          Tylko podgląd
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
