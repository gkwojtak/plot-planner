# PlotPlanner

Webowa aplikacja pokazująca potencjał zabudowy działki w widoku 3D. Odpowiada na pytanie: **"Czy ten dom sensownie mieści się na tej działce i jak to wygląda?"**

## Stack

- **Next.js 15** (App Router) + React 19
- **TypeScript** + **Tailwind CSS**
- **Three.js** + **React Three Fiber** + **Drei** — widok 3D
- **Supabase** — auth (magic link via Resend), Postgres + PostGIS, Storage
- **Zustand** + **TanStack Query** — state
- **next-themes** — light / dark mode

## Wymagania

- Node 20+ (testowane na 22)
- Konto Supabase (projekt: `plot-planner`)
- Konto Resend (do magic link emaili)
- Konto Vercel (deploy)

## Setup

```bash
npm install
cp .env.example .env.local
# uzupełnij wartości w .env.local — patrz: dokumentacja Supabase i Resend

npm run dev
# → http://localhost:3000
```

## Skrypty

| Skrypt | Opis |
|---|---|
| `npm run dev` | dev server (port 3000) |
| `npm run build` | production build |
| `npm run start` | start production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | tsc --noEmit |

## Struktura

```
src/
├── app/                  Next.js App Router
├── components/
│   ├── workspace/        Główny ekran roboczy
│   ├── layout/           TopBar, StepsPanel, PropertiesPanel, BottomBar
│   ├── scene/            Widok 3D (R3F)
│   └── theme/            ThemeProvider, ThemeToggle
└── lib/
    ├── supabase/         Browser + server client
    └── utils.ts          cn helper
docs/                     Spec MVP, decyzje produktowe
DESIGN.md                 Source of truth dla UI / brand / 3D
```

## Decyzje projektowe

Wszystkie kluczowe decyzje (auth, modele 3D, import map, target users, paleta) są spisane w `DESIGN.md` oraz w `docs/mvp-build-spec.md`. Nie modyfikować bez aktualizacji tych dokumentów.

## Roadmapa MVP

Pełny breakdown w `docs/mvp-build-spec.md`. Skrót:

- **Sprint 1** ✅ Scaffold + scena demo (działka, dom, droga, drzewa, sąsiedzi)
- **Sprint 2** Ręczna działka prostokątna + katalog domów + import z Geoportalu (opcjonalny)
- **Sprint 3** Drag & rotate domu + warianty A/B/C
- **Sprint 4** Rule engine: granice, strefy 3m/4m
- **Sprint 5** Działki polygon
- **Sprint 6** Share link + komentarze + PDF
