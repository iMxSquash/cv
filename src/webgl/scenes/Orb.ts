import { Mesh, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import type { Palette } from "../palette";
import { orbFragment, orbVertex } from "../shaders/orb.glsl";
import { ORB_SCALE } from "../scrollProgress";
import type { SharedUniforms } from "../uniforms";

/** How fast the orb catches up with its target (1/s). */
const FOLLOW_SPEED = 6;

/** Glowing sphere of the closing section, chasing the head of the curved sentence. */
export class Orb {
  readonly mesh: Mesh<SphereGeometry, ShaderMaterial>;
  private readonly target = new Vector3();
  private viewWidth = 1;
  private viewHeight = 1;
  private canvasHeight = 1;
  private cameraDistance = 1;
  private restingScale = 1;
  private isGrowing = false;

  constructor(palette: Palette, uniforms: SharedUniforms) {
    const material = new ShaderMaterial({
      vertexShader: orbVertex,
      fragmentShader: orbFragment,
      uniforms: {
        uTime: uniforms.uTime,
        uColors: { value: [palette.primary, palette.secondary, palette.info] },
      },
    });
    this.mesh = new Mesh(new SphereGeometry(1, 48, 24), material);
  }

  /** Sizes the orb from the visible world size at z = 0. */
  layout(
    viewWidth: number,
    viewHeight: number,
    canvasHeight: number,
    cameraDistance: number,
  ): void {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.canvasHeight = canvasHeight;
    this.cameraDistance = cameraDistance;
    this.restingScale = Math.min(viewWidth, viewHeight) * ORB_SCALE;
    this.mesh.scale.setScalar(this.restingScale);
  }

  /** Grows the orb until its silhouette has this radius on screen, or back to its resting size (null). */
  setRadiusPixels(radiusPx: number | null): void {
    this.isGrowing = radiusPx !== null;
    if (radiusPx === null) {
      this.mesh.scale.setScalar(this.restingScale);
      return;
    }
    // The silhouette of a sphere is the tangent cone from the camera: a sphere of radius r looks as wide as
    // w = r d / sqrt(d² - r²) at the distance d of the orb plane, hence r = w d / sqrt(d² + w²).
    const width = (radiusPx / this.canvasHeight) * this.viewHeight;
    this.mesh.scale.setScalar(
      (width * this.cameraDistance) / Math.hypot(this.cameraDistance, width),
    );
  }

  /** Moves towards `x`, `y` in normalized device coordinates (-1..1, y up). */
  update(deltaSeconds: number, x: number, y: number): void {
    this.target.set((x * this.viewWidth) / 2, (y * this.viewHeight) / 2, 0);
    // Growing into the footer card, it must sit exactly where the card's own mask is centered.
    this.mesh.position.lerp(
      this.target,
      this.isGrowing ? 1 : 1 - Math.exp(-deltaSeconds * FOLLOW_SPEED),
    );
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
