"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { sendGtagEvent } from "@/lib/analytics/gtag";

export function TrackedCtaLink({
  href,
  className,
  children,
  promotionName,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  promotionName: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        sendGtagEvent("select_promotion", {
          promotion_name: promotionName,
          link_url: href,
        })
      }
    >
      {children}
    </Link>
  );
}
