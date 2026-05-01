import { notFound, redirect } from "next/navigation";
import { Workspace } from "@/components/workspace/Workspace";
import { ProjectHydrator } from "@/components/workspace/ProjectHydrator";
import { loadProject } from "@/lib/projects/queries";
import { getCurrentUser } from "@/lib/auth/getUser";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?next=/projects/${id}`);
  }

  const project = await loadProject(id);
  if (!project) notFound();

  return (
    <>
      <ProjectHydrator project={project} />
      <Workspace />
    </>
  );
}
