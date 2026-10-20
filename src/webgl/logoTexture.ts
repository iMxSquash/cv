import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RedFormat,
  Texture,
  UnsignedByteType,
  Vector2,
} from "three";
import { LOGO_CONTENT_SHARE, LOGO_FIELD_SIZE, signedDistanceField } from "./logoField";

/** Alpha from which a pixel belongs to the logo. */
const OPAQUE_ALPHA = 128;

export interface LogoTextures {
  /** Signed distance field of the logo's alpha: what the orb morphs through. */
  field: DataTexture;
  /** The logo itself (alpha only is read): what the orb ends up drawn with, as sharp as the image. */
  image: Texture;
  /** Share of the field's side that the logo covers, per axis. */
  fit: Vector2;
  dispose: () => void;
}

/**
 * Textures of a logo: its alpha channel is the mask. Reading the pixels needs a same-origin or
 * CORS-enabled image, otherwise the canvas is tainted and this throws.
 */
export function createLogoTextures(image: HTMLImageElement): LogoTextures {
  const size = LOGO_FIELD_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas unavailable");
  const scale = (LOGO_CONTENT_SHARE * size) / Math.max(image.naturalWidth, image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);

  const { data } = context.getImageData(0, 0, size, size);
  // Texture rows go bottom to top, like gl_FragCoord.
  const mask = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      mask[(size - 1 - y) * size + x] = data[(y * size + x) * 4 + 3] >= OPAQUE_ALPHA ? 1 : 0;
    }
  }

  const field = new DataTexture(
    signedDistanceField(mask, size),
    size,
    size,
    RedFormat,
    UnsignedByteType,
  );
  field.minFilter = LinearFilter;
  field.magFilter = LinearFilter;
  field.generateMipmaps = false;
  field.needsUpdate = true;

  const sharp = new Texture(image);
  sharp.minFilter = LinearMipmapLinearFilter;
  sharp.needsUpdate = true;

  return {
    field,
    image: sharp,
    fit: new Vector2(width / size, height / size),
    dispose: () => {
      field.dispose();
      sharp.dispose();
    },
  };
}
