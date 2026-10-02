import {
  DirectionalLight,
  Group,
  type Material,
  Mesh,
  MeshPhysicalMaterial,
  type Vector2,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { Palette } from "../palette";

/** Exported from design/3d/monogram.blend: 1 unit wide, facing +Z. */
const MODEL_URL = "/models/monogram.glb";
const MAX_TILT = { x: 0.3, y: 0.5 };
/** How fast the monogram catches up with the pointer (1/s). */
const FOLLOW_SPEED = 4;

/** The portfolio's "EC" logo in 3D, turning towards the pointer. */
export class Monogram {
  readonly group = new Group();
  private readonly pivot = new Group();
  private readonly material: MeshPhysicalMaterial;
  private readonly lights: DirectionalLight[];
  private mesh: Mesh | null = null;
  private isDisposed = false;

  constructor(palette: Palette) {
    // Lit by the scene environment (reflections) plus two tinted rims from the palette.
    this.material = new MeshPhysicalMaterial({
      color: palette.primaryLighter,
      roughness: 0.25,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      envMapIntensity: 0.6,
    });
    const key = new DirectionalLight(palette.info, 1.5);
    key.position.set(3, 2, 2);
    const fill = new DirectionalLight(palette.primary, 2);
    fill.position.set(-3, -1, 1);
    this.lights = [key, fill];
    this.group.add(key, fill, this.pivot);
  }

  /** Resolves once the model is in the scene (or the monogram was disposed meanwhile). */
  async load(): Promise<void> {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(MODEL_URL);
    const mesh = gltf.scene.getObjectByProperty("type", "Mesh");
    if (!(mesh instanceof Mesh)) throw new Error(`No mesh found in ${MODEL_URL}`);
    // The exported material is only a Blender preview: the scene's own replaces it.
    disposeMaterials(mesh.material);
    if (this.isDisposed) {
      mesh.geometry.dispose();
      return;
    }
    mesh.material = this.material;
    this.mesh = mesh;
    this.pivot.add(mesh);
  }

  /** Places and sizes the monogram from the visible world size at z = 0. */
  layout(viewWidth: number, viewHeight: number): void {
    const isLandscape = viewWidth > viewHeight;
    const size = isLandscape
      ? Math.min(viewWidth * 0.24, viewHeight * 0.45)
      : Math.min(viewWidth * 0.55, viewHeight * 0.25);
    this.pivot.scale.setScalar(size);
    this.pivot.position.set(
      isLandscape ? viewWidth * 0.3 : 0,
      isLandscape ? -viewHeight * 0.05 : -viewHeight * 0.22,
      0,
    );
  }

  /** `pointer` in normalized device coordinates (-1..1, y up). */
  update(deltaSeconds: number, pointer: Vector2): void {
    const ease = 1 - Math.exp(-deltaSeconds * FOLLOW_SPEED);
    const rotation = this.pivot.rotation;
    rotation.y += (pointer.x * MAX_TILT.y - rotation.y) * ease;
    rotation.x += (-pointer.y * MAX_TILT.x - rotation.x) * ease;
  }

  dispose(): void {
    this.isDisposed = true;
    this.mesh?.geometry.dispose();
    this.material.dispose();
    for (const light of this.lights) light.dispose();
  }
}

function disposeMaterials(material: Material | Material[]): void {
  for (const item of Array.isArray(material) ? material : [material]) item.dispose();
}
