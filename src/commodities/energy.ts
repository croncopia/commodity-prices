import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

import energypriceapi from "../sources/energy/energypriceapi";
import oilpriceapi from "../sources/energy/oilpriceapi";

import { trimmedMean } from "../utils/trimmedMean";

const OUT_DIR = join(process.cwd(), "out", "energy");

export default async function () {
  const sources = await Promise.all([
    // energypriceapi().catch((e) => {
    //   console.warn("energypriceapi failed:", e.message);
    //   return undefined;
    // }),
    oilpriceapi().catch((e) => {
      console.warn("oilpriceapi failed:", e.message);
      return undefined;
    }),
  ]);

  const pricesByEnergy: Record<string, number[]> = {};

  for (const source of sources) {
    if (!source) continue;
    for (const [energy, price] of Object.entries(source)) {
      if (price <= 0) continue;
      if (!pricesByEnergy[energy]) pricesByEnergy[energy] = [];
      pricesByEnergy[energy].push(price);
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const timestamp = new Date().toISOString();
  const results: Record<
    string,
    { price: number; sources: number; timestamp: string }
  > = {};

  for (const [energy, prices] of Object.entries(pricesByEnergy)) {
    const avg = trimmedMean(prices, 0.1);
    if (avg <= 0) continue;

    const entry = {
      base: "USD",
      price: avg,
      sources: prices.length,
      timestamp,
    };

    results[energy] = entry;
    writeFileSync(
      join(OUT_DIR, `${energy}.json`),
      JSON.stringify(entry, null, 2),
    );
  }

  return results;
}
