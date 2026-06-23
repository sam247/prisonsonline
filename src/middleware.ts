import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const retiredLegacyPaths = new Set([
  "/behind-bars-in-japan-a-look-inside-the-countrys-prison-system",
  "/a-guide-to-the-pre-sentence-investigation-psi-report",
  "/how-to-become-a-prison-officer",
  "/the-uks-most-dangerous-prisoners-2023",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (retiredLegacyPaths.has(pathname)) {
    return new NextResponse(
      "This legacy page has been retired. Use /guides, /articles, or /prisons for current content.",
      {
        status: 410,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/behind-bars-in-japan-a-look-inside-the-countrys-prison-system",
    "/a-guide-to-the-pre-sentence-investigation-psi-report",
    "/how-to-become-a-prison-officer",
    "/the-uks-most-dangerous-prisoners-2023",
  ],
};
