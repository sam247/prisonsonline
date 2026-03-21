import type { ReactNode } from "react";
import Link from "next/link";
import { guides } from "@/data/guides";
import { Card, CardContent } from "@/components/ui/card";
import { EditorialImageBlock } from "@/components/media/EditorialImageBlock";
import { getGuideCoverImage } from "@/lib/media/resolvers";
import { BookOpen, Users, Building2, Scale, Clock, Shield, FileText } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Prison Information Guides",
  description: "Helpful resources for understanding how the prison system works.",
  path: "/guides",
});

const iconMap: Record<string, ReactNode> = {
  Users: <Users className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Scale: <Scale className="h-6 w-6" />,
  Clock: <Clock className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
};

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Prison Information Guides</h1>
          <p className="text-primary-foreground/70">Helpful resources for understanding how the prison system works</p>
        </div>
      </section>
      <div className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide) => {
            const cover = getGuideCoverImage(guide.slug);
            return (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <Card className="h-full group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60 overflow-hidden">
                  {cover && (
                    <EditorialImageBlock
                      image={cover}
                      aspectClassName="aspect-[2.2/1]"
                      sizes="(max-width: 640px) 100vw, 380px"
                      className="rounded-t-lg rounded-b-none border-x-0 border-t-0 border-b border-border/50"
                    />
                  )}
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent mb-4">
                      {iconMap[guide.icon] || <BookOpen className="h-6 w-6" />}
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors mb-2">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{guide.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
