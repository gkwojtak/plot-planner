"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// R3F + WebGL only on the client.
const SceneCanvas = dynamic(
  () => import("./SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false, loading: () => <SceneFallback /> },
);

export function Scene() {
  return (
    <div className="absolute inset-0">
      <Suspense fallback={<SceneFallback />}>
        <SceneCanvas />
      </Suspense>
    </div>
  );
}

function SceneFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg">
      <div className="text-sm text-fg-muted">Ładowanie sceny 3D…</div>
    </div>
  );
}
