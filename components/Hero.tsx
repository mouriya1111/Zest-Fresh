"use client";

import Image from "next/image";
import { ArrowRight, Flame, Mail, Printer, Share2 } from "lucide-react";
import type { MirchiPriceData } from "@/lib/price-types";
import { Badge, Card } from "@/components/ui";

export function Hero({ data }: Readonly<{ data: MirchiPriceData }>) {
  const leadProduct = data.products[0];
  const sharePage = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "ZestFresh Mirchi Powder",
        text: "Send an enquiry for premium ZestFresh red chilli powder.",
        url: window.location.href
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <section id="top" className="grain overflow-hidden px-5 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge className="border-red-200 bg-red-50 text-zestRed">
            <Flame size={14} className="mr-2" aria-hidden="true" />
            Current Market Status: Active
          </Badge>
          <h1 className="font-display mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-zinc-950 md:text-7xl">
            ZestFresh Premium Chilli Powder
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            Premium red chilli powder varieties with heat profile, quality specifications, stock status, and quick enquiry support from {data.market}.
          </p>

          <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <p className="text-sm font-semibold text-zinc-500">Featured Variety</p>
              <p className="mt-2 text-3xl font-black text-zestRed">{leadProduct.variety}</p>
              <p className="mt-1 text-sm font-medium text-zinc-500">Bulk product enquiry support</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-zinc-500">Enquiry Support</p>
              <p className="mt-2 text-2xl font-black text-zinc-950">Fast response</p>
              <p className="mt-1 text-sm font-bold text-zestGreen">Share your place and contact details</p>
            </Card>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a className="inline-flex items-center rounded-full bg-zestRed px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-1 hover:bg-red-800" href="#products">
              View Products
              <ArrowRight size={18} className="ml-2" aria-hidden="true" />
            </a>
            <a className="inline-flex items-center rounded-full bg-zestGreen px-6 py-3 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-1 hover:bg-green-800" href={`/order?product=${encodeURIComponent(leadProduct.variety)}`}>
              <Mail size={18} className="mr-2" aria-hidden="true" />
              Enquire Now
            </a>
            <button className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-900 shadow-sm transition hover:-translate-y-1 hover:border-zestOrange" type="button" onClick={() => window.print()}>
              <Printer size={18} className="mr-2" aria-hidden="true" />
              Print
            </button>
            <button className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-900 shadow-sm transition hover:-translate-y-1 hover:border-zestOrange" type="button" onClick={sharePage}>
              <Share2 size={18} className="mr-2" aria-hidden="true" />
              Share
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-red-200/50 via-orange-100/60 to-green-200/50 blur-3xl" />
          <Card className="relative overflow-hidden p-5 shadow-premium">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-red-50 to-orange-50">
              <Image
                src="/images/guntur-sannam-real.jpg"
                alt="Realistic premium red chilli powder bowl with dry chillies"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              {["Lab Tested", "Export Grade", "Hygienic Pack"].map((label) => (
                <div key={label} className="rounded-2xl bg-zestBg p-4 text-center">
                  <p className="text-sm font-black text-zestGreen">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
