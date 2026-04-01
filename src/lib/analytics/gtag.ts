export const GA_MEASUREMENT_ID =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    : "G-RCEGDLDF2C";

export function sendGtagEvent(name: string, params?: Record<string, string | number | boolean | undefined>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const cleaned = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
    : undefined;
  window.gtag("event", name, cleaned);
}

export function sendGtagPagePath(pagePath: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: pagePath });
}
