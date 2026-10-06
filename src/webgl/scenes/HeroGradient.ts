import {
  CustomBlending,
  Mesh,
  OneFactor,
  OneMinusSrcAlphaFactor,
  PlaneGeometry,
  ShaderMaterial,
  SrcAlphaFactor,
  Vector4,
} from "three";
import type { Palette } from "../palette";
import type { FrameBox } from "../scrollProgress";
import { heroGradientFragment, heroGradientVertex } from "../shaders/heroGradient.glsl";
import type { SharedUniforms } from "../uniforms";

/*
 * Upper bound of the gradient's relative luminance (WCAG, linear space). The
 * hero text is --palette-primary-lightest (needs <= 0.162 for 4.5:1) and the
 * headline --palette-primary-light in display size (needs <= 0.125 for 3:1);
 * 0.11 keeps a margin for the dithering. The CSS fallback
 * (hero-gradient-fallback in globals.css) is scaled to the same cap: update both.
 */
const MAX_GRADIENT_LUMINANCE = 0.11;

/** Covers the whole canvas: no frame measured. */
const NO_FRAME = new Vector4(-1e5, -1e5, 1e5, 1e5);

/**
 * Animated gradient of the hero, drawn first, without depth, inside the hero
 * frame only. Blended but kept in the opaque pass (CustomBlending, not
 * `transparent`), so it still renders before the monogram and the orb.
 */
export class HeroGradient {
  readonly mesh: Mesh<PlaneGeometry, ShaderMaterial>;

  constructor(palette: Palette, uniforms: SharedUniforms) {
    const material = new ShaderMaterial({
      vertexShader: heroGradientVertex,
      fragmentShader: heroGradientFragment,
      uniforms: {
        ...uniforms,
        uBase: { value: palette.primaryDarkest },
        uColors: {
          value: [palette.primary, palette.secondary, palette.info, palette.primaryDark],
        },
        uMaxLuminance: { value: MAX_GRADIENT_LUMINANCE },
        uFrame: { value: NO_FRAME.clone() },
        uFrameRadius: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
      // Premultiplied output over the transparent clear, as the page compositor expects.
      blending: CustomBlending,
      blendSrc: SrcAlphaFactor,
      blendDst: OneMinusSrcAlphaFactor,
      blendSrcAlpha: OneFactor,
      blendDstAlpha: OneMinusSrcAlphaFactor,
    });
    this.mesh = new Mesh(new PlaneGeometry(2, 2), material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1;
  }

  /** Clips the gradient to `frame` (CSS px, null for the whole canvas); `pixelRatio` maps it to the drawing buffer. */
  setFrame(frame: FrameBox | null, canvasHeight: number, pixelRatio: number): void {
    const { uFrame, uFrameRadius } = this.mesh.material.uniforms;
    if (!frame) {
      uFrame.value.copy(NO_FRAME);
      uFrameRadius.value = 0;
      return;
    }
    // gl_FragCoord grows upwards from the bottom of the canvas.
    uFrame.value.set(
      frame.left * pixelRatio,
      (canvasHeight - frame.bottom) * pixelRatio,
      frame.right * pixelRatio,
      (canvasHeight - frame.top) * pixelRatio,
    );
    uFrameRadius.value = frame.radius * pixelRatio;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
