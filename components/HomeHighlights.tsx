import { Award, Factory, ShieldCheck, Truck } from "lucide-react";
import { Badge, Card } from "@/components/ui";

export function HomeHighlights() {
  const highlights = [
    {
      title: "Product-first enquiry flow",
      text: "Product details are organized for buyers who compare grade, origin, stock, and dispatch timing before sending an enquiry.",
      icon: Factory
    },
    {
      title: "Quality-first processing",
      text: "Each variety is selected for colour, aroma, moisture range, heat level, and grinding consistency.",
      icon: ShieldCheck
    },
    {
      title: "Bulk-ready packaging",
      text: "Food-grade pouches, consumer packs, and bulk bags can be arranged based on product form and buyer requirement.",
      icon: Award
    },
    {
      title: "Fast dispatch support",
      text: "Enquiries are routed with product interest, contact details, and place so the team can respond quickly.",
      icon: Truck
    }
  ];

  return (
    <section className="px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <Badge className="border-green-200 bg-green-50 text-zestGreen">Home</Badge>
            <h2 className="font-display mt-4 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
              A cleaner way to buy premium chilli powder.
            </h2>
          </div>
          <p className="text-lg leading-8 text-zinc-700">
            ZestFresh brings product details, specifications, stock status, and enquiry actions into one modern page, so buyers can move from comparison to contact without confusion.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <Card key={item.title} className="p-5 transition duration-300 hover:-translate-y-1 hover:shadow-premium">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-zestRed">
                <item.icon size={23} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-xl font-black text-zinc-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
