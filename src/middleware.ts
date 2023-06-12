import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/"],
  afterAuth(auth, req, evt) {
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/") ||
      req.nextUrl.pathname.startsWith("/sign-in");
    // handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    if (isAuthPage) {
      if (auth.userId) {
        return NextResponse.redirect(new URL("/home", req.url));
      }
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};