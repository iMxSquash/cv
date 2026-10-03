"use server";

import { redirect } from "next/navigation";

import { requireAdminAction } from "@/lib/admin/auth";
import { ADMIN_ENTITIES, type EntitySlug, parseEntity } from "@/lib/admin/entities";
import { storagePathFromUrl } from "@/lib/admin/image";
import { removeFromBucket, revalidateCv } from "@/lib/admin/mutations";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/paths";

// Arguments of a bound Server Action still come from the request: re-validate them.
function assertEntity(value: string): EntitySlug {
  const entity = parseEntity(value);
  if (!entity) throw new Error(`Unknown admin entity: "${value}"`);
  return entity;
}

export async function logout(): Promise<void> {
  const { supabase } = await requireAdminAction();
  await supabase.auth.signOut();
  redirect(ADMIN_LOGIN_PATH);
}

export async function toggleVisible(entityParam: string, id: string): Promise<void> {
  const { table } = ADMIN_ENTITIES[assertEntity(entityParam)];
  const { supabase } = await requireAdminAction();

  const { data, error } = await supabase.from(table).select("visible").eq("id", id).single();
  if (error) throw new Error(`Failed to read ${table}/${id}: ${error.message}`);

  const { error: updateError } = await supabase
    .from(table)
    .update({ visible: !data.visible })
    .eq("id", id);
  if (updateError) throw new Error(`Failed to toggle ${table}/${id}: ${updateError.message}`);

  revalidateCv();
}

export async function moveItem(
  entityParam: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const { table } = ADMIN_ENTITIES[assertEntity(entityParam)];
  const { supabase } = await requireAdminAction();

  // Skills are ordered within their category: only swap with a neighbour of the same one.
  let siblings;
  if (table === "cv_skills") {
    const { data: skill, error } = await supabase
      .from("cv_skills")
      .select("category")
      .eq("id", id)
      .single();
    if (error) throw new Error(`Failed to read cv_skills/${id}: ${error.message}`);
    siblings = await supabase
      .from("cv_skills")
      .select("id")
      .eq("category", skill.category)
      .order("sort_order")
      .order("created_at");
  } else {
    siblings = await supabase.from(table).select("id").order("sort_order").order("created_at");
  }
  if (siblings.error) throw new Error(`Failed to list ${table}: ${siblings.error.message}`);

  const rows = siblings.data;
  const from = rows.findIndex((row) => row.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= rows.length) return;

  const reordered = [...rows];
  [reordered[from], reordered[to]] = [reordered[to], reordered[from]];

  // Rewriting every rank (not swapping two) also repairs rows sharing the same sort_order.
  const results = await Promise.all(
    reordered.map((row, index) =>
      supabase.from(table).update({ sort_order: index }).eq("id", row.id),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(`Failed to reorder ${table}: ${failed.error.message}`);

  revalidateCv();
}

export async function deleteItem(entityParam: string, id: string): Promise<void> {
  const entity = assertEntity(entityParam);
  const { table } = ADMIN_ENTITIES[entity];
  const { supabase } = await requireAdminAction();

  const { data, error } = await supabase.from(table).delete().eq("id", id).select().single();
  if (error) throw new Error(`Failed to delete ${table}/${id}: ${error.message}`);

  // Row first: a failure here leaves an orphan file, never a row pointing at a missing image.
  const logoUrl = "logo_url" in data ? data.logo_url : null;
  const path = logoUrl ? storagePathFromUrl(logoUrl) : null;
  if (path) await removeFromBucket(supabase, path);

  revalidateCv();
  redirect(`/admin/${entity}`);
}
