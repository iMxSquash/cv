import type { SupabaseClient } from "@supabase/supabase-js";

import { ADMIN_ENTITIES, type EntityRow, type EntitySlug } from "@/lib/admin/entities";
import type { Database } from "@/lib/database.types";

type Supabase = SupabaseClient<Database>;

/** Every row, hidden ones included (the admin reads through the `authenticated` policy). */
export async function listEntityRows<K extends EntitySlug>(
  supabase: Supabase,
  entity: K,
): Promise<EntityRow<K>[]> {
  const { table } = ADMIN_ENTITIES[entity];
  let query = supabase.from(table).select("*");
  if (table === "cv_skills") query = query.order("category");
  const { data, error } = await query
    .order("sort_order")
    .order("created_at")
    .overrideTypes<EntityRow<K>[], { merge: false }>();
  if (error) throw new Error(`Failed to list ${table}: ${error.message}`);
  return data;
}

export async function getEntityRow<K extends EntitySlug>(
  supabase: Supabase,
  entity: K,
  id: string,
): Promise<EntityRow<K> | null> {
  const { table } = ADMIN_ENTITIES[entity];
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .limit(1)
    .overrideTypes<EntityRow<K>[], { merge: false }>();
  if (error) throw new Error(`Failed to read ${table}/${id}: ${error.message}`);
  return data[0] ?? null;
}
