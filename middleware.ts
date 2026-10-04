import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/tasks", "/settings"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res; // not configured yet: let pages render their own error

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  if (!user && PROTECTED.some((p) => path.startsWith(p))) return NextResponse.redirect(new URL("/login", req.url));
  if (user && (path === "/login" || path === "/signup")) return NextResponse.redirect(new URL("/dashboard", req.url));
  return res;
}

export const config = { matcher: ["/dashboard/:path*", "/tasks/:path*", "/settings/:path*", "/login", "/signup"] };
