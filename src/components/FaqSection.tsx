"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Faq } from "@/data/guides";

interface FaqSectionProps {
  faqs: Faq[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-foreground hover:text-accent">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
