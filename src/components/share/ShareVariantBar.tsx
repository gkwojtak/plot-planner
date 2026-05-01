"use client";

import { cn } from "@/lib/utils";
import {
  useProject,
  SCENARIO_LETTERS,
  type ScenarioLetter,
} from "@/lib/store/project";

export function ShareVariantBar() {
  const currentScenario = useProject((s) => s.currentScenario);
  const switchScenario = useProject((s) => s.switchScenario);

  return (
    <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-chip border border-border bg-surface px-2 py-2 shadow-panel">
        <span className="px-2 text-xs text-fg-muted">Wariant</span>
        {SCENARIO_LETTERS.map((letter) => (
          <Btn
            key={letter}
            letter={letter}
            active={currentScenario === letter}
            onClick={() => switchScenario(letter)}
          />
        ))}
      </div>
    </div>
  );
}

function Btn({
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
