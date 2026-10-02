import { Mesh, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import type { Palette } from "../palette";
import { orbFragment, orbVertex } from "../shaders/orb.glsl";
import type { SharedUniforms } from "../uniforms";

/** How fast the orb catches up with its target (1/s). */
const FOLLOW_SPEED = 6;

/** Glowing sphere of the closing section, chasing the head of the curved sentence. */
export class Orb {
  readonly mesh: Mesh<SphereGeometry, ShaderMaterial>;
  private readonly target = new Vector3();
  private viewWidth = 1;
  private viewHeight = 1;

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
  layout(viewWidth: number, viewHeight: number): void {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.mesh.scale.setScalar(Math.min(viewWidth, viewHeight) * 0.07);
  }

  /** Moves towards `x`, `y` in normalized device coordinates (-1..1, y up). */
  update(deltaSeconds: number, x: number, y: number): void {
    this.target.set((x * this.viewWidth) / 2, (y * this.viewHeight) / 2, 0);
    this.mesh.position.lerp(this.target, 1 - Math.exp(-deltaSeconds * FOLLOW_SPEED));
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
