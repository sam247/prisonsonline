"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { sendGtagEvent } from "@/lib/analytics/gtag";

export function TrackedContentLink({
  href,
  className,
  children,
  contentType,
  itemId,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  contentType: "guide" | "article";
  itemId: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        sendGtagEvent("select_content", {
          content_type: contentType,
          item_id: itemId,
        })
      }
    >
      {children}
    </Link>
  );
}
