"use client";

import { RotateCcw, RotateCw, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProject,
  SCENARIO_LETTERS,
  type ScenarioLetter,
  type SnapStep,
} from "@/lib/store/project";

const SNAP_STEPS: SnapStep[] = [5, 15];

export function BottomBar() {
  const placement = useProject((s) => s.placement);
  const setPlacement = useProject((s) => s.setPlacement);
  const step = useProject((s) => s.step);
  const currentScenario = useProject((s) => s.currentScenario);
  const switchScenario = useProject((s) => s.switchScenario);
  const snapStep = useProject((s) => s.snapStep);
  const setSnapStep = useProject((s) => s.setSnapStep);
  const isPlacing = step === "place";

  function rotate(delta: number) {
    const next = (((placement.rotationDeg + delta) % 360) + 360) % 360;
    // Snap to current step for clean rotations regardless of starting angle
    const snapped = Math.round(next / snapStep) * snapStep;
    setPlacement({ rotationDeg: snapped % 360 });
  }

  return (
    <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-chip border border-border bg-surface px-2 py-2 shadow-panel">
        <div className="flex items-center gap-1 pr-2">
          {SCENARIO_LETTERS.map((letter) => (
            <ScenarioButton
              key={letter}
              letter={letter}
              active={currentScenario === letter}
              onClick={() => switchScenario(letter)}
            />
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        <ToolButton
          icon={<RotateCcw className="h-4 w-4" />}
          label={`Obróć -${snapStep}°`}
          onClick={() => rotate(-snapStep)}
          disabled={!isPlacing}
        />
        <span
          className={cn(
            "min-w-[2.5rem] text-center text-xs tabular-nums",
            isPlacing ? "text-fg" : "text-fg-muted",
          )}
        >
          {Math.round(placement.rotationDeg)}°
        </span>
        <ToolButton
          icon={<RotateCw className="h-4 w-4" />}
          label={`Obróć +${snapStep}°`}
          onClick={() => rotate(snapStep)}
          disabled={!isPlacing}
        />

        <div className="ml-1 flex items-center rounded-chip border border-border p-0.5">
          {SNAP_STEPS.map((s) => (
            <button
              key={s}
              onClick={() => setSnapStep(s)}
              title={`Snap do ${s}°`}
              className={cn(
                "rounded-chip px-2 py-0.5 text-[11px] font-medium transition-colors tabular-nums",
                snapStep === s
                  ? "bg-accent/15 text-accent"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {s}°
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        <ToolButton icon={<ZoomIn className="h-4 w-4" />} label="Powiększ" />
        <ToolButton icon={<ZoomOut className="h-4 w-4" />} label="Pomniejsz" />

        <div className="h-6 w-px bg-border" />

        <ToolButton icon={<Undo2 className="h-4 w-4" />} label="Cofnij" />
      </div>
    </div>
  );
}

function ScenarioButton({
  letter,
  active,
  onClick,
}: {
  letter: ScenarioLetter;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={`Wariant ${letter}`}
      className={cn(
        "rounded-chip px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-fg-muted hover:text-fg hover:bg-surface-2",
      )}
    >
      {letter}
    </button>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-chip transition-colors",
        disabled
          ? "text-fg-muted/50 cursor-not-allowed"
          : "text-fg-muted hover:text-fg hover:bg-surface-2",
      )}
    >
      {icon}
    </button>
  );
}
