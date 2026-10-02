import { Vector2 } from "three";

/** Uniforms shared by every scene object: written by Experience, read by shaders and scenes. */
export interface SharedUniforms {
  /** Seconds since the scene started. */
  uTime: { value: number };
  /** Drawing buffer size in pixels. */
  uResolution: { value: Vector2 };
  /** Pointer position in normalized device coordinates (-1..1, y up). */
  uPointer: { value: Vector2 };
}

export function createSharedUniforms(): SharedUniforms {
  return {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0, 0) },
  };
}
