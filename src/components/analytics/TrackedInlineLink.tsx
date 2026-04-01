"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { sendGtagEvent } from "@/lib/analytics/gtag";

export function TrackedInlineLink({
  href,
  className,
  children,
  itemId,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  itemId: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        sendGtagEvent("select_content", {
          content_type: "nav",
          item_id: itemId,
        })
      }
    >
      {children}
    </Link>
  );
}
