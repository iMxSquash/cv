import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_LOGIN_PATH, ADMIN_PATH } from "@/lib/admin/paths";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * First gate of `/admin/*`: refreshes the Supabase session cookies and sends
 * visitors without a user to the login form (and signed-in ones away from it). Not a security boundary on its
 * own: every admin page and Server Action re-checks the user (`lib/admin/auth`).
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
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
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
