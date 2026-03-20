import Link from "next/link";
import { notFound } from "next/navigation";
import { allArticles, getSiteArticle } from "@/data/articles.merge";
import { getPrison } from "@/data/prisons";
import { getGuide } from "@/data/guides";
import { getProgrammaticCollection } from "@/lib/programmatic/collections";
import { PrisonCard } from "@/components/PrisonCard";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BookOpen, MapPin, ExternalLink } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { articleJsonLd } from "@/lib/seo/articleJsonLd";
import { getBaseUrl } from "@/lib/site";
import { pickMoreArticles } from "@/lib/articles/pickRelatedArticles";
import { isGeneratedArticle } from "@/types/siteArticle";

const RELATED_PRISON_CARD_CAP = 24;

type Props = { params: { articleSlug: string } };

function articleDescription(article: (typeof allArticles)[number]): string {
  return isGeneratedArticle(article) ? article.description : article.excerpt;
}

export function generateStaticParams() {
  return allArticles.map((a) => ({ articleSlug: a.slug }));
}

export function generateMetadata({ params }: Props) {
  const article = getSiteArticle(params.articleSlug);
  if (!article) {
    return buildPageMetadata({ title: "Article not found", path: `/articles/${params.articleSlug}` });
  }
  return buildPageMetadata({
    title: article.title,
    description: articleDescription(article),
    path: `/articles/${article.slug}`,
  });
}

export default function ArticleDetailPage({ params }: Props) {
  const article = getSiteArticle(params.articleSlug);
  if (!article) notFound();

  const base = getBaseUrl();
  const path = `/articles/${article.slug}`;
  const breadcrumbTrail = [
    { name: "Articles", path: "/articles" },
    { name: article.title, path },
  ];
  const breadcrumbLd = breadcrumbJsonLd(breadcrumbTrail, base);
  const articleLd = articleJsonLd({
    headline: article.title,
    description: articleDescription(article),
    path,
    datePublished: `${article.date}T12:00:00.000Z`,
  });

  const relatedPrisons = article.relatedPrisons.map((slug) => getPrison(slug)).filter(Boolean);
  const displayPrisons = relatedPrisons.slice(0, RELATED_PRISON_CARD_CAP);
  const relatedGuides = article.relatedGuides.map((slug) => getGuide(slug)).filter(Boolean);
  const moreArticles = pickMoreArticles(article, allArticles);

  const generated = isGeneratedArticle(article) ? article : null;
  const relatedArticleLinks = generated
    ? generated.relatedArticleSlugs
        .map((slug) => getSiteArticle(slug))
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <div className="border-b bg-card">
        <div className="container py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/articles" className="hover:text-foreground transition-colors">
              Articles
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </div>

      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            {generated && (
              <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">
                Dataset-backed
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 max-w-3xl">{article.title}</h1>
          <p className="text-primary-foreground/70 text-sm">
            {new Date(article.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {generated && (
              <span className="block mt-1 text-primary-foreground/60 max-w-2xl">
                Counts and labels reflect the prison import in this site build. They are not live government
                data.
              </span>
            )}
          </p>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <ArticleBody article={article} />
          </div>

          <div className="space-y-6">
            {generated && generated.hubLinks.length > 0 && (
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    Related listings
                  </h3>
                  <ul className="space-y-3">
                    {generated.hubLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-accent hover:underline inline-flex items-center gap-1"
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {generated && generated.relatedCollections.length > 0 && (
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Thematic collections</h3>
                  <ul className="space-y-3">
                    {generated.relatedCollections.map((slug) => {
                      const spec = getProgrammaticCollection(slug);
                      if (!spec) return null;
                      return (
                        <li key={slug}>
                          <Link
                            href={spec.canonicalPath}
                            className="text-sm text-accent hover:underline"
                          >
                            {spec.breadcrumbLabel ?? spec.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}

            {relatedGuides.length > 0 && (
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Related Guides</h3>
                  <div className="space-y-3">
                    {relatedGuides.map(
                      (guide) =>
                        guide && (
                          <Link
                            key={guide.slug}
                            href={`/guides/${guide.slug}`}
                            className="flex items-center gap-2 text-sm text-accent hover:underline"
                          >
                            <BookOpen className="h-3.5 w-3.5 shrink-0" />
                            {guide.title}
                          </Link>
                        ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {relatedArticleLinks.length > 0 && (
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Related directory articles</h3>
                  <div className="space-y-3">
                    {relatedArticleLinks.map(
                      (a) =>
                        a && (
                          <Link
                            key={a.slug}
                            href={`/articles/${a.slug}`}
                            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {a.title}
                          </Link>
                        ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">More articles</h3>
                <div className="space-y-3">
                  {moreArticles.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/articles/${a.slug}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {a.title}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedPrisons.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-2">Related prisons</h2>
            {relatedPrisons.length > RELATED_PRISON_CARD_CAP && generated?.hubLinks[0] && (
              <p className="text-sm text-muted-foreground mb-6">
                Showing {RELATED_PRISON_CARD_CAP} of {relatedPrisons.length} establishments.{" "}
                <Link href={generated.hubLinks[0].href} className="text-accent font-medium hover:underline">
                  Open the full listing
                </Link>{" "}
                for the complete grid.
              </p>
            )}
            {relatedPrisons.length > RELATED_PRISON_CARD_CAP && !generated?.hubLinks[0] && (
              <p className="text-sm text-muted-foreground mb-6">
                Showing {RELATED_PRISON_CARD_CAP} of {relatedPrisons.length} establishments.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayPrisons.map((p) => p && <PrisonCard key={p.slug} prison={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
