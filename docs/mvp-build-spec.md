# PlotPlanner MVP Build Spec

## Cel MVP

Zbudować webową aplikację, która pozwala użytkownikowi szybko zobaczyć potencjał zabudowy działki w atrakcyjnym widoku 3D.

MVP ma dowieźć przede wszystkim:

1. efektowny, szybki widok działki 3D,
2. poprawną skalę działki i domu,
3. proste ustawianie budynku na działce,
4. podstawową weryfikację odległości od granic,
5. zapis i udostępnienie wariantu.

MVP nie ma udawać pełnego narzędzia projektowego ani formalnej analizy urzędowej.

## Docelowy użytkownik MVP

Pierwsza wersja jest projektowana dla:

- osoby prywatnej posiadającej działkę lub rozważającej jej zakup,
- małego biura nieruchomości,
- małego dewelopera testującego prosty wariant zabudowy.

Najważniejsze pytanie użytkownika:

> Czy ten dom sensownie mieści się na tej działce i jak to wygląda?

## Zakres MVP

### Wchodzi do MVP

- webowa aplikacja w języku polskim,
- ręczne utworzenie działki prostokątnej,
- ręczne utworzenie działki wielopunktowej,
- główny widok izometryczny 3D,
- stylizowane otoczenie działki: droga, trawa, kilka drzew, sąsiednie proste bryły,
- katalog kilku przykładowych domów,
- dodanie domu na działkę,
- przesuwanie domu,
- obracanie domu,
- zachowanie skali w metrach,
- oznaczenie ścian z oknami/drzwiami,
- sprawdzenie minimalnych odległości 3 m / 4 m od granic,
- pokazanie stref zakazanych na działce,
- lista ostrzeżeń i błędów,
- zapis projektu,
- zapis kilku wariantów ustawienia,
- publiczny link read-only do projektu,
- prosty eksport PDF z rzutem, widokiem 3D i listą wyników analizy.

### Nie wchodzi do pierwszego MVP

- pełna analiza MPZP,
- pełna analiza WZ,
- gwarancja zgodności prawnej,
- automatyczny import działki z Geoportalu jako warunek startu,
- generowanie formalnych dokumentów urzędowych,
- automatyczne rozpoznawanie PDF projektu,
- realistyczne rendery AI,
- marketplace partnerów,
- płatności,
- zaawansowany tryb wielu budynków.

Te funkcje są ważne, ale powinny wejść po potwierdzeniu, że podstawowy edytor 3D działa i jest atrakcyjny dla użytkownika.

## Proponowany stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query

### 3D

- Three.js
- React Three Fiber
- Drei
- glTF/GLB dla modeli domów

### Backend MVP

- Next.js server actions lub route handlers
- PostgreSQL
- PostGIS, jeśli od początku uruchamiamy geometrię po stronie bazy
- Prisma lub Drizzle
- S3-compatible storage dla plików i eksportów

### PDF

- generowanie HTML report view,
- render do PDF przez Playwright/Puppeteer po stronie serwera lub workera.

## Główne moduły aplikacji

### 1. Project Workspace

Odpowiada za cały ekran roboczy.

Elementy:

- scena 3D jako dominujący obszar,
- panel kroków,
- panel właściwości,
- panel analizy,
- selektor wariantów.

Priorytet UX:

- użytkownik widzi działkę i dom szybciej niż formularze,
- formularze są krótkie,
- komunikaty są opisowe, nie urzędowe.

### 2. Plot Editor

Funkcje:

- utworzenie działki prostokątnej przez szerokość i głębokość,
- utworzenie działki polygon przez punkty,
- edycja punktów granicy,
- wyliczenie powierzchni,
- ustawienie strony drogi,
- ustawienie orientacji północy.

Minimalny model danych:

```ts
type Plot = {
  id: string;
  name: string;
  points: Vec2[];
  roadEdgeId?: string;
  northRotationDeg: number;
  areaM2: number;
};
```

### 3. House Catalog

Funkcje:

- lista kilku domów seedowanych lokalnie,
- filtr po szerokości i głębokości,
- szybki podgląd bryły,
- dodanie domu do działki.

Minimalny model danych:

```ts
type HouseDesign = {
  id: string;
  name: string;
  widthM: number;
  depthM: number;
  heightM: number;
  floors: number;
  footprint: Vec2[];
  previewModelUrl?: string;
  wallOpenings: WallOpening[];
};
```

### 4. Placement Editor

Funkcje:

- przesuwanie budynku po płaszczyźnie działki,
- obracanie budynku,
- snap do 5 lub 15 stopni,
- cofnięcie do ostatniej poprawnej pozycji,
- podgląd odległości do granic,
- zapis wariantu.

Minimalny model danych:

```ts
type Placement = {
  id: string;
  houseDesignId: string;
  position: Vec2;
  rotationDeg: number;
};
```

### 5. Rule Engine MVP

MVP sprawdza tylko reguły geometryczne.

Reguły:

- budynek musi być w granicach działki,
- ściana z oknami/drzwiami: minimum 4 m od granicy,
- ściana bez okien/drzwi: minimum 3 m od granicy,
- jeśli brakuje danych o otworach, status to ostrzeżenie, nie wynik pewny.

Wynik analizy:

```ts
type RuleResult = {
  id: string;
  status: "passed" | "warning" | "failed" | "missing_data";
  title: string;
  message: string;
  affectedGeometry?: GeometryRef;
};
```

Komunikaty w UI:

- "Budynek mieści się w granicach działki."
- "Północna ściana jest za blisko granicy."
- "Brakuje informacji o oknach na tej ścianie."
- "Przesuń budynek o co najmniej 1,2 m od zachodniej granicy."

### 6. 3D Scene

Scena ma być szybka i czytelna.

Elementy:

- płaska działka w skali,
- linie granic,
- strefy 3 m / 4 m jako półprzezroczyste obszary,
- bryła domu,
- droga,
- trawa,
- kilka drzew jako instancje,
- proste sąsiednie budynki,
- kamera izometryczna,
- tryb obracania i przybliżania.

Wymagania wydajnościowe:

- scena działa płynnie na typowym laptopie i telefonie,
- minimalizować liczbę draw calls,
- używać instancing dla powtarzalnych obiektów,
- nie aktualizować pozycji budynku przez React state w każdej klatce,
- renderować na żądanie, jeśli scena nie jest animowana,
- ładować modele progresywnie.

### 7. Scenario Manager

Funkcje:

- zapis wariantu A/B/C,
- nazwanie wariantu,
- przełączanie wariantów,
- status zgodności przy każdym wariancie.

Minimalny model danych:

```ts
type Scenario = {
  id: string;
  name: string;
  placement: Placement;
  analysisStatus: "passed" | "warning" | "failed" | "missing_data";
};
```

### 8. Share View

Funkcje:

- publiczny link read-only,
- widok 3D bez edycji,
- lista parametrów,
- lista ostrzeżeń,
- wybrany wariant.

W MVP link może być publiczny z losowym tokenem. Kontrola uprawnień może wejść później.

### 9. Report Export

Raport MVP zawiera:

- nazwę projektu,
- parametry działki,
- parametry domu,
- rzut z pozycją budynku,
- screenshot 3D,
- wyniki analizy,
- disclaimer.

Treść disclaimer:

> Raport ma charakter poglądowy i opiera się na danych wprowadzonych w aplikacji. Nie stanowi formalnej dokumentacji projektowej ani potwierdzenia zgodności z MPZP, WZ lub przepisami prawa budowlanego.

## Kolejność implementacji

### Sprint 1: Fundament aplikacji i scena demo

Cel:

Użytkownik otwiera aplikację i widzi atrakcyjną scenę 3D z przykładową działką oraz domem.

Zakres:

- konfiguracja Next.js,
- layout aplikacji,
- główna scena 3D,
- kamera izometryczna,
- przykładowa działka,
- przykładowy dom,
- droga, trawa, drzewa,
- podstawowe materiały i światło.

Kryterium akceptacji:

- aplikacja uruchamia się lokalnie,
- scena nie jest pusta,
- można obracać i przybliżać widok,
- działka i dom są w tej samej skali.

### Sprint 2: Ręczna działka i dom

Cel:

Użytkownik może stworzyć własną prostą działkę i wybrać dom.

Zakres:

- formularz działki prostokątnej,
- katalog 5 przykładowych domów,
- dodanie domu do działki,
- parametry domu widoczne w UI,
- zapis stanu projektu lokalnie lub w bazie.

Kryterium akceptacji:

- zmiana wymiarów działki aktualizuje scenę,
- zmiana domu aktualizuje bryłę,
- wymiary w UI odpowiadają wymiarom w scenie.

### Sprint 3: Przesuwanie, obracanie i warianty

Cel:

Użytkownik może realnie planować ustawienie domu.

Zakres:

- drag budynku po działce,
- obrót budynku,
- snap obrotu,
- zapis wariantu,
- przełączanie wariantów A/B/C.

Kryterium akceptacji:

- przesuwanie jest płynne,
- budynek zachowuje skalę,
- warianty zapisują osobną pozycję i obrót.

### Sprint 4: Analiza geometryczna

Cel:

System pokazuje podstawowe błędy i ostrzeżenia.

Zakres:

- obrys budynku jako polygon,
- sprawdzenie czy budynek jest w działce,
- odległości do granic,
- strefy 3 m i 4 m,
- wynik analizy,
- podświetlenie problemu na scenie.

Kryterium akceptacji:

- przesunięcie domu za blisko granicy generuje błąd,
- poprawna pozycja ma status pozytywny,
- kliknięcie błędu pokazuje problem na scenie.

### Sprint 5: Działka polygon

Cel:

Obsłużyć działki inne niż prostokąt.

Zakres:

- edytor punktów działki,
- dodawanie/usuwanie punktów,
- walidacja prostego polygonu,
- powierzchnia działki,
- analiza odległości dla polygonu.

Kryterium akceptacji:

- użytkownik może stworzyć działkę wielopunktową,
- reguły działają dla nieregularnej działki.

### Sprint 6: Udostępnianie i PDF

Cel:

Użytkownik może pokazać wynik komuś innemu.

Zakres:

- zapis projektu w bazie,
- publiczny link read-only,
- screenshot sceny,
- prosty raport PDF.

Kryterium akceptacji:

- link otwiera ten sam wariant bez możliwości edycji,
- PDF zawiera widok, parametry i wyniki analizy.

## Minimalna baza danych

```txt
users
projects
plots
house_designs
placements
scenarios
analysis_runs
share_links
reports
```

Na potrzeby bardzo szybkiego prototypu można zacząć bez kont użytkowników i trzymać projekty anonimowo po tokenie. Jeżeli planujemy sprzedaż B2B, auth warto dodać wcześniej.

## Priorytety techniczne

1. Najpierw płynny edytor 3D.
2. Potem poprawna geometria.
3. Potem zapis i udostępnianie.
4. Dopiero potem import map, PDF, AI i płatności.

Jeśli widok 3D nie będzie działał dobrze, reszta funkcji nie uratuje produktu.

## Definicja gotowego MVP

MVP jest gotowe, gdy można wykonać pełny przepływ:

1. utworzyć działkę,
2. wybrać dom,
3. ustawić dom na działce w 3D,
4. zobaczyć podstawową analizę,
5. zapisać 2-3 warianty,
6. udostępnić projekt,
7. wygenerować prosty PDF.

## Następny krok po MVP

Po MVP kolejność rozwoju powinna być:

1. integracja działek z mapą i ULDK/GUGiK,
2. lepszy katalog domów,
3. filtr "pokaż domy pasujące do działki",
4. import PDF jako footprint + wysokość,
5. render AI,
6. płatności i limity,
7. rozszerzona analiza MPZP/WZ.

