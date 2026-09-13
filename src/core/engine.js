// Renderer, scene, camera rig and the frame loop.
import * as THREE from 'three';

export const SKY = 0x9fd2e8;

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(SKY);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.5, 500);

    // Camera rig: orbit yaw + distance, fixed pitch. RuneScape-ish.
    this.camYaw = Math.PI * 0.25;
    this.camPitch = 0.86;          // radians from horizontal
    this.camDist = 20;
    this.camTarget = new THREE.Vector3();
    this.camLook = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.scenes = new Map();
    this.active = null;
    this._updaters = [];

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  register(name, scene) { this.scenes.set(name, scene); }

  setActive(name) {
    this.active = this.scenes.get(name) || null;
    return this.active;
  }

  onUpdate(fn) { this._updaters.push(fn); }

  // Frame the camera on a target position.
  updateCamera(target, dt) {
    this.camTarget.lerp(target, Math.min(1, dt * 8));
    const horiz = Math.cos(this.camPitch) * this.camDist;
    const vert = Math.sin(this.camPitch) * this.camDist;
    this.camera.position.set(
      this.camTarget.x + Math.sin(this.camYaw) * horiz,
      this.camTarget.y + vert,
      this.camTarget.z + Math.cos(this.camYaw) * horiz
    );
    this.camLook.copy(this.camTarget).add(new THREE.Vector3(0, 1.2, 0));
    this.camera.lookAt(this.camLook);
  }

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.elapsedTime;
      for (const fn of this._updaters) fn(dt, t);
      if (this.active) this.renderer.render(this.active, this.camera);
    };
    loop();
  }
}

// Shared lighting setup, reused by every scene so interiors and exterior match.
export function addLighting(scene, { indoor = false } = {}) {
  const hemi = new THREE.HemisphereLight(
    indoor ? 0xfff0d8 : 0xbfe3f5,
    indoor ? 0x33281f : 0x4a6b3a,
    indoor ? 0.9 : 1.05
  );
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(indoor ? 0xffe9c4 : 0xfff6e0, indoor ? 0.75 : 1.35);
  sun.position.set(indoor ? 6 : 28, indoor ? 14 : 40, indoor ? 8 : 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const d = indoor ? 16 : 60;
  sun.shadow.camera.left = -d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = -d;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  sun.shadow.bias = -0.0009;
  scene.add(sun);
  scene.add(sun.target);

  scene.add(new THREE.AmbientLight(0xffffff, indoor ? 0.35 : 0.18));
  return sun;
}

// Flat-shaded material helper — the chunky look depends on this.
export function mat(color, opts = {}) {
  return new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts });
}
