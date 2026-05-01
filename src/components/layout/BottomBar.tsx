"use client";

import { RotateCcw, RotateCw, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/store/project";

const variants = [
  { id: "A", label: "Wariant A", active: true },
  { id: "B", label: "Wariant B", active: false },
  { id: "C", label: "Wariant C", active: false },
];

const ROTATE_STEP = 15;

export function BottomBar() {
  const placement = useProject((s) => s.placement);
  const setPlacement = useProject((s) => s.setPlacement);
  const step = useProject((s) => s.step);
  const isPlacing = step === "place";

  function rotate(deltaDeg: number) {
    const next = (((placement.rotationDeg + deltaDeg) % 360) + 360) % 360;
    setPlacement({ rotationDeg: next });
  }

  return (
    <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-chip border border-border bg-surface px-2 py-2 shadow-panel">
        <div className="flex items-center gap-1 pr-2">
          {variants.map((v) => (
            <button
              key={v.id}
              className={
                v.active
                  ? "rounded-chip bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
                  : "rounded-chip px-3 py-1.5 text-xs font-medium text-fg-muted hover:text-fg hover:bg-surface-2"
              }
            >
              {v.id}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        <ToolButton
          icon={<RotateCcw className="h-4 w-4" />}
          label={`Obróć -${ROTATE_STEP}°`}
          onClick={() => rotate(-ROTATE_STEP)}
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
          label={`Obróć +${ROTATE_STEP}°`}
          onClick={() => rotate(ROTATE_STEP)}
          disabled={!isPlacing}
        />

        <div className="h-6 w-px bg-border" />

        <ToolButton icon={<ZoomIn className="h-4 w-4" />} label="Powiększ" />
        <ToolButton icon={<ZoomOut className="h-4 w-4" />} label="Pomniejsz" />

        <div className="h-6 w-px bg-border" />

        <ToolButton icon={<Undo2 className="h-4 w-4" />} label="Cofnij" />
      </div>
    </div>
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
