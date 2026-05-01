"use client";

import { Map, Home, MoveDiagonal, ShieldCheck, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "plot", label: "Działka", icon: Map },
  { id: "house", label: "Dom", icon: Home },
  { id: "place", label: "Ustawienie", icon: MoveDiagonal },
  { id: "analyze", label: "Analiza", icon: ShieldCheck },
  { id: "share", label: "Udostępnij", icon: Share2 },
] as const;

export function StepsPanel({ className }: { className?: string }) {
  const activeId = "plot";

  return (
    <aside
      className={cn(
        "w-60 flex-col rounded-panel border border-border bg-surface p-3 shadow-panel",
        className,
      )}
    >
      <div className="mb-2 px-2 pt-1 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Kroki pracy
      </div>
      <nav className="flex flex-col gap-1">
        {steps.map((s) => {
          const Icon = s.icon;
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-fg hover:bg-surface-2",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
