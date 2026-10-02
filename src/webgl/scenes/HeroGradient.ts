import { Mesh, PlaneGeometry, ShaderMaterial } from "three";
import type { Palette } from "../palette";
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

/** Fullscreen animated gradient of the hero, drawn first, without depth. */
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
      },
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(new PlaneGeometry(2, 2), material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
