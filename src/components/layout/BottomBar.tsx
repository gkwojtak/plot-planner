import { Compass, RotateCw, Undo2, ZoomIn, ZoomOut } from "lucide-react";

const variants = [
  { id: "A", label: "Wariant A", active: true },
  { id: "B", label: "Wariant B", active: false },
  { id: "C", label: "Wariant C", active: false },
];

export function BottomBar() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-chip border border-border bg-surface px-2 py-2 shadow-panel">
        {/* Variants */}
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

        <ToolButton icon={<Compass className="h-4 w-4" />} label="Obrót" />
        <ToolButton icon={<RotateCw className="h-4 w-4" />} label="Resetuj" />
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
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-chip text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
    >
      {icon}
    </button>
  );
}
