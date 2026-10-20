import {
  CustomBlending,
  DataTexture,
  LinearFilter,
  Mesh,
  OneFactor,
  OneMinusSrcAlphaFactor,
  PlaneGeometry,
  ShaderMaterial,
  SrcAlphaFactor,
  Texture,
  Vector3,
  Vector4,
} from "three";
import type { Palette } from "../palette";
import { BLOB_SHAPES, type CoverRequest, type OrbState } from "../scrollProgress";
import { blobFragment, blobVertex } from "../shaders/blob.glsl";
import type { SharedUniforms } from "../uniforms";

/** How fast the orb catches up with its target shapes (1/s). */
const FOLLOW_SPEED = 6;

/**
 * The orb, the page's protagonist: metaball shapes drawn over the whole
 * canvas, eased towards wherever the sections pose them. Drawn last, without
 * depth, blended but kept in the opaque pass like the hero gradient.
 */
export class Blob {
  readonly mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  /** Eased shapes in CSS px: center x, y, half width, half height. */
  private readonly boxes = Array.from({ length: BLOB_SHAPES }, () => new Vector4());
  private readonly corners = new Float32Array(BLOB_SHAPES);
  /** Eased hole in CSS px: center x, y, radius. */
  private readonly hole = new Vector3();
  private isShown = false;
  /** Transparent 1x1 stand-in while no logo is posed. */
  private readonly emptyLogo = new DataTexture(new Uint8Array(4), 1, 1);
  /** One texture per logo image: stepping back to a logo does not upload it again. */
  private readonly logoTextures = new Map<HTMLImageElement, Texture>();
  private logoImage: HTMLImageElement | null = null;

  constructor(palette: Palette, uniforms: SharedUniforms) {
    const material = new ShaderMaterial({
      vertexShader: blobVertex,
      fragmentShader: blobFragment,
      uniforms: {
        uTime: uniforms.uTime,
        uColors: { value: [palette.primary, palette.secondary, palette.info] },
        uBase: { value: palette.primaryDarkest },
        uShapes: { value: Array.from({ length: BLOB_SHAPES }, () => new Vector4()) },
        uCorners: { value: new Float32Array(BLOB_SHAPES) },
        uHole: { value: new Vector3() },
        uGradientSize: { value: 0 },
        uLogo: { value: this.emptyLogo },
        uLogoMix: { value: 0 },
        uLogoBox: { value: new Vector4() },
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
    this.emptyLogo.needsUpdate = true;
    this.mesh = new Mesh(new PlaneGeometry(2, 2), material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
  }

  /**
   * Eases towards the posed `orb`. Locked, or showing up again after being
   * hidden, it jumps there: it must never be seen flying in from a stale place.
   */
  update(deltaSeconds: number, orb: OrbState, canvasHeight: number, pixelRatio: number): void {
    const ease = orb.isLocked || !this.isShown ? 1 : 1 - Math.exp(-deltaSeconds * FOLLOW_SPEED);
    this.isShown = true;
    this.mesh.visible = true;
    const { uShapes, uCorners, uHole, uGradientSize } = this.mesh.material.uniforms;
    uGradientSize.value = 0;
    orb.shapes.forEach((shape, index) => {
      const box = this.boxes[index];
      box.x += (shape.x - box.x) * ease;
      box.y += (shape.y - box.y) * ease;
      box.z += (shape.halfWidth - box.z) * ease;
      box.w += (shape.halfHeight - box.w) * ease;
      this.corners[index] += (shape.corner - this.corners[index]) * ease;
      // Drawing buffer pixels, y up like gl_FragCoord.
      uShapes.value[index].set(
        box.x * pixelRatio,
        (canvasHeight - box.y) * pixelRatio,
        box.z * pixelRatio,
        box.w * pixelRatio,
      );
      uCorners.value[index] = this.corners[index] * pixelRatio;
    });
    const { hole } = this;
    hole.x += (orb.hole.x - hole.x) * ease;
    hole.y += (orb.hole.y - hole.y) * ease;
    hole.z += (orb.hole.radius - hole.z) * ease;
    uHole.value.set(hole.x * pixelRatio, (canvasHeight - hole.y) * pixelRatio, hole.z * pixelRatio);
    this.updateLogo(orb.logo, canvasHeight, pixelRatio);
  }

  /** Uploads the posed logo (once per image) and places its box, in drawing buffer pixels. */
  private updateLogo(logo: OrbState["logo"], canvasHeight: number, pixelRatio: number): void {
    const { uLogo, uLogoMix, uLogoBox } = this.mesh.material.uniforms;
    if (!logo.image) {
      uLogoMix.value = 0;
      return;
    }
    if (this.logoImage !== logo.image) {
      this.logoImage = logo.image;
      let texture = this.logoTextures.get(logo.image);
      if (!texture) {
        texture = new Texture(logo.image);
        texture.minFilter = LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        this.logoTextures.set(logo.image, texture);
      }
      uLogo.value = texture;
    }
    uLogoMix.value = logo.mix;
    uLogoBox.value.set(
      logo.x * pixelRatio,
      (canvasHeight - logo.y) * pixelRatio,
      logo.halfWidth * pixelRatio,
      logo.halfHeight * pixelRatio,
    );
  }

  /**
   * Poses the uniforms as one giant circle, the orb's gradient swollen to it,
   * and shows the mesh. The next `update` poses the real orb again.
   */
  poseCover(request: CoverRequest, canvasHeight: number, pixelRatio: number): void {
    const { uShapes, uCorners, uHole, uGradientSize } = this.mesh.material.uniforms;
    const radius = request.radius * pixelRatio;
    uGradientSize.value = request.gradientSize * pixelRatio;
    uShapes.value.forEach((shape: Vector4, index: number) => {
      const size = index === 0 ? radius : 0;
      shape.set(request.x * pixelRatio, (canvasHeight - request.y) * pixelRatio, size, size);
      uCorners.value[index] = size;
    });
    uHole.value.set(0, 0, 0);
    this.mesh.material.uniforms.uLogoMix.value = 0;
    this.mesh.visible = true;
  }

  hide(): void {
    this.isShown = false;
    this.mesh.visible = false;
  }

  dispose(): void {
    this.emptyLogo.dispose();
    this.logoTextures.forEach((texture) => texture.dispose());
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
