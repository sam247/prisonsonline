"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { sendGtagPagePath } from "@/lib/analytics/gtag";

export function GoogleAnalyticsRouteListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    const q = searchParams.toString();
    const pagePath = q ? `${pathname}?${q}` : pathname;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    sendGtagPagePath(pagePath);
  }, [pathname, searchParams]);

  return null;
}
