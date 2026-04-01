"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { GoogleAnalyticsRouteListener } from "@/components/analytics/GoogleAnalyticsRouteListener";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <Suspense fallback={null}>
        <GoogleAnalyticsRouteListener />
      </Suspense>
      {children}
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}
