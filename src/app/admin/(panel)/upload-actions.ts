"use server";

import { requireAdminAction } from "@/lib/admin/auth";
import {
  CV_ASSETS_BUCKET,
  IMAGE_FORMAT_ERROR,
  IMAGE_SIZE_ERROR,
  MAX_IMAGE_BYTES,
  createUploadPath,
  isImageKind,
  isImageMime,
} from "@/lib/admin/image";

type UploadUrlResult = { error: string } | { path: string; token: string };

/**
 * Step 1 of an upload: the browser then sends the file straight to Storage
 * through this one-shot signed URL (Server Action bodies are capped at 1 MB).
 * The save action checks the stored bytes before using the file.
 */
export async function createImageUploadUrl(input: {
  kind: string;
  mime: string;
  size: number;
}): Promise<UploadUrlResult> {
  const { supabase } = await requireAdminAction();

  if (!isImageKind(input.kind)) return { error: "Type d'image inconnu." };
  if (!isImageMime(input.mime)) return { error: IMAGE_FORMAT_ERROR };
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_IMAGE_BYTES) {
    return { error: IMAGE_SIZE_ERROR };
  }

  const path = createUploadPath(input.kind, input.mime);
  const { data, error } = await supabase.storage.from(CV_ASSETS_BUCKET).createSignedUploadUrl(path);
  if (error) {
    console.error(`Failed to sign an upload URL for ${path}: ${error.message}`);
    return { error: "Impossible de préparer l'envoi de l'image." };
  }
  return { path, token: data.token };
}
