import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_LOGIN_PATH, ADMIN_PATH } from "@/lib/admin/paths";
import { DEFAULT_LOCALE, LOCALE_HEADER, splitLocalePath } from "@/lib/i18n/config";
import { buildCsp, createNonce } from "@/lib/security/csp";
import { getSupabaseEnv } from "@/lib/supabase/env";

const NONCE_HEADER = "x-nonce";
const CSP_HEADER = "Content-Security-Policy";

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}

/**
 * Gates `/admin/*`: refreshes the Supabase session cookies and sends visitors
 * without a user to the login form (and signed-in ones away from it). Not a
 * security boundary on its own: every admin page and Server Action re-checks
 * the user (`lib/admin/auth`).
 */
async function gateAdmin(req: NextRequest, csp: string): Promise<NextResponse> {
  let response = NextResponse.next({ request: req });
  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) req.cookies.set(name, value);
        response = NextResponse.next({ request: req });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const isLoginPage = req.nextUrl.pathname === ADMIN_LOGIN_PATH;
  if (!data.user && !isLoginPage) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, req.url));
  }
  if (data.user && isLoginPage) return NextResponse.redirect(new URL(ADMIN_PATH, req.url));
  response.headers.set(CSP_HEADER, csp);
  return response;
}

/**
 * Sets a per-request nonce CSP: Next reads it from the request headers to
 * stamp its own scripts, and pages read `x-nonce` for their inline ones.
 * Admin requests also go through the session gate.
 *
 * Languages: `/` is French and `/en/...` is English. A prefixed URL is
 * rewritten to its unprefixed route and the locale travels in a request
 * header, so each page exists once. The admin is French only and never
 * reachable through a prefix.
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const nonce = createNonce();
  const { locale, path } = splitLocalePath(req.nextUrl.pathname);
  const isAdmin = isAdminPath(req.nextUrl.pathname);
  const isLocalized = locale !== DEFAULT_LOCALE && !isAdminPath(path);
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === "development",
    supabaseUrl: getSupabaseEnv().url,
    isAdmin,
  });
  req.headers.set(NONCE_HEADER, nonce);
  req.headers.set(CSP_HEADER, csp);
  // Always overwritten: a client-supplied value must never select a locale.
  req.headers.set(LOCALE_HEADER, isLocalized ? locale : DEFAULT_LOCALE);

  if (isAdmin) return gateAdmin(req, csp);

  const response = isLocalized
    ? NextResponse.rewrite(new URL(path, req.url), { request: req })
    : NextResponse.next({ request: req });
  response.headers.set(CSP_HEADER, csp);
  return response;
}

export const config = {
  // Pages only: static assets and metadata files carry no script to protect.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|opengraph-image|sitemap.xml|robots.txt|llms.txt).*)",
  ],
};
