import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

import goldapiio from "../sources/goldapiio";
import goldapicom from "../sources/goldapicom";
import metalpriceapi from "../sources/metalpriceapi";
import dailymetalprice from "../sources/dailymetalprice";
import metalcharts from "../sources/metalcharts";
import { trimmedMean } from "../utils/trimmedMean";
import { troyOzToWeights } from "../utils/convert/weights";

const OUT_DIR = join(process.cwd(), "out", "metals");

export default async function () {
  const sources = await Promise.all([
    goldapiio().catch((e) => {
      console.warn("goldapiio failed:", e.message);
      return undefined;
    }),
    goldapicom().catch((e) => {
      console.warn("goldapicom failed:", e.message);
      return undefined;
    }),
    metalpriceapi().catch((e) => {
      console.warn("metalpriceapi failed:", e.message);
      return undefined;
    }),
    dailymetalprice().catch((e) => {
      console.warn("dailymetalprice failed:", e.message);
      return undefined;
    }),
    metalcharts().catch((e) => {
      console.warn("metalcharts failed:", e.message);
      return undefined;
    }),
  ]);

  const pricesByMetal: Record<string, number[]> = {};

  for (const source of sources) {
    if (!source) continue;
    for (const [metal, price] of Object.entries(source)) {
      if (price <= 0) continue;
      if (!pricesByMetal[metal]) pricesByMetal[metal] = [];
      pricesByMetal[metal].push(price);
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const timestamp = new Date().toISOString();
  const results: Record<
    string,
    { price: Record<string, number>; sources: number; timestamp: string }
  > = {};

  for (const [metal, prices] of Object.entries(pricesByMetal)) {
    const avg = trimmedMean(prices, 0.1);
    if (avg <= 0) continue;

    const entry = {
      base: "USD",
      price: troyOzToWeights(avg),
      sources: prices.length,
      timestamp,
    };

    results[metal] = entry;
    writeFileSync(
      join(OUT_DIR, `${metal}.json`),
      JSON.stringify(entry, null, 2),
    );
  }

  return results;
}
