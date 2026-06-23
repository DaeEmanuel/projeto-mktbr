import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./lib/supabase/env";

function getShortBookSlug(host: string) {
  const hostname = host.split(":")[0].toLowerCase();
  const rootDomains = new Set(["mktbr.site", "www.mktbr.site", "localhost", "127.0.0.1"]);

  if (rootDomains.has(hostname) || !hostname.endsWith(".mktbr.site")) {
    return null;
  }

  const slug = hostname.replace(".mktbr.site", "");
  return /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

export async function proxy(request: NextRequest) {
  const shortBookSlug = getShortBookSlug(request.headers.get("host") || "");

  if (shortBookSlug && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/livros/${shortBookSlug}`;
    return NextResponse.rewrite(url);
  }

  const protectedPath =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/meu-painel") ||
    request.nextUrl.pathname.startsWith("/social-ia/dashboard") ||
    request.nextUrl.pathname.startsWith("/painel") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (!protectedPath) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  let user: unknown = null;

  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  } catch {
    user = null;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};



