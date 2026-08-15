"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Badge, Card } from "@/components/ui";

const faqs = [
  {
    question: "Can ZestFresh supply bulk mirchi powder orders?",
    answer: "Yes. ZestFresh supports bulk enquiries for restaurants, retailers, masala manufacturers, and distributors."
  },
  {
    question: "Which chilli powder variety should I choose?",
    answer: "Choose Teja for high heat, Byadgi or Kashmiri for stronger colour, Guntur Sannam for balanced daily cooking, and Reshampatti for standard consumer packs."
  },
  {
    question: "Do you provide custom grinding and packaging?",
    answer: "Yes. The product catalogue lists available forms such as fine powder, coarse powder, flakes, consumer packs, and bulk packaging options."
  },
  {
    question: "How do I send an enquiry?",
    answer: "Click Enquire Now, enter your name, phone number, email, and place, then send the enquiry email to the ZestFresh team."
  },
  {
    question: "What quality checks are followed before dispatch?",
    answer: "Products are checked for colour, aroma, moisture range, grinding consistency, packing quality, and visible impurities before dispatch."
  },
  {
    question: "Will the team contact me after enquiry?",
    answer: "Yes. The team can contact you using the phone number or email shared in the enquiry form."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <Badge className="border-green-200 bg-green-50 text-zestGreen">FAQ</Badge>
          <h2 className="font-display mt-4 text-4xl font-black tracking-tight text-zinc-950">Common questions</h2>
        </div>
        <Card className="mt-8 overflow-hidden border-red-100">
          <Accordion.Root type="single" collapsible>
            {faqs.map((faq, index) => (
              <Accordion.Item key={faq.question} value={`item-${index}`} className="border-b border-zinc-100 last:border-b-0">
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-5 px-6 py-5 text-left text-lg font-black text-zinc-950 outline-none transition hover:bg-red-50/60 focus:bg-red-50 focus:ring-4 focus:ring-red-100">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 text-zestRed transition group-data-[state=open]:rotate-180" aria-hidden="true" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="bg-white px-6 pb-5 text-base leading-7 text-zinc-600">{faq.answer}</Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Card>
      </div>
    </section>
  );
}
