"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject, selectPlotArea, type RoadEdge } from "@/lib/store/project";

const ROAD_EDGES: { value: RoadEdge; label: string }[] = [
  { value: "north", label: "Północ" },
  { value: "south", label: "Południe" },
  { value: "east", label: "Wschód" },
  { value: "west", label: "Zachód" },
];

const MIN_DIM = 5;
const MAX_DIM = 200;
const STEP = 0.5;

function clampDim(v: number) {
  const snapped = Math.round(v / STEP) * STEP;
  return Math.min(MAX_DIM, Math.max(MIN_DIM, snapped));
}

function formatPL(n: number) {
  return n.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function PropertiesPanel({ className }: { className?: string }) {
  const name = useProject((s) => s.meta.name);
  const width = useProject((s) => s.plot.widthM);
  const depth = useProject((s) => s.plot.depthM);
  const roadEdge = useProject((s) => s.plot.roadEdge);
  const northRotation = useProject((s) => s.plot.northRotationDeg);
  const area = useProject(selectPlotArea);

  const setProjectName = useProject((s) => s.setProjectName);
  const setPlotDimensions = useProject((s) => s.setPlotDimensions);
  const setRoadEdge = useProject((s) => s.setRoadEdge);
  const setNorthRotation = useProject((s) => s.setNorthRotation);

  const nameRef = useRef<HTMLInputElement>(null);

  function commitName() {
    const val = nameRef.current?.value.trim();
    if (val) setProjectName(val);
  }

  return (
    <aside
      className={cn(
        "w-72 flex-col rounded-panel border border-border bg-surface p-4 shadow-panel",
        className,
      )}
    >
      {/* Header */}
      <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        DZIAŁKA
      </div>
      <input
        ref={nameRef}
        defaultValue={name}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className={cn(
          "mt-1 w-full rounded-md bg-transparent text-base font-semibold text-fg",
          "border border-transparent px-0 py-0.5 outline-none",
          "hover:border-border focus:border-accent focus:px-2 transition-all",
        )}
      />

      {/* Section: Wymiary */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
          Wymiary
        </div>
        <div className="flex gap-3">
          <DimStepper
            label="Szerokość"
            value={width}
            onChange={(w) => setPlotDimensions(w, depth)}
          />
          <DimStepper
            label="Głębokość"
            value={depth}
            onChange={(d) => setPlotDimensions(width, d)}
          />
        </div>
        <div className="mt-3 text-right text-sm">
          <span className="text-fg-muted">Powierzchnia: </span>
          <span className="font-medium tabular-nums text-accent">
            {formatPL(area)} m²
          </span>
        </div>
      </div>

      {/* Section: Strona drogi */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
          Strona drogi
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {ROAD_EDGES.map((edge) => {
            const active = roadEdge === edge.value;
            return (
              <button
                key={edge.value}
                onClick={() => setRoadEdge(edge.value)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-fg-muted hover:bg-surface-2",
                )}
              >
                {edge.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section: Orientacja północy */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
          Orientacja północy
        </div>
        <input
          type="range"
          min={0}
          max={360}
          step={5}
          value={northRotation}
          onChange={(e) => setNorthRotation(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
        />
        <div className="mt-1 text-right text-sm font-medium tabular-nums text-fg">
          {northRotation}°
        </div>
      </div>

      {/* Footer hint */}
      <p className="mt-4 border-t border-border pt-3 text-xs italic text-fg-muted">
        Działka prostokątna. Polygon dostępny w Sprint 5.
      </p>
    </aside>
  );
}

function DimStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [raw, setRaw] = useState(String(value));

  function commit(v: number) {
    const clamped = clampDim(v);
    onChange(clamped);
    setRaw(formatPL(clamped));
  }

  function handleBlur() {
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) {
      commit(parsed);
    } else {
      setRaw(formatPL(value));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-1">
      <label className="text-xs text-fg-muted">{label}</label>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-surface-2">
        <input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm font-medium tabular-nums text-fg",
            "outline-none focus:ring-1 focus:ring-inset focus:ring-accent",
          )}
        />
        <div className="flex flex-col border-l border-border">
          <button
            onClick={() => commit(value + STEP)}
            className="flex h-5 w-6 items-center justify-center text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            aria-label={`Zwiększ ${label}`}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => commit(value - STEP)}
            className="flex h-5 w-6 items-center justify-center border-t border-border text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            aria-label={`Zmniejsz ${label}`}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
