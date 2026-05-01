# PlotPlanner — Design System

Source of truth dla całej warstwy wizualnej i tone of voice. Każda decyzja UI musi być z tym zgodna lub zaktualizować ten dokument.

## Pozycjonowanie

PlotPlanner ma wyglądać jak **przyjazny konfigurator nieruchomości 3D** — nie jak CAD, nie jak GIS, nie jak panel urzędowy.

Najbliższa analogia: **konfiguratory samochodowe** (BMW, Tesla, Porsche). Duża scena 3D dominuje, UI jest cichy i wspierający.

## Główna zasada

**Scena 3D jest produktem. Interfejs ma ją wspierać, nie zasłaniać.**

Wszystkie decyzje UI wracają do tego pytania: czy ten element pomaga zobaczyć/zrozumieć działkę, czy ją zasłania?

## Estetyka

- czysta, jasna podstawa (light mode default)
- miękkie, naturalne kolory: zieleń, grafit, biel, jasny beton, drewno
- zero ciężkiego enterprise dashboard
- mało tabel, mało formularzy
- panele tylko tam, gdzie pomagają podjąć decyzję

## Paleta

Kierunek finalny po inspiracjach (HYMER configurator, Module Bookshelf, 3D Builder pergola): **off-white + floating white panels + deep blue accent + warm wood jako materiał-bohater**.

### Light mode

| Rola | Token | Hex | Użycie |
|---|---|---|---|
| Background | `bg` | `#F5F4F0` | tło aplikacji (warm off-white, nie pure white) |
| Surface | `surface` | `#FFFFFF` | floating panele, karty |
| Surface elevated | `surface-2` | `#FAFAF7` | hover, secondary cards |
| Border subtle | `border` | `#E8E6E0` | dividers, panel outlines |
| Text primary | `fg` | `#1A1A1F` | nagłówki, body |
| Text secondary | `fg-muted` | `#6B6B73` | etykiety, captions |
| **Accent primary** | `accent` | `#2347D9` | CTA, selected, active state, dimensions w scenie |
| Accent hover | `accent-hover` | `#1B38B0` | |
| **Wood warm** | `wood` | `#C8A370` | hero material — przyciski drugorzędne, akcent na karcie domu |
| Wood dark | `wood-dark` | `#7A5239` | walnut accent |

### Dark mode

| Rola | Hex |
|---|---|
| Background | `#1A1A1F` (grafit, NIE czerń) |
| Surface | `#24242B` |
| Surface elevated | `#2E2E36` |
| Border subtle | `#3A3A42` |
| Text primary | `#F5F4F0` |
| Text secondary | `#A0A0AB` |
| Accent primary | `#5B7AFF` (jaśniejsza wersja blue) |
| Wood warm | `#D4B384` |

### Status colors (light/dark)

| Status | Light | Dark | Użycie |
|---|---|---|---|
| Pass | `#5B8A4E` (sage) | `#7AB068` | "Pasuje", zgodne z regułą |
| Warning | `#D49A2A` (amber) | `#E5B548` | "Ryzyko", brakuje danych |
| Error | `#C25A4A` (terracotta) | `#E07868` | "Za blisko granicy" |

Wszystkie status colors stonowane, **bez neonów**, ciepłe odcienie.

### Akcenty 3D w scenie

- **Trawa działki:** `#A4B585` (muted sage)
- **Beton/chodnik:** `#C9C5BD` (warm grey)
- **Droga asfalt:** `#5B5B60`
- **Domy domyślny materiał:** off-white `#EFEAE0` + drewniane akcenty
- **Strefy graniczne 3m/4m:** `accent` z opacity 15-20% (półprzezroczyste niebieskie obszary)
- **Linie wymiarów:** `accent` 100% opacity, jak w obrazie 3 ("4000 mm" wpisane w scenę)

## Dark mode

Light + dark od MVP, toggle w górnym pasku. Persistowany per-user.

Dark mode: grafit jako tło (nie czerń), zieleń jako akcent jaśniejszy o ~10%.

## Typografia

- **Sans modernistyczny:** Inter (fallback Geist) — jeden font, dwie wagi (400, 600), nagłówki przez rozmiar nie krój.
- Body 16px / nagłówki w skali 1.25 (modular).
- Tabular nums dla wymiarów (m², m).

## Ikonografia

- **Lucide** dla całego UI (linia 1.5px, default).
- Dla domain-specific (działka, granica, strefa) możemy później dodać 3-5 custom SVG w tej samej stylistyce.

## Layout głównego ekranu (desktop)

- **Centrum:** pełnoekranowy izometryczny widok 3D działki
- **Lewy panel:** kroki pracy → Działka → Dom → Ustawienie → Analiza → Udostępnij
- **Prawy panel / dolny drawer:** parametry aktualnie wybranego elementu
- **Dolny pasek:** warianty A/B/C, obrót, zoom, undo
- **Górny pasek:** nazwa projektu, status, zapis, udostępnij, theme toggle

## Layout mobile

- scena 3D nadal dominuje cały ekran
- panele jako wysuwane bottom-sheety (nie modalne dialogi)
- duże przyciski dotykowe (min 44px)
- minimum tekstu na ekranie — ikony + krótkie etykiety

## Styl 3D

**Nie fotorealizm. Nie low-poly. Cel: estetyczna makieta architektoniczna 3D.**

Elementy sceny:
- czytelna działka (trawa proceduralna, nie tekstura HD)
- droga, chodnik, ogrodzenie
- proste, ale ładne bryły domów (z gotowych modeli glTF)
- lekkie cienie (soft shadows, ambient occlusion)
- drzewa i sąsiednie budynki jako kontekst (instancing)
- **prawdziwa skala** wymiarów — to fundament wiarygodności
- delikatne kolory materiałów (matowe, nie błyszczące)

Wrażenie: "wystarczająco premium żeby pokazać klientowi, nie tak realistycznie żeby sugerowało projekt wykonawczy".

## Komponenty UI

Inspirowane HYMER / Module Bookshelf / 3D Builder configuratorami:

- **Floating panels:** białe karty z `border-radius: 16-24px`, miękki shadow `0 8px 32px rgba(0,0,0,0.06)`, separowane od tła oddechem
- **Pill chips:** rounded-full przyciski narzędzi w dolnym pasku (jak "See in your room", "Show dimensions" w obrazie 2)
- **Tab pills:** rounded-full wybór trybów na górze (jak "Venture S / B-Class" w obrazie 1)
- **Statusy** jako kompaktowe badges z kolorem statusu: "Pasuje", "Ryzyko", "Za blisko granicy"
- **Linie/strefy** rysowane na działce zamiast długich opisów tekstowych
- **Wymiary renderowane IN-SCENE** (jak `2500 mm` / `4000 mm` w obrazie 3) — fundamentalny pattern dla odległości od granic
- **Ikony** Lucide dla narzędzi: przesuwanie, obrót, widok, pomiar, warianty
- **Suwaki / steppery** do wymiarów (nie input fields)
- **Karty** tylko dla: katalogu domów, wariantów A/B/C
- **Checklisty** dla wyników analizy
- **Tooltipy** zamiast instrukcji na pół ekranu
- **CTA primary:** filled blue (`accent`), rounded-lg, z lekkim shadow
- **CTA secondary:** outlined wood lub neutral, rounded-lg

## Tone of voice

**Przyjazny, ludzki, konkretny.** Nie urzędowy, nie suchy.

Pisać:
- "Dom jest za blisko zachodniej granicy."
- "Ten wariant zostawia więcej ogrodu od południa."
- "Brakuje informacji o oknach na tej ścianie."
- "Wygląda dobrze na podstawie podstawowych odległości."

Unikać:
- "Naruszenie §..."
- "Błąd walidacji obiektu"
- "Nieprawidłowe dane wejściowe"
- emoji w komunikatach analizy (zostawić dla onboardingu i sukcesów)

## Wrażenie końcowe (acceptance test)

Użytkownik po pierwszej sesji powinien móc powiedzieć:

> "Widzę swoją działkę. Mogę położyć na niej dom. Rozumiem, co działa, a co nie."

UI ma być **spokojne, lekkie i precyzyjne**. Całe "wow" siedzi w dopracowanym widoku 3D.

## Anty-wzorce (czego NIE robimy)

- ❌ ciemne enterprise dashboardy z kolumnami metryk
- ❌ formularze na pół ekranu
- ❌ żółte/czerwone alerty modalne dla każdego ostrzeżenia
- ❌ neonowe akcenty (cyjan, magenta)
- ❌ skomplikowane menu z 20 opcjami
- ❌ profesjonalny żargon CAD ("vertex", "extrude", "boolean")
- ❌ realistyczne rendery PBR (sugerują gotowy projekt — niebezpieczne prawnie i wizualnie)
