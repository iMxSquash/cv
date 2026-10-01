import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Anonymous client for public reads only: RLS exposes just `visible = true` rows.
export function createPublicClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey, { auth: { persistSession: false } });
}
