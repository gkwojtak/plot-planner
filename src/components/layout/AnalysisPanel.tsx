"use client";

import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/store/project";
import { findHouse } from "@/lib/catalog/houses";
import {
  analyzePlacement,
  type RuleResult,
  type RuleStatus,
} from "@/lib/analysis/rules";

const STATUS_LABELS: Record<RuleStatus, string> = {
  passed: "Wszystko gra",
  warning: "Sprawdź dokładnie",
  failed: "Coś nie pasuje",
  missing_data: "Brakuje danych",
};

export function AnalysisPanel() {
  const plot = useProject((s) => s.plot);
  const placement = useProject((s) => s.placement);
  const selectedHouseId = useProject((s) => s.selectedHouseId);
  const house = findHouse(selectedHouseId);

  const summary = analyzePlacement(plot, house, placement);

  return (
    <>
      <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        ANALIZA
      </div>
      <div className="mt-1 flex items-center gap-2">
        <h2 className="text-base font-semibold text-fg">
          {STATUS_LABELS[summary.overall]}
        </h2>
        <StatusDot status={summary.overall} />
      </div>

      <ul className="mt-4 space-y-3">
        {summary.results.map((r) => (
          <RuleRow key={r.id} result={r} />
        ))}
      </ul>

      <p className="mt-4 border-t border-border pt-3 text-xs italic text-fg-muted">
        Analiza poglądowa. Nie zastępuje WT, MPZP ani projektu wykonawczego.
      </p>
    </>
  );
}

function RuleRow({ result }: { result: RuleResult }) {
  const Icon = iconFor(result.status);
  return (
    <li className={cn("rounded-lg border p-3", borderFor(result.status))}>
      <div className="flex items-start gap-2">
        <Icon
          className={cn("mt-0.5 h-4 w-4 shrink-0", colorFor(result.status))}
        />
        <div className="min-w-0">
          <div className="text-sm font-medium text-fg">{result.title}</div>
          <div className="mt-0.5 text-xs text-fg-muted leading-snug">
            {result.message}
          </div>
        </div>
      </div>
    </li>
  );
}

function StatusDot({ status }: { status: RuleStatus }) {
  return (
    <span
      className={cn("h-2.5 w-2.5 rounded-full", bgFor(status))}
      aria-hidden
    />
  );
}

function iconFor(status: RuleStatus) {
  switch (status) {
    case "passed":
      return CheckCircle2;
    case "warning":
      return AlertTriangle;
    case "failed":
      return XCircle;
    case "missing_data":
      return HelpCircle;
  }
}

function colorFor(status: RuleStatus) {
  switch (status) {
    case "passed":
      return "text-status-pass";
    case "warning":
      return "text-status-warning";
    case "failed":
      return "text-status-error";
    case "missing_data":
      return "text-fg-muted";
  }
}

function bgFor(status: RuleStatus) {
  switch (status) {
    case "passed":
      return "bg-status-pass";
    case "warning":
      return "bg-status-warning";
    case "failed":
      return "bg-status-error";
    case "missing_data":
      return "bg-fg-muted";
  }
}

function borderFor(status: RuleStatus) {
  switch (status) {
    case "passed":
      return "border-status-pass/30 bg-status-pass/5";
    case "warning":
      return "border-status-warning/30 bg-status-warning/5";
    case "failed":
      return "border-status-error/30 bg-status-error/5";
    case "missing_data":
      return "border-border bg-surface-2";
  }
}
