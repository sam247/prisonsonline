"use client";

import Link from "next/link";
import type { ComponentProps, MouseEventHandler } from "react";
import { sendGtagEvent } from "@/lib/analytics/gtag";

type Props = ComponentProps<typeof Link> & {
  eventName: string;
  eventParams: Record<string, string | number | boolean | undefined>;
};

export function TrackedLink({ eventName, eventParams, onClick, ...props }: Props) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    sendGtagEvent(eventName, eventParams);
    onClick?.(event);
  };
  return <Link {...props} onClick={handleClick} />;
}
