import type { SiteArticle } from "@/types/siteArticle";
import { isGeneratedArticle } from "@/types/siteArticle";

const MANUAL_BODY_CLASS = "text-muted-foreground leading-relaxed mb-4";
const SECTION_HEADING = "text-xl font-bold mt-8 mb-4 text-foreground";
const SUB_HEADING = "text-lg font-semibold mt-6 mb-3 text-foreground";

function renderManualContent(content: string) {
  return content.split("\n\n").map((para, i) => {
    if (para.startsWith("## ")) {
      return (
        <h2 key={i} className={SECTION_HEADING}>
          {para.replace("## ", "")}
        </h2>
      );
    }
    if (para.startsWith("### ")) {
      return (
        <h3 key={i} className={SUB_HEADING}>
          {para.replace("### ", "")}
        </h3>
      );
    }
    return (
      <p key={i} className={MANUAL_BODY_CLASS}>
        {para}
      </p>
    );
  });
}

export function ArticleBody({ article }: { article: SiteArticle }) {
  if (isGeneratedArticle(article)) {
    return (
      <div className="max-w-none">
        <p className="text-foreground leading-relaxed mb-8">{article.intro}</p>
        {article.bodySections.map((section) => (
          <section key={section.id} className="mb-8">
            {section.heading && <h2 className={SECTION_HEADING}>{section.heading}</h2>}
            {section.paragraphs.map((p, i) => (
              <p key={i} className={MANUAL_BODY_CLASS}>
                {p}
              </p>
            ))}
          </section>
        ))}
        {article.faqs && article.faqs.length > 0 && (
          <section aria-labelledby="article-faq-heading" className="mt-10 border-t border-border pt-8">
            <h2 id="article-faq-heading" className={SECTION_HEADING}>
              Frequently asked questions
            </h2>
            <dl className="space-y-6">
              {article.faqs.map((f, i) => (
                <div key={i}>
                  <dt className="font-semibold text-foreground mb-2">{f.question}</dt>
                  <dd className="text-muted-foreground leading-relaxed">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    );
  }

  return <div className="max-w-none">{renderManualContent(article.content)}</div>;
}
