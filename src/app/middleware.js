import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  // Exclude public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/chemist/login") ||
    pathname.startsWith("/lab/login")
  ) {
    return NextResponse.next();
  }

  // Get role from cookies
  const role = req.cookies.get("role")?.value || null;

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Chemist routes
  if (pathname.startsWith("/chemist")) {
    if (role !== "chemist") {
      url.pathname = "/chemist/login";
      return NextResponse.redirect(url);
    }
  }

  // Lab routes
  if (pathname.startsWith("/lab")) {
    if (role !== "lab") {
      url.pathname = "/lab/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Apply middleware to all dashboard routes
export const config = {
  matcher: ["/admin/:path*", "/chemist/:path*", "/lab/:path*"],
};
