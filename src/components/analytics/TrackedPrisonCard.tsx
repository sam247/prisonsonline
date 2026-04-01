"use client";

import Link from "next/link";
import { PrisonCardContent } from "@/components/PrisonCard";
import { sendGtagEvent } from "@/lib/analytics/gtag";
import type { Prison } from "@/types/prison";

export function TrackedPrisonCard({
  prison,
  listName,
  variant = "default",
}: {
  prison: Prison;
  listName: string;
  variant?: "default" | "compact";
}) {
  const href = `/prisons/${prison.countrySlug}/${prison.slug}`;
  return (
    <Link
      href={href}
      onClick={() =>
        sendGtagEvent("select_content", {
          content_type: "prison_profile",
          item_id: prison.slug,
          item_list_name: listName,
        })
      }
    >
      <PrisonCardContent prison={prison} variant={variant} />
    </Link>
  );
}
