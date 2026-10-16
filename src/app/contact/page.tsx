import { ContactForm } from "@/components/contact/ContactForm";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Contact",
  description: "Contact Prisons Online about the directory, a correction, or your personal information.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Contact</h1>
          <p className="text-primary-foreground/70">Questions, corrections, and privacy requests</p>
        </div>
      </section>
      <div className="container max-w-3xl py-10 space-y-6">
        <p className="text-muted-foreground leading-relaxed">
          Prisons Online is an independent information directory. We cannot look up a prisoner, change an official record, or give legal advice. Use this form for corrections, privacy requests, and general questions about the site.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
