"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, PhoneCall, Search } from "lucide-react";
import { formatCurrency, type MirchiProduct } from "@/lib/price-types";
import { Badge, Card, cn } from "@/components/ui";

type SortMode = "lowest" | "highest" | "availability";

function availabilityClass(status: MirchiProduct["availability"]) {
  if (status === "Available") return "border-green-200 bg-green-50 text-zestGreen";
  if (status === "Limited") return "border-yellow-200 bg-yellow-50 text-amber-700";
  return "border-zinc-200 bg-zinc-100 text-zinc-600";
}

function trendClass(trend: MirchiProduct["trend"]) {
  if (trend === "down") return "border-green-200 bg-green-50 text-zestGreen";
  if (trend === "up") return "border-red-200 bg-red-50 text-zestRed";
  return "border-zinc-200 bg-zinc-100 text-zinc-600";
}

export function PriceTable({ products, currency }: Readonly<{ products: MirchiProduct[]; currency: string }>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("lowest");

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = products.filter((product) =>
      [product.variety, product.grade, product.origin].some((field) => field.toLowerCase().includes(normalized))
    );

    return [...filtered].sort((a, b) => {
      if (sort === "lowest") return a.wholesalePrice - b.wholesalePrice;
      if (sort === "highest") return b.wholesalePrice - a.wholesalePrice;
      if (sort === "availability") return a.availability.localeCompare(b.availability);
      return a.wholesalePrice - b.wholesalePrice;
    });
  }, [products, query, sort]);

  return (
    <section id="prices" className="px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge className="border-red-200 bg-red-50 text-zestRed">Wholesale Price Table</Badge>
            <h2 className="font-display mt-4 text-4xl font-black tracking-tight text-zinc-950">Bulk mirchi powder rates</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
              Search and compare varieties by grade, origin, availability, and wholesale price. Prices are per 1 Kg and minimum order quantity is 100 Kg.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
            <label className="relative">
              <span className="sr-only">Search by variety, grade, or origin</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-full border border-zinc-200 bg-white pl-12 pr-4 font-semibold outline-none transition focus:border-zestRed focus:ring-4 focus:ring-red-100"
                placeholder="Search variety, grade, origin"
              />
            </label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="h-12 rounded-full border border-zinc-200 bg-white px-4 font-semibold outline-none transition focus:border-zestRed focus:ring-4 focus:ring-red-100"
              aria-label="Sort products"
            >
              <option value="lowest">Lowest Price</option>
              <option value="highest">Highest Price</option>
              <option value="availability">Availability</option>
            </select>
          </div>
        </div>

        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full border-collapse text-left">
              <thead className="bg-zinc-950 text-white">
                <tr>
                  {["Image", "Variety", "Grade", "Unit", "Wholesale / 1 Kg", "Previous / 1 Kg", "Difference", "Trend", "Availability", "Updated", "Order"].map((head) => (
                    <th key={head} className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em]">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-100 bg-white transition hover:bg-red-50/40">
                    <td className="px-5 py-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-red-50">
                        <Image src={product.image} alt={`${product.variety} chilli powder`} fill loading="lazy" className="object-cover" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-black text-zinc-950">{product.variety}</p>
                      <p className="text-sm font-semibold text-zinc-500">{product.origin}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold">{product.grade}</td>
                    <td className="px-5 py-4 font-semibold">{product.unit}</td>
                    <td className="px-5 py-4 text-xl font-black text-zestRed">{formatCurrency(product.wholesalePrice, currency)}</td>
                    <td className="px-5 py-4 font-semibold text-zinc-500">{formatCurrency(product.previousPrice, currency)}</td>
                    <td className={cn("px-5 py-4 font-black", product.difference > 0 ? "text-zestRed" : product.difference < 0 ? "text-zestGreen" : "text-zinc-500")}>
                      {product.difference > 0 ? "+" : ""}{product.difference}
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={trendClass(product.trend)}>
                        {product.trend === "up" && <ArrowUp size={14} className="mr-1" />}
                        {product.trend === "down" && <ArrowDown size={14} className="mr-1" />}
                        {product.trend === "up" ? "Price Up" : product.trend === "down" ? "Price Down" : "Stable"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4"><Badge className={availabilityClass(product.availability)}>{product.availability}</Badge></td>
                    <td className="px-5 py-4 font-semibold text-zinc-500">{product.updatedTime}</td>
                    <td className="px-5 py-4">
                      <a href={`/order?product=${encodeURIComponent(product.variety)}`} className="inline-flex items-center rounded-full bg-zestGreen px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-green-800">
                        <PhoneCall size={15} className="mr-1.5" aria-hidden="true" />
                        Order
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}
