import { unstable_noStore as noStore } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { MirchiPriceData, PriceStats } from "@/lib/price-types";

export async function getMirchiPrices(): Promise<MirchiPriceData> {
  noStore();
  const file = path.join(process.cwd(), "data", "mirchi-prices.json");
  const raw = await readFile(file, "utf8");
  return JSON.parse(raw) as MirchiPriceData;
}

export function calculateStats(data: MirchiPriceData): PriceStats {
  const wholesalePrices = data.products.map((product) => product.wholesalePrice);
  const total = wholesalePrices.reduce((sum, price) => sum + price, 0);

  return {
    averagePrice: Math.round(total / wholesalePrices.length),
    highestPrice: Math.max(...wholesalePrices),
    lowestPrice: Math.min(...wholesalePrices),
    availableProducts: data.products.filter((product) => product.availability !== "Out Of Stock").length,
    lastUpdated: data.lastUpdated
  };
}
