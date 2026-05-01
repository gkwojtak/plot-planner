import { notFound } from "next/navigation";
import { ShareViewer } from "@/components/share/ShareViewer";
import { loadSharedProject } from "@/lib/share/queries";

export const metadata = {
  title: "PlotPlanner — udostępniony projekt",
};

export default async function SharedProjectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = await loadSharedProject(token);
  if (!project) notFound();

  return <ShareViewer project={project} />;
}
