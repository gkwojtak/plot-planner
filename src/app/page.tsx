import { Workspace } from "@/components/workspace/Workspace";
import { NewProjectReset } from "@/components/workspace/NewProjectReset";

export default function Home() {
  return (
    <>
      <NewProjectReset />
      <Workspace />
    </>
  );
}
