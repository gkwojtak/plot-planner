"use client";

import { cn } from "@/lib/utils";
import { HOUSE_CATALOG, type HouseDesign } from "@/lib/catalog/houses";
import { useProject } from "@/lib/store/project";

function formatPL(n: number, decimals = 1): string {
  return n.toLocaleString("pl-PL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function floorsLabel(floors: 1 | 2): string {
  return floors === 1 ? "1 piętro" : "2 piętra";
}

function approxArea(house: HouseDesign): number {
  return Math.round(house.floors * house.widthM * house.depthM);
}

export function HouseCatalog() {
  const selectedHouseId = useProject((s) => s.selectedHouseId);
  const selectHouse = useProject((s) => s.selectHouse);

  return (
    <>
      <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        DOM
      </div>
      <h2 className="mt-1 text-base font-semibold text-fg">Wybierz projekt</h2>

      <div className="mt-4 flex flex-col gap-2">
        {HOUSE_CATALOG.map((house) => {
          const selected = selectedHouseId === house.id;
          return (
            <button
              key={house.id}
              onClick={() => selectHouse(house.id)}
              className={cn(
                "w-full rounded-lg border p-3 text-left cursor-pointer transition-colors",
                selected
                  ? "border-accent ring-1 ring-accent/40 bg-accent/5"
                  : "bg-surface-2 border-border hover:border-border hover:bg-surface",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fg">{house.name}</span>
                <span className="shrink-0 rounded-chip bg-surface px-2 py-0.5 text-[11px] tabular-nums text-fg-muted">
                  {house.widthM}×{house.depthM} m
                </span>
              </div>

              <p className="mt-1 text-xs leading-snug text-fg-muted">{house.blurb}</p>

              <p className="mt-1.5 text-[11px] text-fg-muted">
                {floorsLabel(house.floors)}
                {" • "}
                wys. {formatPL(house.heightM)} m
                {" • "}
                ok. {approxArea(house)} m²
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs italic text-fg-muted">
        Modele glTF i własna podłoga — wkrótce.
      </p>
    </>
  );
}
