import { notFound, redirect } from "next/navigation";
import { loadProject } from "@/lib/projects/queries";
import { getCurrentUser } from "@/lib/auth/getUser";
import { findHouse } from "@/lib/catalog/houses";
import { analyzePlacement } from "@/lib/analysis/rules";
import { PlotSchematic } from "@/components/report/PlotSchematic";
import { PrintButton } from "@/components/report/PrintButton";

export const metadata = {
  title: "Raport — PlotPlanner",
};

export default async function ProjectReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=/projects/${id}/report`);

  const project = await loadProject(id);
  if (!project) notFound();

  const house = findHouse(project.selectedHouseSlug);
  const plotForAnalysis = {
    kind: project.plot.kind,
    widthM: project.plot.widthM,
    depthM: project.plot.depthM,
    points:
      project.plot.points.length > 0
        ? project.plot.points
        : rectanglePoints(project.plot.widthM, project.plot.depthM),
    roadEdge: project.plot.roadEdge,
    northRotationDeg: project.plot.northRotationDeg,
  };

  const placementA = project.scenarios.A;
  const analysis = analyzePlacement(plotForAnalysis, house, placementA);

  const area =
    plotForAnalysis.kind === "rectangle"
      ? plotForAnalysis.widthM * plotForAnalysis.depthM
      : shoelaceArea(plotForAnalysis.points);

  return (
    <div className="report-page mx-auto max-w-3xl bg-white px-10 py-12 text-fg print:py-0 print:px-6">
      <PrintBar />

      {/* Cover */}
      <header className="mb-10 border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <span className="text-sm font-semibold">P</span>
            </div>
            <div>
              <div className="text-base font-semibold">PlotPlanner</div>
              <div className="text-xs text-fg-muted">
                Raport poglądowy
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-fg-muted">
            {new Date().toLocaleDateString("pl-PL", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{project.name}</h1>
      </header>

      {/* Schematic */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-fg-muted">
          Rzut
        </h2>
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <PlotSchematic
            plot={plotForAnalysis}
            house={house}
            placement={placementA}
          />
        </div>
      </section>

      {/* Parameters */}
      <section className="mb-8 grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-fg-muted">
            Działka
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Typ" value={plotForAnalysis.kind === "rectangle" ? "Prostokąt" : "Wielokąt"} />
            {plotForAnalysis.kind === "rectangle" && (
              <>
                <Row label="Szerokość" value={`${formatPL(plotForAnalysis.widthM)} m`} />
                <Row label="Głębokość" value={`${formatPL(plotForAnalysis.depthM)} m`} />
              </>
            )}
            <Row label="Powierzchnia" value={`${formatPL(area)} m²`} />
            <Row label="Strona drogi" value={ROAD_LABELS[plotForAnalysis.roadEdge]} />
          </dl>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-fg-muted">
            Dom
          </h2>
          {house ? (
            <dl className="space-y-2 text-sm">
              <Row label="Projekt" value={house.name} />
              <Row label="Wymiary" value={`${formatPL(house.widthM)} × ${formatPL(house.depthM)} m`} />
              <Row label="Wysokość" value={`${formatPL(house.heightM)} m`} />
              <Row label="Piętra" value={house.floors === 1 ? "Parterowy" : "Piętrowy"} />
              <Row label="Pozycja" value={`x ${formatPL(placementA.position.x)}, y ${formatPL(placementA.position.y)} m`} />
              <Row label="Obrót" value={`${Math.round(placementA.rotationDeg)}°`} />
            </dl>
          ) : (
            <p className="text-sm text-fg-muted italic">Nie wybrano projektu domu.</p>
          )}
        </div>
      </section>

      {/* Analysis */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-fg-muted">
          Wyniki analizy
        </h2>
        <ul className="space-y-2 text-sm">
          {analysis.results.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="font-medium">
                {STATUS_PREFIX[r.status]} {r.title}
              </div>
              <div className="mt-1 text-xs text-fg-muted">{r.message}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Disclaimer */}
      <footer className="mt-12 border-t border-border pt-6 text-xs text-fg-muted leading-relaxed">
        Raport ma charakter poglądowy i opiera się na danych wprowadzonych w aplikacji.
        Nie stanowi formalnej dokumentacji projektowej ani potwierdzenia zgodności z
        MPZP, WZ lub przepisami prawa budowlanego.
      </footer>
    </div>
  );
}

function PrintBar() {
  return (
    <div className="mb-8 flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3 print:hidden">
      <div className="text-xs text-fg-muted">
        Użyj menu drukowania przeglądarki (<kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium">Ctrl/Cmd + P</kbd>)
        i wybierz <span className="font-medium">Zapisz jako PDF</span>.
      </div>
      <PrintButton />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-1.5">
      <dt className="text-fg-muted text-xs uppercase tracking-wide">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function rectanglePoints(w: number, d: number) {
  return [
    { x: -w / 2, y: -d / 2 },
    { x: w / 2, y: -d / 2 },
    { x: w / 2, y: d / 2 },
    { x: -w / 2, y: d / 2 },
  ];
}

function shoelaceArea(pts: { x: number; y: number }[]) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(a) / 2;
}

function formatPL(n: number) {
  return n.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

const ROAD_LABELS = {
  north: "Północ",
  south: "Południe",
  east: "Wschód",
  west: "Zachód",
} as const;

const STATUS_PREFIX = {
  passed: "✓",
  warning: "!",
  failed: "✗",
  missing_data: "?",
} as const;
