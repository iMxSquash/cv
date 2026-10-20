import {
  CustomBlending,
  DataTexture,
  Mesh,
  OneFactor,
  OneMinusSrcAlphaFactor,
  PlaneGeometry,
  ShaderMaterial,
  SrcAlphaFactor,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import type { Palette } from "../palette";
import { createLogoTextures, type LogoTextures } from "../logoTexture";
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
  /** One distance field per logo image (null when it cannot be read): stepping back to a logo costs nothing. */
  private readonly logoTextures = new Map<HTMLImageElement, LogoTextures | null>();

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
        uLogoActive: { value: 0 },
        uLogoMix: { value: 0 },
        uLogoBox: { value: new Vector3() },
        uHasFrom: { value: 0 },
        uFieldFrom: { value: this.emptyLogo },
        uImageFrom: { value: this.emptyLogo },
        uFitFrom: { value: new Vector2(1, 1) },
        uHasTo: { value: 0 },
        uFieldTo: { value: this.emptyLogo },
        uImageTo: { value: this.emptyLogo },
        uFitTo: { value: new Vector2(1, 1) },
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

  private readLogo(image: HTMLImageElement): LogoTextures | null {
    try {
      return createLogoTextures(image);
    } catch (error) {
      console.error(`Cannot read the logo ${image.src} (CORS or canvas): ${String(error)}`);
      return null;
    }
  }

  /** Uploads the posed logo (once per image) and places its box, in drawing buffer pixels. */
  private texturesOf(image: HTMLImageElement | null): LogoTextures | null {
    if (!image) return null;
    let textures = this.logoTextures.get(image);
    if (textures === undefined) {
      textures = this.readLogo(image);
      this.logoTextures.set(image, textures);
    }
    return textures;
  }

  /** Poses the two shapes the orb morphs between, and where (drawing buffer pixels). */
  private updateLogo(logo: OrbState["logo"], canvasHeight: number, pixelRatio: number): void {
    const { uLogoActive, uLogoMix, uLogoBox } = this.mesh.material.uniforms;
    const from = this.texturesOf(logo.from);
    const to = this.texturesOf(logo.to);
    this.poseShape("From", from);
    this.poseShape("To", to);
    uLogoActive.value = from || to ? 1 : 0;
    uLogoMix.value = logo.mix;
    uLogoBox.value.set(
      logo.x * pixelRatio,
      (canvasHeight - logo.y) * pixelRatio,
      logo.halfSize * pixelRatio,
    );
  }

  private poseShape(side: "From" | "To", textures: LogoTextures | null): void {
    const uniforms = this.mesh.material.uniforms;
    uniforms[`uHas${side}`].value = textures ? 1 : 0;
    if (!textures) return;
    uniforms[`uField${side}`].value = textures.field;
    uniforms[`uImage${side}`].value = textures.image;
    uniforms[`uFit${side}`].value.copy(textures.fit);
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
    this.mesh.material.uniforms.uLogoActive.value = 0;
    this.mesh.visible = true;
  }

  hide(): void {
    this.isShown = false;
    this.mesh.visible = false;
  }

  dispose(): void {
    this.emptyLogo.dispose();
    this.logoTextures.forEach((textures) => textures?.dispose());
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
