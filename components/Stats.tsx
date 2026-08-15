import { Boxes, CalendarClock, IndianRupee, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, type PriceStats } from "@/lib/price-types";
import { Card } from "@/components/ui";

export function Stats({ stats, currency }: Readonly<{ stats: PriceStats; currency: string }>) {
  const items = [
    { label: "Average Wholesale", value: formatCurrency(stats.averagePrice, currency), icon: IndianRupee },
    { label: "Highest Wholesale", value: formatCurrency(stats.highestPrice, currency), icon: TrendingUp },
    { label: "Lowest Wholesale", value: formatCurrency(stats.lowestPrice, currency), icon: TrendingDown },
    { label: "Available Products", value: String(stats.availableProducts), icon: Boxes },
    { label: "Last Updated", value: stats.lastUpdated, icon: CalendarClock }
  ];

  return (
    <section className="px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <Card key={item.label} className="p-5 transition duration-300 hover:-translate-y-1 hover:shadow-premium">
            <item.icon className="h-7 w-7 text-zestRed" aria-hidden="true" />
            <p className="mt-5 text-sm font-semibold text-zinc-500">{item.label}</p>
            <p className="mt-1 text-2xl font-black text-zinc-950">{item.value}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
