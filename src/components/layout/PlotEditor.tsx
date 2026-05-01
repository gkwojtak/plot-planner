"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProject,
  selectPlotArea,
  type RoadEdge,
  type Vec2,
} from "@/lib/store/project";

const ROAD_EDGES: { value: RoadEdge; label: string }[] = [
  { value: "north", label: "Północ" },
  { value: "south", label: "Południe" },
  { value: "east", label: "Wschód" },
  { value: "west", label: "Zachód" },
];

const MIN_DIM = 5;
const MAX_DIM = 200;
const STEP = 0.5;

const MIN_COORD = -200;
const MAX_COORD = 200;

function clampDim(v: number) {
  const snapped = Math.round(v / STEP) * STEP;
  return Math.min(MAX_DIM, Math.max(MIN_DIM, snapped));
}

function clampCoord(v: number) {
  const snapped = Math.round(v / STEP) * STEP;
  return Math.min(MAX_COORD, Math.max(MIN_COORD, snapped));
}

function formatPL(n: number) {
  return n.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function PlotEditor() {
  const name = useProject((s) => s.meta.name);
  const width = useProject((s) => s.plot.widthM);
  const depth = useProject((s) => s.plot.depthM);
  const roadEdge = useProject((s) => s.plot.roadEdge);
  const northRotation = useProject((s) => s.plot.northRotationDeg);
  const area = useProject(selectPlotArea);
  const plotKind = useProject((s) => s.plot.kind);
  const plotPoints = useProject((s) => s.plot.points);

  const setProjectName = useProject((s) => s.setProjectName);
  const setPlotDimensions = useProject((s) => s.setPlotDimensions);
  const setRoadEdge = useProject((s) => s.setRoadEdge);
  const setNorthRotation = useProject((s) => s.setNorthRotation);
  const setPlotKind = useProject((s) => s.setPlotKind);
  const movePlotPoint = useProject((s) => s.movePlotPoint);
  const addPlotPoint = useProject((s) => s.addPlotPoint);
  const removePlotPoint = useProject((s) => s.removePlotPoint);

  const nameRef = useRef<HTMLInputElement>(null);

  function commitName() {
    const val = nameRef.current?.value.trim();
    if (val) setProjectName(val);
  }

  return (
    <>
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

      {/* Typ działki toggle */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
          TYP DZIAŁKI
        </div>
        <div className="flex rounded-lg border border-border bg-surface-2 p-1 gap-1">
          <button
            onClick={() => setPlotKind("rectangle")}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              plotKind === "rectangle"
                ? "bg-accent/10 text-accent"
                : "text-fg-muted hover:bg-surface-2",
            )}
          >
            Prostokąt
          </button>
          <button
            onClick={() => setPlotKind("polygon")}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              plotKind === "polygon"
                ? "bg-accent/10 text-accent"
                : "text-fg-muted hover:bg-surface-2",
            )}
          >
            Wielokąt
          </button>
        </div>
      </div>

      {plotKind === "rectangle" ? (
        <>
          {/* Wymiary — rectangle only */}
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

          {/* Strona drogi */}
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

          {/* Orientacja północy */}
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

          <p className="mt-4 border-t border-border pt-3 text-xs italic text-fg-muted">
            Zmień typ na &apos;Wielokąt&apos; żeby narysować nieregularną działkę.
          </p>
        </>
      ) : (
        <>
          {/* Punkty granicy — polygon only */}
          <div className="mt-4 border-t border-border pt-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
              PUNKTY GRANICY
            </div>
            <div className="flex flex-col gap-2">
              {plotPoints.map((pt, i) => (
                <PointRow
                  key={i}
                  index={i}
                  point={pt}
                  canRemove={plotPoints.length > 3}
                  onMove={(updated) => movePlotPoint(i, updated)}
                  onRemove={() => removePlotPoint(i)}
                />
              ))}
            </div>
            <button
              onClick={addPlotPoint}
              className={cn(
                "mt-3 w-full inline-flex items-center justify-center gap-2",
                "rounded-lg border border-dashed border-border",
                "px-3 py-2 text-sm text-fg-muted",
                "hover:text-fg hover:bg-surface-2 transition-colors",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Dodaj punkt
            </button>
            <div className="mt-3 text-right text-sm">
              <span className="text-fg-muted">Powierzchnia: </span>
              <span className="font-medium tabular-nums text-accent">
                {formatPL(area)} m²
              </span>
            </div>
            <p className="mt-2 text-xs italic text-fg-muted">
              Przeciągnij wartości X/Y żeby przesunąć punkt. Minimum 3, kolejność zgodna z ruchem wskazówek.
            </p>
          </div>

          {/* Strona drogi */}
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

          {/* Orientacja północy */}
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
        </>
      )}
    </>
  );
}

// ─── PointRow ────────────────────────────────────────────────────────────────

function PointRow({
  index,
  point,
  canRemove,
  onMove,
  onRemove,
}: {
  index: number;
  point: Vec2;
  canRemove: boolean;
  onMove: (p: Vec2) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Number badge */}
      <span className="shrink-0 rounded-chip bg-surface-2 px-2 py-0.5 text-[11px] font-medium tabular-nums text-fg-muted border border-border">
        {index + 1}
      </span>

      {/* X input */}
      <CoordInput
        value={point.x}
        aria-label={`Punkt ${index + 1} X`}
        onChange={(x) => onMove({ x, y: point.y })}
      />

      <span className="text-xs text-fg-muted select-none">×</span>

      {/* Y input */}
      <CoordInput
        value={point.y}
        aria-label={`Punkt ${index + 1} Y`}
        onChange={(y) => onMove({ x: point.x, y })}
      />

      <span className="shrink-0 text-[11px] text-fg-muted">m</span>

      {/* Remove button */}
      <button
        onClick={onRemove}
        disabled={!canRemove}
        title={canRemove ? `Usuń punkt ${index + 1}` : "Minimum 3 punkty"}
        className={cn(
          "ml-auto shrink-0 flex items-center justify-center rounded-md p-1 transition-colors",
          canRemove
            ? "text-fg-muted hover:text-fg hover:bg-surface-2"
            : "text-fg-muted/30 cursor-not-allowed",
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── CoordInput ──────────────────────────────────────────────────────────────

function CoordInput({
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  "aria-label"?: string;
}) {
  const [raw, setRaw] = useState(formatPL(value));

  // Sync if external value changes while not focused
  // (we rely on the parent re-mounting with new key if needed; this covers
  //  the simple case where the store value is updated from outside)
  function handleFocus() {
    setRaw(formatPL(value));
  }

  function handleBlur() {
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) {
      const clamped = clampCoord(parsed);
      onChange(clamped);
      setRaw(formatPL(clamped));
    } else {
      setRaw(formatPL(value));
    }
  }

  return (
    <input
      value={raw}
      aria-label={ariaLabel}
      onChange={(e) => setRaw(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={cn(
        "w-[5ch] min-w-0 rounded-md border border-border bg-surface-2",
        "px-2 py-1 text-sm tabular-nums text-fg outline-none",
        "focus:ring-1 focus:ring-inset focus:ring-accent",
      )}
    />
  );
}

// ─── DimStepper ──────────────────────────────────────────────────────────────

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
