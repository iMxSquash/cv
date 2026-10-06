import {
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  OneFactor,
  OneMinusSrcAlphaFactor,
  Points,
  ShaderMaterial,
  SrcAlphaFactor,
  Vector2,
  Vector3,
} from "three";
import type { Palette } from "../palette";
import type { ParticlesState } from "../scrollProgress";
import { particlesFragment, particlesVertex } from "../shaders/particles.glsl";
import type { SharedUniforms } from "../uniforms";

/** Dots per row and column; fewer on touch devices. */
const GRID = { columns: 56, rows: 32 };
const GRID_COARSE = { columns: 40, rows: 24 };
/** Dot diameter on the plane of the orb, in CSS px. */
const POINT_SIZE = 4;
/** How fast the cloud catches up with its formation and with the orb (1/s). */
const SHAPE_SPEED = 2.5;
const GATHER_SPEED = 3;
/** Below this, the cloud is all inside the orb: nothing to draw. */
const HIDDEN_GATHER = 0.999;

/**
 * The orb burst into a cloud of dots: a grid, a wave or a torus (see
 * shaders/particles.glsl.ts), all computed on the GPU from each dot's place
 * on a grid. Drawn after the orb, without depth.
 */
export class Particles {
  readonly points: Points<BufferGeometry, ShaderMaterial>;
  private shape = 1;
  private gather = 1;
  private viewWidth = 1;
  private viewHeight = 1;
  private canvasWidth = 1;
  private canvasHeight = 1;

  constructor(palette: Palette, uniforms: SharedUniforms, isCoarse: boolean) {
    const { columns, rows } = isCoarse ? GRID_COARSE : GRID;
    const count = columns * rows;
    const grid = new Float32Array(count * 2);
    const seeds = new Float32Array(count);
    for (let index = 0; index < count; index++) {
      grid[index * 2] = (index % columns) / (columns - 1);
      grid[index * 2 + 1] = Math.floor(index / columns) / (rows - 1);
      seeds[index] = Math.random();
    }
    const geometry = new BufferGeometry();
    // Positions are computed in the vertex shader; three.js still needs the attribute to count the dots.
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aGrid", new BufferAttribute(grid, 2));
    geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));

    const material = new ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      uniforms: {
        uTime: uniforms.uTime,
        uShape: { value: 1 },
        uGather: { value: 1 },
        uOrigin: { value: new Vector3() },
        uView: { value: new Vector2(1, 1) },
        uPointSize: { value: POINT_SIZE },
        uPixelRatio: { value: 1 },
        uColors: { value: [palette.primary, palette.secondary, palette.info] },
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
    this.points = new Points(geometry, material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 2;
    this.points.visible = false;
  }

  /** Records the visible world size at z = 0 and the canvas size, to map screen points onto it. */
  layout(viewWidth: number, viewHeight: number, canvasWidth: number, canvasHeight: number): void {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.points.material.uniforms.uView.value.set(viewWidth, viewHeight);
  }

  /** Eases towards `state`; hidden while the whole cloud is inside the orb. */
  update(deltaSeconds: number, state: ParticlesState, pixelRatio: number): void {
    this.shape += (state.shape - this.shape) * (1 - Math.exp(-deltaSeconds * SHAPE_SPEED));
    this.gather += (state.gather - this.gather) * (1 - Math.exp(-deltaSeconds * GATHER_SPEED));
    this.points.visible = this.gather < HIDDEN_GATHER;
    if (!this.points.visible) return;
    const { uShape, uGather, uOrigin, uPixelRatio } = this.points.material.uniforms;
    uShape.value = this.shape;
    uGather.value = this.gather;
    uPixelRatio.value = pixelRatio;
    uOrigin.value.set(
      (state.originX / this.canvasWidth - 0.5) * this.viewWidth,
      (0.5 - state.originY / this.canvasHeight) * this.viewHeight,
      0,
    );
  }

  /** Something is drawn, or about to be: keeps the canvas rendering. */
  get isVisible(): boolean {
    return this.points.visible;
  }

  dispose(): void {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
