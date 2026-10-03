"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { createImageUploadUrl } from "@/app/admin/(panel)/upload-actions";
import {
  CV_ASSETS_BUCKET,
  IMAGE_ACCEPT,
  IMAGE_FORMAT_ERROR,
  IMAGE_HINT,
  IMAGE_SIZE_ERROR,
  type ImageKind,
  MAX_IMAGE_BYTES,
  isImageMime,
} from "@/lib/admin/image";
import { createPublicClient } from "@/lib/supabase/public";

import { useAdminForm } from "./AdminForm";
import { CheckboxField } from "./fields";
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS } from "./styles";

/** Client-side pre-check for instant feedback; the server re-validates everything. */
function validateImageFile(file: File): string | null {
  if (!isImageMime(file.type)) return IMAGE_FORMAT_ERROR;
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_SIZE_ERROR;
  return null;
}

let storageClient: ReturnType<typeof createPublicClient> | null = null;

/** Sends the file straight to Storage through a one-shot signed URL issued by the server. */
async function uploadImage(file: File, kind: ImageKind): Promise<string> {
  const upload = await createImageUploadUrl({ kind, mime: file.type, size: file.size });
  if ("error" in upload) throw new Error(upload.error);
  // One client per page: each instance registers its own auth listener.
  storageClient ??= createPublicClient();
  const { error } = await storageClient.storage
    .from(CV_ASSETS_BUCKET)
    .uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type });
  if (error) throw new Error("L'envoi de l'image a échoué.");
  return upload.path;
}

interface ImageFieldProps {
  kind: ImageKind;
  label: string;
  currentUrl: string | null;
}

/**
 * The file input has no `name`: the file goes to Storage first, and only its
 * generated storage name (`image_path`) is submitted with the form.
 */
export function ImageField({ kind, label, currentUrl }: ImageFieldProps) {
  const { fieldErrors, setIsUploading } = useAdminForm();
  const [preview, setPreview] = useState<string | null>(null);
  const [path, setPath] = useState("");
  const [isUploading, setIsFieldUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedErrors, setCheckedErrors] = useState(fieldErrors);
  const [inputKey, setInputKey] = useState(0);
  const shownError = error ?? fieldErrors.image;

  // A rejected upload has been deleted server-side: forget it (a new key also
  // empties the file input) so it is never submitted again.
  if (checkedErrors !== fieldErrors) {
    setCheckedErrors(fieldErrors);
    if (fieldErrors.image) {
      setPath("");
      setPreview(null);
      setInputKey((key) => key + 1);
    }
  }

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    setPath("");
    setPreview(null);
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    setIsUploading(true);
    setIsFieldUploading(true);
    try {
      setPath(await uploadImage(file, kind));
      setPreview(URL.createObjectURL(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "L'envoi de l'image a échoué.");
    } finally {
      setIsUploading(false);
      setIsFieldUploading(false);
    }
  }

  const shownUrl = preview ?? currentUrl;
  const status = isUploading
    ? "Envoi de l'image…"
    : path && "Image prête, enregistre pour l'appliquer.";
  return (
    <fieldset className="grid gap-3">
      <legend className={LABEL_CLASS}>{label}</legend>
      {shownUrl && (
        <Image
          src={shownUrl}
          alt=""
          width={96}
          height={96}
          unoptimized
          className="size-24 rounded-xl bg-surface-raised object-contain"
        />
      )}
      <div>
        <label htmlFor={`${kind}-file`} className="font-medium">
          {currentUrl ? "Remplacer l'image" : "Choisir une image"}
        </label>
        <input
          key={inputKey}
          id={`${kind}-file`}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleChange}
          aria-describedby={`${kind}-hint${shownError ? ` ${kind}-error` : ""}`}
          aria-invalid={!!shownError}
          className="mt-1 block min-h-11 w-full py-2"
        />
        <p id={`${kind}-hint`} className={HINT_CLASS}>
          {IMAGE_HINT}
        </p>
        <p role="status" className={HINT_CLASS}>
          {status}
        </p>
        {shownError && (
          <p id={`${kind}-error`} className={ERROR_CLASS}>
            {shownError}
          </p>
        )}
      </div>
      <input type="hidden" name="image_path" value={path} />
      {currentUrl && !path && (
        <CheckboxField name="remove_image" label="Retirer l'image actuelle" />
      )}
    </fieldset>
  );
}
