import { ArticlesListClient } from "./articles-list-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Articles",
  description:
    "Editorial articles and dataset-backed directory notes for England and Wales prison listings.",
  path: "/articles",
});

export default function ArticlesPage() {
  return <ArticlesListClient />;
}
