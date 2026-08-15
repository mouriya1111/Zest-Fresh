import { Instagram, Leaf, Mail, MapPin, Phone } from "lucide-react";
import type { MirchiPriceData } from "@/lib/price-types";

export function Footer({ company }: Readonly<{ company: MirchiPriceData["company"] }>) {
  return (
    <footer id="footer-contact" className="mt-12 bg-zinc-950 px-5 py-12 text-white lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zestRed">
              <Leaf size={22} aria-hidden="true" />
            </span>
            <span className="font-display text-2xl font-black">{company.name}</span>
          </div>
          <p className="mt-4 max-w-md leading-7 text-zinc-300">
            Premium mirchi powder product details and enquiry support for modern spice buyers.
          </p>
        </div>
        <div>
          <h3 className="font-black">Company Details</h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p className="flex gap-3"><Mail size={18} className="text-zestOrange" aria-hidden="true" /> {company.email}</p>
            <p className="flex gap-3"><Phone size={18} className="text-zestOrange" aria-hidden="true" /> {company.phone}</p>
            <p className="flex gap-3"><MapPin size={18} className="text-zestOrange" aria-hidden="true" /> {company.address}</p>
          </div>
        </div>
        <div>
          <h3 className="font-black">Social Links</h3>
          <div className="mt-4 flex gap-3">
            <a
              href="https://www.instagram.com/zestfresh_official/"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-zestRed"
              aria-label="ZestFresh Instagram profile"
            >
              <Instagram size={19} />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-zinc-400">
        Copyright © 2026 ZestFresh. All rights reserved.
      </div>
    </footer>
  );
}
