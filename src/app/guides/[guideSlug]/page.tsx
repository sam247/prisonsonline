import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, guides } from "@/data/guides";
import { FaqSection } from "@/components/FaqSection";
import { ChevronRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: { guideSlug: string } };

export function generateStaticParams() {
  return guides.map((g) => ({ guideSlug: g.slug }));
}

export function generateMetadata({ params }: Props) {
  const guide = getGuide(params.guideSlug);
  if (!guide) {
    return buildPageMetadata({ title: "Guide not found", path: `/guides/${params.guideSlug}` });
  }
  return buildPageMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/guides/${guide.slug}`,
  });
}

export default function GuideDetailPage({ params }: Props) {
  const guide = getGuide(params.guideSlug);
  if (!guide) notFound();

  return (
    <div className="min-h-screen">
      <div className="border-b bg-card">
        <div className="container py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/guides" className="hover:text-foreground transition-colors">
              Guides
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{guide.title}</span>
          </nav>
        </div>
      </div>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold">{guide.title}</h1>
        </div>
      </section>
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          {guide.content.split("\n\n").map((para, i) => {
            if (para.startsWith("## ")) {
              return (
                <h2 key={i} className="text-xl font-bold mt-8 mb-4 text-foreground">
                  {para.replace("## ", "")}
                </h2>
              );
            }
            if (para.startsWith("- ")) {
              return (
                <ul key={i} className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {para.split("\n").map((item, j) => (
                    <li
                      key={j}
                      dangerouslySetInnerHTML={{
                        __html: item
                          .replace("- ", "")
                          .replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>"),
                      }}
                    />
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                {para}
              </p>
            );
          })}
          <FaqSection faqs={guide.faqs} />
        </div>
      </div>
    </div>
  );
}
