"use client";

import { cn } from "@/lib/utils";
import { useProject } from "@/lib/store/project";
import { PlotEditor } from "./PlotEditor";
import { HouseCatalog } from "./HouseCatalog";

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
      {step === "place" && <Placeholder title="USTAWIENIE" hint="Drag & rotate domu pojawi się w Sprint 3." />}
      {step === "analyze" && <Placeholder title="ANALIZA" hint="Reguły 3 m / 4 m i strefy zakazane — Sprint 4." />}
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
