# Konfiguracja Supabase + Resend

Krótki przewodnik dla świeżego środowiska — co trzeba kliknąć i wkleić, żeby auth działał.

## 1. Supabase

### a) Klucze do `.env.local`

W panelu Supabase → **Project Settings → API** skopiuj:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (NIGDY nie eksponować na klienta)

### b) Włącz email auth

**Authentication → Providers → Email**:
- Enable Email provider: **ON**
- Confirm email: **OFF** (na czas dewelopmentu — na produkcji włącz)
- Magic link: **ON**

### c) Site URL i redirect URLs

**Authentication → URL Configuration**:
- Site URL: `http://localhost:3000` (dev) / `https://plot-planner.vercel.app` (prod)
- Redirect URLs: dodaj oba powyższe + ewentualne preview URL Vercela

## 2. Resend jako provider SMTP dla magic linków

Domyślnie Supabase wysyła emaile przez własny serwis (limit 3/godz, brand "Supabase"). Podpinamy Resend dla brandu PlotPlanner i wyższych limitów.

### a) Resend → API Key

W Resend → **API Keys → Create API Key** → skopiuj do `.env.local` jako `RESEND_API_KEY`.

### b) Domena nadawcy

W Resend → **Domains → Add Domain**:
- Dodaj `plotplanner.app` (lub Twoją domenę)
- Skonfiguruj DNS rekordy (DKIM, SPF) zgodnie z instrukcjami Resend
- Po weryfikacji ustaw `RESEND_FROM_EMAIL=PlotPlanner <noreply@plotplanner.app>`

Na czas testów lokalnych można użyć `onboarding@resend.dev` (działa od razu, bez weryfikacji domeny):
```
RESEND_FROM_EMAIL=PlotPlanner <onboarding@resend.dev>
```

### c) Konfiguracja SMTP w Supabase

**Project Settings → Auth → SMTP Settings**:

| Pole | Wartość |
|---|---|
| Enable Custom SMTP | ON |
| Sender email | `noreply@plotplanner.app` (lub `onboarding@resend.dev`) |
| Sender name | `PlotPlanner` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | wartość `RESEND_API_KEY` z Resend |

Zapisz. Wyślij test email z **Authentication → Users → Send magic link**.

### d) (Opcjonalnie) Customowy template

**Authentication → Email Templates → Magic Link** — zmień treść na PL i z brandem PlotPlanner.

## 3. Vercel — env vars

Skopiuj wszystkie zmienne z `.env.local` do **Vercel → Project Settings → Environment Variables** dla:
- Production
- Preview
- Development

Pamiętaj że `SUPABASE_SERVICE_ROLE_KEY` i `RESEND_API_KEY` są server-only — Vercel automatycznie nie eksponuje ich na klienta jeśli nie mają prefiksu `NEXT_PUBLIC_`.

## 4. Weryfikacja

Po wszystkim:
```bash
npm run dev
```

Otwórz http://localhost:3000, kliknij "Zaloguj się" (kiedy będzie zaimplementowane w Sprint 2), wpisz swój email — powinieneś dostać magic link na skrzynkę z domeny Resend.
