import { Save, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopBar() {
  return (
    <header className="relative z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <span className="text-sm font-semibold">P</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-fg">PlotPlanner</span>
          <span className="text-xs text-fg-muted">Mój nowy projekt</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-fg-muted sm:inline tabular">
          Zapisano
        </span>
        <button className="inline-flex h-9 items-center gap-2 rounded-chip border border-border bg-surface px-3 text-sm text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors">
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Zapisz</span>
        </button>
        <button className="inline-flex h-9 items-center gap-2 rounded-chip bg-accent text-accent-foreground px-3 text-sm font-medium hover:bg-accent-hover transition-colors">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Udostępnij</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
