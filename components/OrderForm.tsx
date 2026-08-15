"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, MapPin, PhoneCall, ReceiptText, Send } from "lucide-react";
import type { MirchiProduct } from "@/lib/price-types";
import { Card } from "@/components/ui";

type OrderFormProps = {
  products: MirchiProduct[];
  companyEmail: string;
  companyPhone: string;
};

export function OrderForm({ products, companyEmail, companyPhone }: Readonly<OrderFormProps>) {
  const [productName, setProductName] = useState(products[0]?.variety ?? "");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const productFromUrl = new URLSearchParams(window.location.search).get("product");
    if (productFromUrl && products.some((product) => product.variety === productFromUrl)) {
      setProductName(productFromUrl);
    }
  }, [products]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.variety === productName) ?? products[0],
    [productName, products]
  );

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const details = {
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      place: String(formData.get("place") ?? "")
    };

    const body = [
      "New ZestFresh Mirchi Powder Enquiry",
      "",
      `Customer Name: ${details.customerName}`,
      `Phone: ${details.phone}`,
      `Email: ${details.email}`,
      `Place: ${details.place}`,
      `Interested Product: ${selectedProduct?.variety ?? "General enquiry"}`,
      "",
      "Please contact this customer with product details and availability."
    ].join("\n");

    setIsSending(true);
    setMessage("");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(companyEmail)}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: details.customerName,
          phone: details.phone,
          email: details.email,
          place: details.place,
          product: selectedProduct?.variety ?? "General enquiry",
          message: body,
          _captcha: "false",
          _subject: `ZestFresh Enquiry - ${selectedProduct?.variety ?? "Mirchi Powder"}`
        })
      });

      if (!response.ok) {
        throw new Error("Could not send enquiry");
      }

      form.reset();
      setMessage(`Enquiry sent to ${companyEmail}. If this is the first test, check that Gmail inbox for a FormSubmit activation email too.`);
    } catch {
      setMessage(`Could not send automatically. Please email ${companyEmail} or call ${companyPhone}.`);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="overflow-hidden shadow-premium">
      <form onSubmit={submitOrder} className="grid gap-0 lg:grid-cols-[1fr_0.75fr]">
        <div className="p-6 md:p-8">
          <h2 className="font-display text-3xl font-black tracking-tight text-zinc-950">Enquiry details</h2>
          <p className="mt-2 text-sm font-semibold text-zinc-500">Share your contact details and our team will respond.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-700">
              Name
              <input required name="customerName" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zestRed focus:ring-4 focus:ring-red-100" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-700">
              Phone number
              <input required type="tel" name="phone" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zestRed focus:ring-4 focus:ring-red-100" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-700">
              Email
              <input required type="email" name="email" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zestRed focus:ring-4 focus:ring-red-100" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-700">
              Place
              <input required name="place" placeholder="City / Area" className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zestRed focus:ring-4 focus:ring-red-100" />
            </label>
          </div>

          {message && <p className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-zestGreen">{message}</p>}

          <button disabled={isSending} type="submit" className="mt-6 inline-flex items-center rounded-full bg-zestRed px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-1 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70">
            <Send size={18} className="mr-2" aria-hidden="true" />
            {isSending ? "Sending..." : "Enquire Now"}
          </button>
        </div>

        <aside className="bg-zinc-950 p-6 text-white md:p-8">
          <div className="rounded-[1.5rem] bg-white/10 p-5">
            <ReceiptText className="h-8 w-8 text-zestOrange" aria-hidden="true" />
            <h3 className="font-display mt-4 text-2xl font-black">Enquiry summary</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-300">Selected product</span>
                <span className="text-right font-black">{selectedProduct?.variety}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-300">Response</span>
                <span className="text-right font-black text-zestOrange">Team will contact you</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-white/10 p-5 text-sm leading-7 text-zinc-200">
            Submit your details and the ZestFresh team will contact you with availability, product information, and next steps.
          </div>

          <div className="mt-5 space-y-3 text-sm font-bold text-zinc-100">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
              <MapPin className="h-5 w-5 text-zestOrange" aria-hidden="true" />
              Share your place for enquiry follow-up
            </div>
            <a href={`mailto:${companyEmail}`} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15">
              <Mail className="h-5 w-5 text-zestOrange" aria-hidden="true" />
              {companyEmail}
            </a>
            <a href={`tel:${companyPhone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15">
              <PhoneCall className="h-5 w-5 text-zestOrange" aria-hidden="true" />
              {companyPhone}
            </a>
          </div>
        </aside>
      </form>
    </Card>
  );
}
