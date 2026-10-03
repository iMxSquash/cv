import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import type { EntityTable } from "@/lib/admin/entities";
import {
  CV_ASSETS_BUCKET,
  IMAGE_EXTENSION_BY_MIME,
  IMAGE_SNIFF_BYTES,
  type ImageKind,
  detectImageMime,
  extensionOf,
  isValidUploadPath,
} from "@/lib/admin/image";
import type { Database } from "@/lib/database.types";

type Supabase = SupabaseClient<Database>;

/** Every public page renders resume data (`/`, `/print`, legal notice): rebuild them all. */
export function revalidateCv(): void {
  revalidatePath("/", "layout");
}

export async function removeFromBucket(supabase: Supabase, path: string): Promise<void> {
  const { error } = await supabase.storage.from(CV_ASSETS_BUCKET).remove([path]);
  if (error) console.warn(`Orphan file left in ${CV_ASSETS_BUCKET}: ${path} (${error.message})`);
}

export function publicUrlOf(supabase: Supabase, path: string): string {
  return supabase.storage.from(CV_ASSETS_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function hasImageBytes(supabase: Supabase, path: string): Promise<boolean> {
  const response = await fetch(publicUrlOf(supabase, path), {
    headers: { Range: `bytes=0-${IMAGE_SNIFF_BYTES - 1}` },
    cache: "no-store",
  });
  if (!response.ok) return false;
  const bytes = new Uint8Array(await response.arrayBuffer()).slice(0, IMAGE_SNIFF_BYTES);
  const mime = detectImageMime(bytes);
  return mime !== null && IMAGE_EXTENSION_BY_MIME[mime] === extensionOf(path);
}

/**
 * The declared MIME type is client-controlled: checks the real bytes of what
 * landed in the bucket, and deletes a rejected file we generated the name of.
 */
export async function verifyUploadedImage(
  supabase: Supabase,
  path: string,
  kind: ImageKind,
): Promise<boolean> {
  if (!isValidUploadPath(path, kind)) return false;
  if (await hasImageBytes(supabase, path)) return true;
  await removeFromBucket(supabase, path);
  return false;
}

/** Rank that puts a new row last (within its skill category for `cv_skills`). */
export async function nextSortOrder(
  supabase: Supabase,
  table: EntityTable,
  category?: Database["public"]["Enums"]["cv_skill_category"],
): Promise<number> {
  const query =
    table === "cv_skills" && category
      ? supabase.from("cv_skills").select("sort_order").eq("category", category)
      : supabase.from(table).select("sort_order");
  const { data, error } = await query.order("sort_order", { ascending: false }).limit(1);
  if (error) throw new Error(`Failed to read the last rank of ${table}: ${error.message}`);
  return (data[0]?.sort_order ?? -1) + 1;
}
