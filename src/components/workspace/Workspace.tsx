import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/layout/TopBar";
import { StepsPanel } from "@/components/layout/StepsPanel";
import { PropertiesPanel } from "@/components/layout/PropertiesPanel";
import { BottomBar } from "@/components/layout/BottomBar";

export function Workspace() {
  return (
    <div className="relative flex h-dvh w-dvw flex-col overflow-hidden bg-bg">
      <TopBar />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Scene takes the full main area; panels float on top */}
        <Scene />

        {/* Left: workflow steps */}
        <StepsPanel className="absolute left-4 top-4 bottom-24 z-10 hidden md:flex" />

        {/* Right: properties of selected element */}
        <PropertiesPanel className="absolute right-4 top-4 bottom-24 z-10 hidden md:flex" />
      </div>

      <BottomBar />
    </div>
  );
}
