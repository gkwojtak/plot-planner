"use server";

import { fetchOsmEnvironment } from "@/lib/import/osm";
import type { OsmEnvironment } from "@/lib/store/project";

export async function loadOsmEnvironment(
  lat: number,
  lon: number,
): Promise<OsmEnvironment | null> {
  return fetchOsmEnvironment(lat, lon);
}
