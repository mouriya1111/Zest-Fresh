import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HomeHighlights } from "@/components/HomeHighlights";
import { Navbar } from "@/components/Navbar";
import { OrderSection } from "@/components/OrderSection";
import { ProductCard } from "@/components/ProductCard";
import { ProductShowcase } from "@/components/ProductShowcase";
import { Reveal } from "@/components/Reveal";
import { getMirchiPrices } from "@/lib/prices";

export default async function Home() {
  const data = await getMirchiPrices();

  return (
    <main>
      <Navbar />
      <Hero data={data} />
      <Reveal><HomeHighlights /></Reveal>
      <Reveal><ProductShowcase products={data.products} /></Reveal>
      <Reveal><ProductCard details={data.productDetails} /></Reveal>
      <Reveal><OrderSection /></Reveal>
      <Reveal><FAQ /></Reveal>
      <Footer company={data.company} />
    </main>
  );
}
