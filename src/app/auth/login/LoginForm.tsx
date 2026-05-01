"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus({ kind: "loading" });

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus({ kind: "error", message: prettifyError(error.message) });
      return;
    }
    setStatus({ kind: "sent" });
  }

  if (status.kind === "sent") {
    return (
      <SentState
        email={email}
        onReset={() => {
          setStatus({ kind: "idle" });
          setEmail("");
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-fg">Email</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            placeholder="ty@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status.kind === "loading"}
            className="w-full rounded-lg border border-border bg-surface-2 px-9 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
          />
        </div>
      </label>

      {status.kind === "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status.kind === "loading" || !email.trim()}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg",
          "bg-accent text-accent-foreground text-sm font-medium",
          "transition-colors hover:bg-accent-hover",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
      >
        {status.kind === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Wyślij magic link
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-fg-muted">
        Bez hasła. Wyślemy Ci link na maila — kliknij i jesteś zalogowany.
      </p>
    </form>
  );
}

function SentState({
  email,
  onReset,
}: {
  email: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-pass/15 text-status-pass">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h2 className="mb-1 text-lg font-semibold text-fg">Sprawdź skrzynkę</h2>
      <p className="mb-6 text-sm text-fg-muted">
        Wysłaliśmy link logowania na{" "}
        <span className="font-medium text-fg">{email}</span>. Otwórz wiadomość i
        kliknij link, żeby się zalogować.
      </p>
      <button
        onClick={onReset}
        className="text-sm text-accent hover:text-accent-hover"
      >
        Wyślij na inny adres
      </button>
    </div>
  );
}

function prettifyError(msg: string): string {
  if (msg.toLowerCase().includes("rate limit")) {
    return "Wysłano zbyt wiele linków. Spróbuj za chwilę.";
  }
  if (msg.toLowerCase().includes("invalid") && msg.toLowerCase().includes("email")) {
    return "Nieprawidłowy adres email.";
  }
  return msg;
}
