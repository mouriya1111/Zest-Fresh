import { BadgeCheck, Clock, Factory, Leaf, PackageCheck, ShieldCheck } from "lucide-react";
import type { ProductDetails } from "@/lib/price-types";
import { Badge, Card } from "@/components/ui";

export function ProductCard({ details }: Readonly<{ details: ProductDetails }>) {
  const rows = [
    ["Product Name", details.productName],
    ["Scientific Name", details.scientificName],
    ["Origin", details.origin],
    ["Quality", details.quality],
    ["Grade", details.grade],
    ["Packaging", details.packaging],
    ["Shelf Life", details.shelfLife],
    ["Storage", details.storage],
    ["Available Stock", details.availableStock],
    ["Dispatch Time", details.dispatchTime],
    ["Minimum Order", details.minimumOrder]
  ];

  const badges = [
    { label: "100% Natural", icon: Leaf },
    { label: "Lab Tested", icon: ShieldCheck },
    { label: "Export Quality", icon: Factory },
    { label: "No Artificial Colour", icon: BadgeCheck },
    { label: "Premium Quality", icon: PackageCheck },
    { label: "Hygienically Packed", icon: Clock }
  ];

  return (
    <section id="quality" className="px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge className="border-green-200 bg-green-50 text-zestGreen">Product Details</Badge>
          <h2 className="font-display mt-4 text-4xl font-black tracking-tight text-zinc-950">Built for consistent colour, aroma, and heat.</h2>
          <p className="mt-4 text-lg leading-8 text-zinc-700">
            ZestFresh keeps the enquiry workflow simple: review grade, stock, packing, and dispatch details from one clean page.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {badges.map((badge) => (
              <span key={badge.label} className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-800 shadow-sm">
                <badge.icon size={16} className="mr-2 text-zestGreen" aria-hidden="true" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="grid sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="border-b border-r border-zinc-100 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{label}</p>
                <p className="mt-2 font-semibold text-zinc-900">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
