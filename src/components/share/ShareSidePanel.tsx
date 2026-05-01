"use client";

import { cn } from "@/lib/utils";
import { useProject, selectPlotArea } from "@/lib/store/project";
import { findHouse } from "@/lib/catalog/houses";
import { AnalysisPanel } from "@/components/layout/AnalysisPanel";

export function ShareSidePanel({ className }: { className?: string }) {
  const name = useProject((s) => s.meta.name);
  const plot = useProject((s) => s.plot);
  const area = useProject(selectPlotArea);
  const houseId = useProject((s) => s.selectedHouseId);
  const house = findHouse(houseId);

  return (
    <aside
      className={cn(
        "w-80 flex-col gap-3 rounded-panel border border-border bg-surface p-4 shadow-panel overflow-y-auto",
        className,
      )}
    >
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          PROJEKT
        </div>
        <h2 className="mt-1 text-base font-semibold text-fg">{name}</h2>
      </div>

      <Section title="Działka">
        <Row label="Typ" value={plot.kind === "rectangle" ? "Prostokąt" : "Wielokąt"} />
        {plot.kind === "rectangle" && (
          <>
            <Row label="Szerokość" value={`${formatPL(plot.widthM)} m`} />
            <Row label="Głębokość" value={`${formatPL(plot.depthM)} m`} />
          </>
        )}
        <Row label="Powierzchnia" value={`${formatPL(area)} m²`} accent />
        <Row label="Strona drogi" value={ROAD_LABELS[plot.roadEdge]} />
      </Section>

      {house && (
        <Section title="Dom">
          <Row label="Projekt" value={house.name} />
          <Row label="Wymiary" value={`${formatPL(house.widthM)} × ${formatPL(house.depthM)} m`} />
          <Row label="Wysokość" value={`${formatPL(house.heightM)} m`} />
          <Row label="Piętra" value={house.floors === 1 ? "Parterowy" : "Piętrowy"} />
        </Section>
      )}

      <div className="rounded-lg border border-border bg-surface-2 p-3">
        <AnalysisPanel />
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        {title}
      </div>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-fg-muted">{label}</dt>
      <dd className={cn("font-medium tabular-nums", accent ? "text-accent" : "text-fg")}>
        {value}
      </dd>
    </div>
  );
}

const ROAD_LABELS = {
  north: "Północ",
  south: "Południe",
  east: "Wschód",
  west: "Zachód",
} as const;

function formatPL(n: number) {
  return n.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
