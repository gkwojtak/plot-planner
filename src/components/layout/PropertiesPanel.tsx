"use client";

import { cn } from "@/lib/utils";
import { useProject } from "@/lib/store/project";
import { PlotEditor } from "./PlotEditor";
import { HouseCatalog } from "./HouseCatalog";
import { AnalysisPanel } from "./AnalysisPanel";

export function PropertiesPanel({ className }: { className?: string }) {
  const step = useProject((s) => s.step);

  return (
    <aside
      className={cn(
        "w-72 flex-col rounded-panel border border-border bg-surface p-4 shadow-panel overflow-y-auto",
        className,
      )}
    >
      {step === "plot" && <PlotEditor />}
      {step === "house" && <HouseCatalog />}
      {step === "place" && <PlacementHint />}
      {step === "analyze" && <AnalysisPanel />}
      {step === "share" && <Placeholder title="UDOSTĘPNIJ" hint="Publiczny link, komentarze, PDF — Sprint 6." />}
    </aside>
  );
}

function Placeholder({ title, hint }: { title: string; hint: string }) {
  return (
    <>
      <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        {title}
      </div>
      <p className="mt-3 text-sm text-fg-muted">{hint}</p>
    </>
  );
}

function PlacementHint() {
  return (
    <>
      <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        USTAWIENIE
      </div>
      <h2 className="mt-1 text-base font-semibold text-fg">Przeciągnij dom</h2>
      <ul className="mt-4 space-y-3 text-sm text-fg">
        <li className="flex gap-2">
          <span className="text-accent">•</span>
          <span>Chwyć dom kursorem i przesuń go po działce.</span>
        </li>
        <li className="flex gap-2">
          <span className="text-accent">•</span>
          <span>
            Użyj przycisków obrotu w dolnym pasku, żeby ustawić bryłę co 15°.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-accent">•</span>
          <span>Dom nie wyjdzie poza granice działki.</span>
        </li>
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-xs italic text-fg-muted">
        Snap do 5°, undo, warianty A/B/C — kolejne podejście.
      </p>
    </>
  );
}
