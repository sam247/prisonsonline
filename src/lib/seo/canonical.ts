import { getBaseUrl } from "@/lib/site";

export function canonicalUrl(path: string): string {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
