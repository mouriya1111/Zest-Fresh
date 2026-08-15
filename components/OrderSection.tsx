import { Mail, PackageCheck, Send } from "lucide-react";
import { Badge, Card } from "@/components/ui";

export function OrderSection() {
  return (
    <section id="order" className="px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Card className="overflow-hidden bg-zinc-950 text-white shadow-premium">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-gradient-to-br from-zestRed via-red-700 to-zinc-950 p-8 md:p-10">
              <Badge className="border-white/20 bg-white/10 text-white">Enquire Now</Badge>
              <h2 className="font-display mt-5 text-4xl font-black tracking-tight md:text-5xl">
                Ready to enquire for ZestFresh mirchi powder?
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-red-50">
                Share your name, phone number, email, and place. Our team can contact you with availability, product information, and next steps.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/order" className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-white/10">
                  <Mail size={18} className="mr-2" aria-hidden="true" />
                  Enquire Now
                </a>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <h3 className="font-display text-2xl font-black">Quick order checklist</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  "Select chilli variety",
                  "Enter your name",
                  "Add phone number",
                  "Add email address",
                  "Share your place",
                  "Ask for latest stock status",
                  "Wait for team response"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 p-4">
                    <PackageCheck className="h-5 w-5 shrink-0 text-zestOrange" aria-hidden="true" />
                    <span className="text-sm font-bold text-zinc-100">{item}</span>
                  </div>
                ))}
              </div>
              <a href="/order" className="mt-7 inline-flex items-center rounded-full bg-zestGreen px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-green-800">
                <Send size={18} className="mr-2" aria-hidden="true" />
                Enquire Now
              </a>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
