import { getMirchiPrices } from "@/lib/prices";

export async function GET() {
  const data = await getMirchiPrices();

  return Response.json(data, {
    headers: {
      "Content-Disposition": "attachment; filename=mirchi-prices.json"
    }
  });
}
