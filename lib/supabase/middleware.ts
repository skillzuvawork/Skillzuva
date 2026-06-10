import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/database";

const ROLE_COOKIE = "sz_role";
const ROLE_COOKIE_MAX_AGE = 60 * 60; // 1 hour

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and fully public pages — no auth needed
  const publicPaths = ["/", "/about", "/contact", "/forgot-password", "/reset-password"];
  const isFullyPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/courses");

  if (
    isFullyPublic ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next({ request });
  }

  // Build response that we'll mutate with cookies
  const response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write to both request and response so the session is forwarded
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: use getUser() not getSession() — validates token server-side
  const { data: { user } } = await supabase.auth.getUser();

  // Not authenticated — redirect to login and clear role cache
  if (!user) {
    // Skip redirecting auth pages themselves (would loop)
    if (pathname === "/login" || pathname === "/signup") {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.cookies.delete(ROLE_COOKIE);
    return res;
  }

  // Read role from cookie cache first — avoids DB hit on every request
  let role = request.cookies.get(ROLE_COOKIE)?.value;

  if (!role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    // Only cache if we got a definitive role — don't cache null/error fallbacks
    if (profile?.role) {
      role = profile.role;
      response.cookies.set(ROLE_COOKIE, role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ROLE_COOKIE_MAX_AGE,
      });
    } else {
      role = "student"; // fallback for routing only, not cached
    }
  }

  // Logged-in user hitting auth pages or bare /dashboard — redirect to their dashboard
  if (pathname === "/login" || pathname === "/signup" || pathname === "/dashboard") {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/dashboard/admin" : "/dashboard/student";
    return NextResponse.redirect(url);
  }

  // Guard: student trying to access admin routes
  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/student";
    return NextResponse.redirect(url);
  }

  // Guard: admin trying to access student routes
  if (pathname.startsWith("/dashboard/student") && role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/admin";
    return NextResponse.redirect(url);
  }

  return response;
}
