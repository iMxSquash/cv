"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { z } from "zod";

import { requireAdminAction } from "@/lib/admin/auth";
import type { EntitySlug } from "@/lib/admin/entities";
import { INVALID_FORM, SAVE_FAILED, type FormState } from "@/lib/admin/form-state";
import { type ImageKind, storagePathFromUrl } from "@/lib/admin/image";
import {
  nextSortOrder,
  publicUrlOf,
  removeFromBucket,
  revalidateCv,
  verifyUploadedImage,
} from "@/lib/admin/mutations";
import {
  educationSchema,
  experienceSchema,
  languageSchema,
  linkSchema,
  mobilitySchema,
  profileSchema,
  readFormValues,
  skillSchema,
  toFieldErrors,
  toolSchema,
} from "@/lib/cv/schemas";
import type { Database } from "@/lib/database.types";

type Supabase = SupabaseClient<Database>;

type Parsed<T> = { data: T } | { state: FormState };

function parse<S extends z.ZodType>(schema: S, formData: FormData): Parsed<z.output<S>> {
  const result = schema.safeParse(readFormValues(formData));
  if (result.success) return { data: result.data };
  return { state: { ...INVALID_FORM, fieldErrors: toFieldErrors(result.error) } };
}

/**
 * Image change requested by a form: a freshly uploaded file (`image_path`,
 * checked byte by byte), a removal (`remove_image`), or nothing.
 */
type ImageChange =
  { kind: "unchanged" } | { kind: "removed" } | { kind: "replaced"; path: string; url: string };

async function readImageChange(
  supabase: Supabase,
  formData: FormData,
  imageKind: ImageKind,
): Promise<ImageChange | { error: FormState }> {
  const path = readFormValues(formData).image_path ?? "";
  if (path) {
    if (!(await verifyUploadedImage(supabase, path, imageKind))) {
      return { error: { fieldErrors: { image: "Le fichier envoyé n'est pas une image valide." } } };
    }
    return { kind: "replaced", path, url: publicUrlOf(supabase, path) };
  }
  return formData.get("remove_image") === "on" ? { kind: "removed" } : { kind: "unchanged" };
}

function imageColumnValue(change: ImageChange): string | null | undefined {
  if (change.kind === "replaced") return change.url;
  if (change.kind === "removed") return null;
  return undefined;
}

type WriteResult = { error: { message: string } | null };

/** Logs a failed write, or refreshes the site and goes back to the list. */
function finish(entity: EntitySlug, id: string | null, { error }: WriteResult): FormState {
  if (error) {
    console.error(`Failed to save ${entity}/${id ?? "new"}: ${error.message}`);
    return SAVE_FAILED;
  }
  revalidateCv();
  redirect(`/admin/${entity}`);
}

/**
 * Runs a row write that may carry a new image: the new file is dropped if the
 * write fails, the replaced one once it succeeds (no orphans either way). The
 * current image URL is only read when the image actually changes.
 */
async function writeWithImage(
  supabase: Supabase,
  formData: FormData,
  imageKind: ImageKind,
  readPreviousUrl: () => PromiseLike<string | null>,
  write: (imageUrl: string | null | undefined) => PromiseLike<WriteResult>,
): Promise<WriteResult | { state: FormState }> {
  const image = await readImageChange(supabase, formData, imageKind);
  if ("error" in image) return { state: image.error };
  const previousUrl = image.kind === "unchanged" ? null : await readPreviousUrl();

  const result = await write(imageColumnValue(image));
  if (result.error) {
    if (image.kind === "replaced") await removeFromBucket(supabase, image.path);
    return result;
  }
  const previousPath = previousUrl ? storagePathFromUrl(previousUrl) : null;
  if (previousPath) await removeFromBucket(supabase, previousPath);
  return result;
}

export async function saveProfile(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const parsed = parse(profileSchema, formData);
  if ("state" in parsed) return parsed.state;

  const result = await writeWithImage(
    supabase,
    formData,
    "avatar",
    async () =>
      (await supabase.from("cv_profile").select("avatar_url").single()).data?.avatar_url ?? null,
    (avatarUrl) =>
      supabase
        .from("cv_profile")
        .update({ ...parsed.data, avatar_url: avatarUrl })
        .eq("id", 1),
  );
  if ("state" in result) return result.state;
  if (result.error) {
    console.error(`Failed to save cv_profile: ${result.error.message}`);
    return SAVE_FAILED;
  }

  revalidateCv();
  return { isSuccess: true, message: "Profil enregistré." };
}

export async function saveExperience(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const parsed = parse(experienceSchema, formData);
  if ("state" in parsed) return parsed.state;

  const table = "cv_experiences";
  // A failed read only leaves the replaced file orphaned (logged), never a broken row.
  const readPreviousUrl = async () =>
    id
      ? ((await supabase.from(table).select("logo_url").eq("id", id).single()).data?.logo_url ??
        null)
      : null;

  const result = await writeWithImage(
    supabase,
    formData,
    "experience",
    readPreviousUrl,
    async (logoUrl) => {
      const values = { ...parsed.data, logo_url: logoUrl };
      return id
        ? supabase.from(table).update(values).eq("id", id)
        : supabase
            .from(table)
            .insert({ ...values, sort_order: await nextSortOrder(supabase, table) });
    },
  );
  return "state" in result ? result.state : finish("experiences", id, result);
}

export async function saveEducation(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const parsed = parse(educationSchema, formData);
  if ("state" in parsed) return parsed.state;

  const table = "cv_education";
  // A failed read only leaves the replaced file orphaned (logged), never a broken row.
  const readPreviousUrl = async () =>
    id
      ? ((await supabase.from(table).select("logo_url").eq("id", id).single()).data?.logo_url ??
        null)
      : null;

  const result = await writeWithImage(
    supabase,
    formData,
    "education",
    readPreviousUrl,
    async (logoUrl) => {
      const values = { ...parsed.data, logo_url: logoUrl };
      return id
        ? supabase.from(table).update(values).eq("id", id)
        : supabase
            .from(table)
            .insert({ ...values, sort_order: await nextSortOrder(supabase, table) });
    },
  );
  return "state" in result ? result.state : finish("education", id, result);
}

export async function saveSkill(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const parsed = parse(skillSchema, formData);
  if ("state" in parsed) return parsed.state;

  const table = "cv_skills";
  const sortOrder = id ? undefined : await nextSortOrder(supabase, table, parsed.data.category);
  const result = id
    ? await supabase.from(table).update(parsed.data).eq("id", id)
    : await supabase.from(table).insert({ ...parsed.data, sort_order: sortOrder });
  return finish("skills", id, result);
}

export async function saveTool(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const parsed = parse(toolSchema, formData);
  if ("state" in parsed) return parsed.state;

  const table = "cv_tools";
  const result = id
    ? await supabase.from(table).update(parsed.data).eq("id", id)
    : await supabase
        .from(table)
        .insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, table) });
  return finish("tools", id, result);
}

export async function saveLanguage(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const parsed = parse(languageSchema, formData);
  if ("state" in parsed) return parsed.state;

  const table = "cv_languages";
  const result = id
    ? await supabase.from(table).update(parsed.data).eq("id", id)
    : await supabase
        .from(table)
        .insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, table) });
  return finish("languages", id, result);
}

export async function saveLink(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const parsed = parse(linkSchema, formData);
  if ("state" in parsed) return parsed.state;

  const table = "cv_links";
  const result = id
    ? await supabase.from(table).update(parsed.data).eq("id", id)
    : await supabase
        .from(table)
        .insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, table) });
  return finish("links", id, result);
}

export async function saveMobility(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const parsed = parse(mobilitySchema, formData);
  if ("state" in parsed) return parsed.state;

  const table = "cv_mobility";
  const result = id
    ? await supabase.from(table).update(parsed.data).eq("id", id)
    : await supabase
        .from(table)
        .insert({ ...parsed.data, sort_order: await nextSortOrder(supabase, table) });
  return finish("mobility", id, result);
}
