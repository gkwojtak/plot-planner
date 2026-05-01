"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center gap-2 rounded-chip bg-accent px-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors print:hidden"
    >
      <Printer className="h-4 w-4" />
      Drukuj
    </button>
  );
}
