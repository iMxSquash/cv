import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { ADMIN_LOGIN_PATH } from "@/lib/admin/paths";
import type { Database } from "@/lib/database.types";
import { createServerSupabase } from "@/lib/supabase/server";

interface AdminContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

// `getUser()` revalidates the JWT with Supabase Auth; `getSession()` would only decode the cookie.
// Cached per request: the panel layout and its page share a single Auth round trip.
const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, user: data.user } : null;
});

/** For pages: unauthenticated visitors are sent to the login form. */
export async function requireAdminPage(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) redirect(ADMIN_LOGIN_PATH);
  return context;
}

/** For Server Actions: they are public endpoints, so every one re-checks the session. */
export async function requireAdminAction(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) throw new Error("Unauthorized");
  return context;
}
