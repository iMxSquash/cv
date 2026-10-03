// SVG is deliberately absent: stored XSS (see check-security invariants). Same
// list and cap as the `cv-assets` bucket settings, which Storage enforces too.
export const IMAGE_EXTENSION_BY_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

type ImageMime = keyof typeof IMAGE_EXTENSION_BY_MIME;

const MAX_IMAGE_MEGABYTES = 5;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MEGABYTES * 1024 * 1024;

export const IMAGE_HINT = `PNG, JPEG, WebP ou AVIF, ${MAX_IMAGE_MEGABYTES} Mo maximum (pas de SVG).`;
export const IMAGE_FORMAT_ERROR = "Format refusé : PNG, JPEG, WebP ou AVIF.";
export const IMAGE_SIZE_ERROR = `Image trop lourde (${MAX_IMAGE_MEGABYTES} Mo maximum).`;

export const IMAGE_ACCEPT = Object.keys(IMAGE_EXTENSION_BY_MIME).join(",");

export const CV_ASSETS_BUCKET = "cv-assets";

/** What an uploaded image illustrates; also the prefix of its storage name. */
const IMAGE_KINDS = ["avatar", "experience", "education"] as const;

export type ImageKind = (typeof IMAGE_KINDS)[number];

/** Bytes needed by `detectImageMime` to tell every supported format apart. */
export const IMAGE_SNIFF_BYTES = 12;

export function isImageMime(value: string): value is ImageMime {
  return Object.hasOwn(IMAGE_EXTENSION_BY_MIME, value);
}

export function isImageKind(value: string): value is ImageKind {
  return IMAGE_KINDS.some((kind) => kind === value);
}

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

const ascii = (text: string): number[] => Array.from(text, (char) => char.charCodeAt(0));

/** Identifies the real format from magic bytes; the declared MIME type is never trusted. */
export function detectImageMime(bytes: Uint8Array): ImageMime | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) {
    return "image/webp";
  }
  if (
    startsWith(bytes, ascii("ftyp"), 4) &&
    (startsWith(bytes, ascii("avif"), 8) || startsWith(bytes, ascii("avis"), 8))
  ) {
    return "image/avif";
  }
  return null;
}

/** Storage name generated server-side: `{kind}-{uuid}.{ext}`, never the original file name. */
export function createUploadPath(kind: ImageKind, mime: ImageMime): string {
  return `${kind}-${crypto.randomUUID()}.${IMAGE_EXTENSION_BY_MIME[mime]}`;
}

const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const EXTENSIONS_PATTERN = Object.values(IMAGE_EXTENSION_BY_MIME).join("|");

/** True for a name `createUploadPath` could have produced for this kind. */
export function isValidUploadPath(path: string, kind: ImageKind): boolean {
  return new RegExp(`^${kind}-${UUID_PATTERN}\\.(${EXTENSIONS_PATTERN})$`).test(path);
}

export function extensionOf(path: string): string {
  return path.slice(path.lastIndexOf(".") + 1);
}

/** Recovers the object name from a public bucket URL, or null for foreign URLs. */
export function storagePathFromUrl(imageUrl: string): string | null {
  const marker = `/object/public/${CV_ASSETS_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(imageUrl.slice(index + marker.length).split("?")[0]);
}
