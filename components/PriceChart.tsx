"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MirchiPriceData } from "@/lib/price-types";
import { Badge, Card } from "@/components/ui";

type RangeKey = keyof MirchiPriceData["priceHistory"];

const labels: Record<RangeKey, string> = {
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  "3months": "Last 3 Months"
};

export function PriceChart({ history }: Readonly<{ history: MirchiPriceData["priceHistory"] }>) {
  const [range, setRange] = useState<RangeKey>("7days");
  const chartData = useMemo(
    () => history[range].map((price, index) => ({ label: range === "3months" ? `M${index + 1}` : `${index + 1}`, price })),
    [history, range]
  );

  return (
    <section className="px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge className="border-orange-200 bg-orange-50 text-amber-700">Price Trend</Badge>
            <h2 className="font-display mt-4 text-4xl font-black tracking-tight text-zinc-950">Market movement</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(labels) as RangeKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  range === key ? "bg-zestRed text-white shadow-lg shadow-red-900/20" : "bg-white text-zinc-700 shadow-sm hover:text-zestRed"
                }`}
              >
                {labels[key]}
              </button>
            ))}
          </div>
        </div>
        <Card className="mt-6 h-[360px] p-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 0, right: 20, top: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#C62828" stopOpacity={0.38} />
                  <stop offset="100%" stopColor="#C62828" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ border: "0", borderRadius: "18px", boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
                formatter={(value) => [`₹${value}`, "Wholesale Price"]}
              />
              <Area type="monotone" dataKey="price" stroke="#C62828" strokeWidth={3} fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </section>
  );
}
