"use client";

import { Leaf, Mail, Printer, Share2 } from "lucide-react";

export function Navbar() {
  const sharePage = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "ZestFresh Mirchi Powder",
        text: "Send an enquiry for premium ZestFresh mirchi powder.",
        url: window.location.href
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8" aria-label="Main navigation">
        <a href="#top" className="flex items-center gap-3" aria-label="ZestFresh home">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zestRed text-white shadow-lg shadow-red-900/20">
            <Leaf size={23} aria-hidden="true" />
          </span>
          <span>
            <span className="font-display block text-xl font-black tracking-tight text-zinc-950">ZestFresh</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-zestGreen">Mirchi Market</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-semibold text-zinc-700 md:flex">
          <a className="transition hover:text-zestRed" href="#top">Home</a>
          <a className="transition hover:text-zestRed" href="#products">Products</a>
          <a className="transition hover:text-zestRed" href="#quality">Quality</a>
          <a className="transition hover:text-zestRed" href="/order">Enquire</a>
          <a className="transition hover:text-zestRed" href="#faq">FAQ</a>
        </div>

        <div className="flex items-center gap-2">
          <a href="/order" className="hidden rounded-full bg-zestGreen px-4 py-2 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-800 sm:inline-flex">
            <Mail size={16} className="mr-2" aria-hidden="true" />
            Enquire Now
          </a>
          <button className="rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-700 transition hover:border-zestRed hover:text-zestRed" type="button" onClick={() => window.print()} aria-label="Print page">
            <Printer size={18} />
          </button>
          <button className="rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-700 transition hover:border-zestRed hover:text-zestRed" type="button" onClick={sharePage} aria-label="Share page">
            <Share2 size={18} />
          </button>
        </div>
      </nav>
    </header>
  );
}
