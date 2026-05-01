import { cn } from "@/lib/utils";

export function PropertiesPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "w-72 flex-col rounded-panel border border-border bg-surface p-4 shadow-panel",
        className,
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        Działka
      </div>
      <h2 className="mt-1 text-base font-semibold text-fg">Działka demo</h2>

      <dl className="mt-4 space-y-3 text-sm">
        <Row label="Szerokość" value="20,0 m" />
        <Row label="Głębokość" value="35,0 m" />
        <Row label="Powierzchnia" value="700 m²" />
        <Row label="Strona drogi" value="południe" />
      </dl>

      <div className="mt-6 rounded-lg border border-border bg-surface-2 p-3 text-xs text-fg-muted">
        Sprint 1: scena demo. Edycja działki dostępna w Sprint 2.
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="font-medium text-fg tabular">{value}</dd>
    </div>
  );
}
