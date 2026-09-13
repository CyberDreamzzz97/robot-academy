// Click-to-move input, camera orbit, and hover highlighting.
import * as THREE from 'three';

export class Input {
  constructor(engine, canvas) {
    this.engine = engine;
    this.canvas = canvas;
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.enabled = true;

    this.onGroundClick = () => {};
    this.onTargetClick = () => {};
    this.onHover = () => {};

    this._dragging = false;
    this._moved = 0;
    this._last = { x: 0, y: 0 };

    canvas.addEventListener('pointerdown', e => this._down(e));
    window.addEventListener('pointermove', e => this._move(e));
    window.addEventListener('pointerup', e => this._up(e));
    canvas.addEventListener('wheel', e => this._wheel(e), { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  _ndcFrom(e) {
    this.ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    return this.ndc;
  }

  _down(e) {
    this._dragging = true;
    this._moved = 0;
    this._last.x = e.clientX;
    this._last.y = e.clientY;
    this._button = e.button;
  }

  _move(e) {
    const dx = e.clientX - this._last.x;
    const dy = e.clientY - this._last.y;

    if (this._dragging) {
      this._moved += Math.abs(dx) + Math.abs(dy);
      // right-drag (or middle) orbits the camera
      if (this._button === 2 || this._button === 1) {
        this.engine.camYaw -= dx * 0.006;
        this.engine.camPitch = THREE.MathUtils.clamp(this.engine.camPitch + dy * 0.004, 0.35, 1.35);
      }
    }
    this._last.x = e.clientX;
    this._last.y = e.clientY;

    if (this.enabled) this.onHover(this._ndcFrom(e));
  }

  _up(e) {
    const wasDrag = this._moved > 6;
    this._dragging = false;
    if (!this.enabled || wasDrag) return;
    if (e.button !== 0) return;
    if (e.target !== this.canvas) return;

    const ndc = this._ndcFrom(e);
    this.onGroundClick(ndc);
  }

  _wheel(e) {
    e.preventDefault();
    this.engine.camDist = THREE.MathUtils.clamp(this.engine.camDist + Math.sign(e.deltaY) * 1.8, 9, 38);
  }

  // Raycast helper: returns the first hit among `objects`.
  pick(ndc, objects, recursive = true) {
    this.ray.setFromCamera(ndc, this.engine.camera);
    const hits = this.ray.intersectObjects(objects, recursive);
    return hits.length ? hits[0] : null;
  }
}
