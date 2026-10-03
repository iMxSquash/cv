import { describe, expect, it } from "vitest";

import { createUploadPath, detectImageMime, isValidUploadPath, storagePathFromUrl } from "./image";

const bytes = (...values: number[]) => new Uint8Array(values);
const ascii = (text: string) => Array.from(text, (char) => char.charCodeAt(0));

describe("detectImageMime", () => {
  it("recognizes PNG", () => {
    expect(detectImageMime(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe(
      "image/png",
    );
  });

  it("recognizes JPEG", () => {
    expect(detectImageMime(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0))).toBe(
      "image/jpeg",
    );
  });

  it("recognizes WebP", () => {
    const header = [...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")];
    expect(detectImageMime(new Uint8Array(header))).toBe("image/webp");
  });

  it("recognizes AVIF", () => {
    const header = [0, 0, 0, 0x1c, ...ascii("ftyp"), ...ascii("avif")];
    expect(detectImageMime(new Uint8Array(header))).toBe("image/avif");
  });

  it("rejects SVG even when it claims to be an image", () => {
    expect(detectImageMime(new Uint8Array(ascii("<svg xmlns='http://www.w3.org")))).toBeNull();
  });

  it("rejects empty and truncated input", () => {
    expect(detectImageMime(new Uint8Array())).toBeNull();
    expect(detectImageMime(bytes(0x89, 0x50))).toBeNull();
  });
});

describe("createUploadPath and isValidUploadPath", () => {
  it("generates a name that passes validation for its own kind only", () => {
    const path = createUploadPath("experience", "image/webp");
    expect(path).toMatch(/^experience-.+\.webp$/);
    expect(isValidUploadPath(path, "experience")).toBe(true);
    expect(isValidUploadPath(path, "avatar")).toBe(false);
  });

  it("rejects traversal, folders, original names and SVG", () => {
    const uuid = "0f8fad5b-d9cb-469f-a165-70867728950e";
    expect(isValidUploadPath(`../avatar-${uuid}.png`, "avatar")).toBe(false);
    expect(isValidUploadPath(`dir/avatar-${uuid}.png`, "avatar")).toBe(false);
    expect(isValidUploadPath("avatar-photo.png", "avatar")).toBe(false);
    expect(isValidUploadPath(`avatar-${uuid}.svg`, "avatar")).toBe(false);
  });
});

describe("storagePathFromUrl", () => {
  it("extracts the object name from a cv-assets public URL", () => {
    expect(
      storagePathFromUrl(
        "https://ref.supabase.co/storage/v1/object/public/cv-assets/avatar-x.png?v=1",
      ),
    ).toBe("avatar-x.png");
  });

  it("returns null for another bucket or a foreign URL", () => {
    expect(storagePathFromUrl("https://ref.supabase.co/storage/v1/object/public/logos/a.png")).toBe(
      null,
    );
    expect(storagePathFromUrl("https://example.com/a.png")).toBeNull();
  });
});
