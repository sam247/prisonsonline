"use client";

import { useConsent } from "c15t/next";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-3865452541027172";

type AdSenseUnitProps = {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
};

function AdSenseIns({ slot, className, style }: AdSenseUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const marketingAllowed = useConsent("marketing");

  useEffect(() => {
    if (!marketingAllowed) return;
    const el = insRef.current;
    if (!el) return;
    if (el.getAttribute("data-adsbygoogle-status")) return;
    try {
      const w = window as Window & { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* ignore */
    }
  }, [marketingAllowed]);

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className ?? ""}`.trim()}
      style={{ display: "block", ...style }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

export function AdSenseUnit(props: AdSenseUnitProps) {
  const pathname = usePathname();
  return <AdSenseIns key={`${pathname}-${props.slot}`} {...props} />;
}
