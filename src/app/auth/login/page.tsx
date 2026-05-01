import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Zaloguj — PlotPlanner",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md rounded-panel border border-border bg-surface p-8 shadow-panel">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <span className="text-sm font-semibold">P</span>
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold text-fg">PlotPlanner</div>
            <div className="text-xs text-fg-muted">Zaloguj się magic linkiem</div>
          </div>
        </div>

        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
