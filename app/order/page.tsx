import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { OrderForm } from "@/components/OrderForm";
import { getMirchiPrices } from "@/lib/prices";

export const metadata = {
  title: "Enquire for ZestFresh Mirchi Powder",
  description: "Send an enquiry for ZestFresh premium red chilli powder."
};

export default async function OrderPage() {
  const data = await getMirchiPrices();

  return (
    <main className="min-h-screen bg-zestBg px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-900 shadow-soft transition hover:-translate-y-1">
            <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zestRed text-white">
              <Leaf size={22} aria-hidden="true" />
            </span>
            <span className="font-display text-2xl font-black text-zinc-950">ZestFresh Order</span>
          </div>
        </div>

        <section className="mb-8 rounded-[2rem] bg-gradient-to-br from-red-50 via-white to-green-50 p-6 shadow-soft md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-zestRed">Bulk order page</p>
          <h1 className="font-display mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight text-zinc-950 md:text-6xl">
            Enter your details and send an enquiry to ZestFresh.
          </h1>
        </section>

        <OrderForm products={data.products} companyEmail={data.company.email} companyPhone={data.company.phone} />
      </div>
    </main>
  );
}
