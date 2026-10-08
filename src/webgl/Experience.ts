import gsap from "gsap";
import {
  MathUtils,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { readPalette } from "./palette";
import { HeroGradient } from "./scenes/HeroGradient";
import { Monogram } from "./scenes/Monogram";
import { Particles } from "./scenes/Particles";
import { Blob } from "./scenes/Blob";
import { type CoverRequest, scrollProgress } from "./scrollProgress";
import { createSharedUniforms } from "./uniforms";

const CAMERA_FOV = 35;
const CAMERA_DISTANCE = 4;
const RESIZE_DEBOUNCE_MS = 100;
const MAX_PIXEL_RATIO = 2;
const MAX_PIXEL_RATIO_COARSE = 1.5;

export interface ExperienceOptions {
  /** Reduced motion: render single frames on demand, no loop. */
  isStatic: boolean;
  /** Called once the first frame is on the canvas. */
  onReady: () => void;
  /** The GPU dropped the context: the caller should dispose and show the CSS fallback. */
  onContextLost: () => void;
}

/**
 * Owns the single renderer of the page and everything drawn on the fixed
 * background canvas. Driven by gsap.ticker, the page's only animation loop.
 * Creates its own <canvas> in the container and removes it on dispose: a canvas
 * whose context was force-lost can never host a renderer again (fast refresh,
 * Strict Mode remounts). Throws if WebGL 2 is unavailable.
 */
export class Experience {
  private readonly canvas = document.createElement("canvas");
  private readonly renderer: WebGLRenderer;
  private readonly camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 20);
  private readonly scene = new Scene();
  private readonly uniforms = createSharedUniforms();
  private readonly gradient: HeroGradient;
  private readonly monogram: Monogram;
  private readonly blob: Blob;
  private readonly particles: Particles;
  private readonly environment: WebGLRenderTarget;
  private readonly resizeObserver: ResizeObserver;
  private resizeTimer: ReturnType<typeof setTimeout> | undefined;
  private canvasHeight = 1;
  private isHeroOnScreen = true;
  private isCanvasVisible = true;
  private hasRendered = false;

  constructor(
    container: HTMLElement,
    private readonly options: ExperienceOptions,
  ) {
    const { canvas } = this;
    canvas.style.cssText = "display: block; width: 100%; height: 100%;";
    container.append(canvas);
    try {
      this.renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        // Transparent around the hero frame: the page surface shows, with the orb roaming over it.
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (error) {
      canvas.remove();
      throw error;
    }
    // Only affects lit materials: the gradient shader skips tone mapping and keeps its luminance cap.
    this.renderer.toneMapping = NeutralToneMapping;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isCoarse ? MAX_PIXEL_RATIO_COARSE : MAX_PIXEL_RATIO),
    );

    const palette = readPalette();
    this.gradient = new HeroGradient(palette, this.uniforms);
    this.monogram = new Monogram(palette);
    // Started first: the model download overlaps the synchronous environment bake below.
    this.monogram.load().then(
      () => this.requestStaticFrame(),
      (error: unknown) => console.error("[webgl] Monogram failed to load", error),
    );
    this.blob = new Blob(palette, this.uniforms);
    this.particles = new Particles(palette, this.uniforms, isCoarse);
    this.scene.add(this.gradient.mesh, this.monogram.group, this.blob.mesh, this.particles.points);
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.z = CAMERA_DISTANCE;

    // Baked once: a neutral studio the monogram reflects, cheaper than more lights.
    const pmrem = new PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, 0.04);
    this.scene.environment = this.environment.texture;
    room.dispose();
    pmrem.dispose();

    this.resize();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(canvas);
    canvas.addEventListener("webglcontextlost", this.onContextLost);

    if (options.isStatic) {
      this.requestStaticFrame();
    } else {
      window.addEventListener("pointermove", this.onPointerMove, { passive: true });
      gsap.ticker.add(this.tick);
    }
  }

  /** The hero (gradient + monogram) is on screen. With the orb off screen too, rendering pauses. */
  setHeroOnScreen(isHeroOnScreen: boolean): void {
    this.isHeroOnScreen = isHeroOnScreen;
    this.setCanvasVisible(isHeroOnScreen || scrollProgress.orb.isVisible);
  }

  dispose(): void {
    gsap.ticker.remove(this.tick);
    clearTimeout(this.resizeTimer);
    this.resizeObserver.disconnect();
    window.removeEventListener("pointermove", this.onPointerMove);
    // Removed before forceContextLoss, which fires this very event.
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.gradient.dispose();
    this.monogram.dispose();
    this.blob.dispose();
    this.particles.dispose();
    // A render target texture is only freed through its render target.
    this.environment.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }

  private readonly tick = (time: number, deltaMs: number) => {
    const { coverRequest } = scrollProgress;
    if (coverRequest && !document.hidden) {
      scrollProgress.coverRequest = null;
      this.captureCover(coverRequest);
    }
    const hasContent =
      this.isHeroOnScreen || scrollProgress.orb.isVisible || this.particles.isVisible;
    this.setCanvasVisible(hasContent);
    if (!hasContent || document.hidden) return;
    this.renderFrame(time, deltaMs / 1000);
  };

  /**
   * Draws the orb's gradient swollen to the requested circle, alone, and
   * copies it into the request's 2D canvas. Done within one task: the
   * compositor only ever sees the frame drawn afterwards.
   */
  private captureCover(request: CoverRequest): void {
    const hidden = [this.gradient.mesh, this.monogram.group, this.particles.points];
    const wasVisible = [...hidden.map((object) => object.visible), this.blob.mesh.visible];
    hidden.forEach((object) => (object.visible = false));
    this.blob.poseCover(request, this.canvasHeight, this.renderer.getPixelRatio());
    this.renderer.render(this.scene, this.camera);
    const { width, height } = this.canvas;
    // Sizing the canvas also clears it.
    request.canvas.width = width;
    request.canvas.height = height;
    request.canvas.getContext("2d")?.drawImage(this.canvas, 0, 0);
    [...hidden, this.blob.mesh].forEach((object, index) => (object.visible = wasVisible[index]));
  }

  /** Hidden while nothing is drawn, so the page surface shows instead of the clear color. */
  private setCanvasVisible(isVisible: boolean): void {
    if (isVisible === this.isCanvasVisible) return;
    this.isCanvasVisible = isVisible;
    this.canvas.style.visibility = isVisible ? "" : "hidden";
  }

  /** Reduced motion has no loop: redraw a still frame whenever the scene changes. */
  private requestStaticFrame(): void {
    if (this.options.isStatic) this.renderFrame(0);
  }

  private renderFrame(time: number, deltaSeconds = 0): void {
    this.uniforms.uTime.value = time;
    this.gradient.mesh.visible = this.isHeroOnScreen;
    if (this.isHeroOnScreen) {
      this.gradient.setFrame(
        scrollProgress.heroFrame,
        this.canvasHeight,
        this.renderer.getPixelRatio(),
      );
      this.monogram.setProgress(scrollProgress.hero);
      this.monogram.update(deltaSeconds, this.uniforms.uPointer.value);
    }
    this.monogram.group.visible = this.isHeroOnScreen && !this.monogram.isCollapsed;
    const { orb } = scrollProgress;
    if (orb.isVisible) {
      this.blob.update(deltaSeconds, orb, this.canvasHeight, this.renderer.getPixelRatio());
    } else {
      this.blob.hide();
    }
    this.particles.update(deltaSeconds, scrollProgress.particles, this.renderer.getPixelRatio());
    this.renderer.render(this.scene, this.camera);
    if (this.hasRendered) return;
    this.hasRendered = true;
    this.options.onReady();
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    if (width === 0 || height === 0) return;
    this.canvasHeight = height;
    this.renderer.setSize(width, height, false);
    this.renderer.getDrawingBufferSize(this.uniforms.uResolution.value);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    const viewHeight = 2 * CAMERA_DISTANCE * Math.tan(MathUtils.degToRad(CAMERA_FOV / 2));
    this.monogram.layout(viewHeight * this.camera.aspect, viewHeight);
    this.particles.layout(viewHeight * this.camera.aspect, viewHeight, width, height);
  }

  private readonly onResize = () => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.resize();
      this.requestStaticFrame();
    }, RESIZE_DEBOUNCE_MS);
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    this.uniforms.uPointer.value.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      1 - (event.clientY / window.innerHeight) * 2,
    );
  };

  private readonly onContextLost = () => this.options.onContextLost();
}
