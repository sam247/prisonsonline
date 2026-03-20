import { Card, CardContent } from "@/components/ui/card";
import { Globe, BookOpen, Users, Shield } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "About Prisons Online",
  description: "A global prison directory and information resource.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">About Prisons Online</h1>
          <p className="text-primary-foreground/70">A global prison directory and information resource</p>
        </div>
      </section>

      <div className="container py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Prisons Online provides factual, neutral, and comprehensive information about prisons and prison systems around the world. We aim to be the most reliable resource for anyone seeking to understand how prisons operate, where they are located, and what life inside them is like.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our content is designed for families of inmates, researchers, students, legal professionals, and anyone with a legitimate interest in understanding the criminal justice system. We do not sensationalise crime or prison life.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">What We Provide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Globe,
                  title: "Global Prison Directory",
                  desc: "Searchable database of prisons across multiple countries with detailed profiles.",
                },
                {
                  icon: BookOpen,
                  title: "Information Guides",
                  desc: "Practical guides on visits, sentences, prisoner rights, and daily life.",
                },
                {
                  icon: Users,
                  title: "Family Resources",
                  desc: "Support and information for families and partners of inmates.",
                },
                {
                  icon: Shield,
                  title: "Factual Reporting",
                  desc: "Neutral, evidence-based articles on prison systems and criminal justice.",
                },
              ].map((item) => (
                <Card key={item.title} className="border-border/60">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-3">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Editorial Standards</h2>
            <p className="text-muted-foreground leading-relaxed">
              All information on Prisons Online is researched from official sources including government prison services, correctional departments, and verified public records. We regularly review and update our content to ensure accuracy. Our tone is neutral and informational — we present facts without editorial bias.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
