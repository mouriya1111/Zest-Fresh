import Image from "next/image";
import { CheckCircle2, ClipboardList, Flame, Mail, Package } from "lucide-react";
import type { MirchiProduct } from "@/lib/price-types";
import { Badge, Card } from "@/components/ui";

export function ProductShowcase({ products }: Readonly<{ products: MirchiProduct[] }>) {
  return (
    <section id="products" className="px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="border-red-200 bg-red-50 text-zestRed">Product Catalogue</Badge>
          <h2 className="font-display mt-4 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            Premium mirchi powder varieties
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-700">
            Compare each ZestFresh variety by heat, colour, processing style, usage, stock status, and packaging suitability.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <article className={`grid gap-0 lg:grid-cols-2 ${index % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
                <div className="relative min-h-[360px] bg-gradient-to-br from-red-50 via-orange-50 to-green-50">
                  <Image
                    src={product.image}
                    alt={`${product.variety} premium red chilli powder`}
                    fill
                    loading="lazy"
                    className="object-cover p-8"
                  />
                  <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-zestRed shadow-soft">
                    {product.availability}
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="border-orange-200 bg-orange-50 text-amber-700">{product.grade}</Badge>
                    <Badge className="border-green-200 bg-green-50 text-zestGreen">{product.origin}</Badge>
                  </div>

                  <h3 className="font-display mt-5 text-3xl font-black tracking-tight text-zinc-950">{product.variety}</h3>
                  <p className="mt-4 text-base leading-7 text-zinc-700">{product.description}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-zestBg p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Enquiry Type</p>
                      <p className="mt-1 text-2xl font-black text-zestGreen">Bulk</p>
                    </div>
                    <div className="rounded-2xl bg-zestBg p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Status</p>
                      <p className="mt-1 text-xl font-black text-zinc-950">{product.availability}</p>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="flex items-center gap-2 font-black text-zinc-950">
                        <CheckCircle2 size={19} className="text-zestGreen" aria-hidden="true" />
                        Key Highlights
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {product.highlights.map((item) => (
                          <li key={item} className="flex gap-2 text-sm font-semibold text-zinc-700">
                            <Flame size={16} className="mt-0.5 shrink-0 text-zestRed" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 font-black text-zinc-950">
                        <ClipboardList size={19} className="text-zestGreen" aria-hidden="true" />
                        Specifications
                      </h4>
                      <div className="mt-3 space-y-2">
                        {product.specifications.map((spec) => (
                          <div key={spec.label} className="flex justify-between gap-4 rounded-xl bg-zinc-50 px-3 py-2 text-sm">
                            <span className="font-semibold text-zinc-500">{spec.label}</span>
                            <span className="text-right font-black text-zinc-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.forms.map((form) => (
                      <span key={form} className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-black text-zestRed">
                        <Package size={14} className="mr-1.5" aria-hidden="true" />
                        {form}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <a href={`/order?product=${encodeURIComponent(product.variety)}`} className="inline-flex items-center rounded-full bg-zestGreen px-5 py-3 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-1 hover:bg-green-800">
                      <Mail size={17} className="mr-2" aria-hidden="true" />
                      Enquire Now
                    </a>
                  </div>
                </div>
              </article>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
