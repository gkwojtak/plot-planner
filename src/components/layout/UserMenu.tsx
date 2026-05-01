"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Konto"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-chip",
          "border border-border bg-surface text-sm font-semibold text-fg",
          "transition-colors hover:bg-surface-2",
        )}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-panel border border-border bg-surface p-2 shadow-panel-lg">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-fg-muted">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">{email}</span>
          </div>
          <div className="my-1 border-t border-border" />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg hover:bg-surface-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Wyloguj
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
