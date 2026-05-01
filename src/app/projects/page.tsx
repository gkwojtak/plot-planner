import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

export const metadata = {
  title: "Moje projekty — PlotPlanner",
};

type ProjectRow = {
  id: string;
  name: string;
  updated_at: string;
  plots: { area_m2: number | null; width_m: number | null; depth_m: number | null }[];
};

export default async function ProjectsListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/projects");

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, updated_at, plots(area_m2, width_m, depth_m)")
    .order("updated_at", { ascending: false })
    .returns<ProjectRow[]>();

  const list = projects ?? [];

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"
            >
              <span className="text-sm font-semibold">P</span>
            </Link>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-fg">Moje projekty</div>
              <div className="text-xs text-fg-muted">{user.email}</div>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-2 rounded-chip bg-accent px-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nowy projekt
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectRow }) {
  const plot = project.plots?.[0];
  const dim =
    plot?.width_m && plot?.depth_m
      ? `${formatPL(Number(plot.width_m))} × ${formatPL(Number(plot.depth_m))} m`
      : null;
  const area = plot?.area_m2
    ? `${Math.round(Number(plot.area_m2))} m²`
    : null;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col gap-2 rounded-panel border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-fg">{project.name}</h2>
        <ArrowRight className="h-4 w-4 shrink-0 text-fg-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted tabular">
        {dim && <span>{dim}</span>}
        {area && <span>•</span>}
        {area && <span className="text-accent font-medium">{area}</span>}
      </div>

      <div className="mt-1 text-[11px] text-fg-muted">
        Edytowane {formatRelative(project.updated_at)}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-panel border border-border bg-surface p-12 text-center">
      <h2 className="text-lg font-semibold text-fg">Brak projektów</h2>
      <p className="mt-2 text-sm text-fg-muted">
        Stwórz pierwszy projekt — narysuj działkę i zobacz, jak mieści się dom.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-chip bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
      >
        <Plus className="h-4 w-4" />
        Nowy projekt
      </Link>
    </div>
  );
}

function formatPL(n: number) {
  return n.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return "przed chwilą";
  if (diffMin < 60) return `${diffMin} min temu`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} godz. temu`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `${diffD} dni temu`;
  return new Date(iso).toLocaleDateString("pl-PL");
}
