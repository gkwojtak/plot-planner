/**
 * House catalog — system designs available without auth.
 * Mirrors the seeded rows in `house_designs` (is_system = true).
 * In Sprint 3+ we'll fetch from DB to support user's custom designs.
 */
export type HouseDesign = {
  id: string;
  name: string;
  widthM: number;
  depthM: number;
  heightM: number;
  floors: 1 | 2;
  /** glTF URL — null = render as procedural box. */
  modelUrl: string | null;
  /** Short description for the catalog card. */
  blurb: string;
};

export const HOUSE_CATALOG: HouseDesign[] = [
  {
    id: "system-mala-kostka",
    name: "Mała kostka",
    widthM: 8,
    depthM: 10,
    heightM: 6,
    floors: 1,
    // Kenney "Modular Buildings" pack — building-sample-house-a.glb
    // License: CC0 (Creative Commons Zero 1.0) — https://kenney.nl/assets/modular-buildings
    modelUrl: "/models/house-cottage.glb",
    blurb: "Parterowy dom kompaktowy, 80 m².",
  },
  {
    id: "system-stodola-nowoczesna",
    name: "Stodoła nowoczesna",
    widthM: 10,
    depthM: 14,
    heightM: 7,
    floors: 1,
    // Kenney "Modular Buildings" pack — building-sample-house-b.glb
    // License: CC0 (Creative Commons Zero 1.0) — https://kenney.nl/assets/modular-buildings
    modelUrl: "/models/house-barn.glb",
    blurb: "Wydłużony rzut z dwuspadowym dachem, 140 m².",
  },
  {
    id: "system-pietrowy-klasyk",
    name: "Piętrowy klasyk",
    widthM: 9,
    depthM: 11,
    heightM: 8.5,
    floors: 2,
    modelUrl: null,
    blurb: "Dwa poziomy, kompaktowa działka, 198 m².",
  },
];

export function findHouse(id: string | null): HouseDesign | null {
  if (!id) return null;
  return HOUSE_CATALOG.find((h) => h.id === id) ?? null;
}
