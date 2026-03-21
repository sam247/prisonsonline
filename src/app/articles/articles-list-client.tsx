"use client";

import { useState } from "react";
import Link from "next/link";
import { allArticles, getMergedArticleCategories } from "@/data/articles.merge";
import { isGeneratedArticle } from "@/types/siteArticle";
import type { SiteArticle } from "@/types/siteArticle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditorialImageBlock } from "@/components/media/EditorialImageBlock";
import { getArticleCoverImage } from "@/lib/media/resolvers";

function listExcerpt(article: SiteArticle): string {
  return isGeneratedArticle(article) ? article.description : article.excerpt;
}

type SourceFilter = "all" | "manual" | "generated";

export function ArticlesListClient() {
  const categories = getMergedArticleCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const filtered = allArticles.filter((a) => {
    if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
    if (sourceFilter === "manual" && a.sourceType !== "manual") return false;
    if (sourceFilter === "generated" && a.sourceType !== "generated") return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Articles</h1>
          <p className="text-primary-foreground/70 max-w-2xl">
            Editorial features and dataset-backed directory notes for England and Wales listings.
          </p>
        </div>
      </section>

      <div className="container py-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-full sm:w-auto">
            Type
          </span>
          {(
            [
              ["all", "All"],
              ["manual", "Editorial"],
              ["generated", "Directory notes"],
            ] as const
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => setSourceFilter(key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                sourceFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((article) => {
            const cover = getArticleCoverImage(article);
            return (
            <Link key={article.slug} href={`/articles/${article.slug}`}>
              <Card className="border-border/60 hover:shadow-md transition-all duration-200 overflow-hidden sm:flex sm:flex-row">
                {cover && (
                  <div className="w-full sm:w-44 md:w-52 shrink-0 border-b sm:border-b-0 sm:border-r border-border/50 bg-muted">
                    <EditorialImageBlock
                      image={cover}
                      aspectClassName="aspect-video"
                      sizes="(max-width: 640px) 100vw, 208px"
                      className="rounded-none border-0 sm:border-y-0 sm:border-l-0 sm:border-r border-border/50"
                    />
                  </div>
                )}
                <CardContent className="p-6 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                        {isGeneratedArticle(article) && (
                          <Badge variant="outline" className="text-xs">
                            Dataset-backed
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{listExcerpt(article)}</p>
                    </div>
                  </div>
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
