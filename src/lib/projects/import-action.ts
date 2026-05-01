"use server";

import { fetchPlotByUldkId } from "@/lib/import/uldk";

export async function importPlotByUldkId(id: string) {
  return fetchPlotByUldkId(id);
}
