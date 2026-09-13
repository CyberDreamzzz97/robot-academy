// The player robot: click-to-move steering with simple obstacle avoidance.
import * as THREE from 'three';
import { buildRobot, animateRobot } from './robot.js';

const SPEED = 7.2;
const ARRIVE = 0.35;
const STALL_LIMIT = 0.9;   // seconds of no progress before abandoning a target

export class Player {
  constructor() {
    this.object = buildRobot({
      palette: { body: 0xe8eef4, trim: 0x46525f, visor: 0x7ef0d0, accent: 0x2fbf9a },
      build: 'player',
      scale: 1.1
    });
    this.target = null;
    this.speed = 0;
    this.blockers = [];
    this.bounds = 44;
    this._dir = new THREE.Vector3();
    this._desired = new THREE.Vector3();
  }

  get position() { return this.object.position; }

  setBlockers(list) { this.blockers = list || []; }
  setBounds(r) { this.bounds = r; }

  moveTo(point) {
    // A destination inside a building can never be reached, and the steering
    // push would grind against it forever. Pull it out to the nearest walkable
    // point on the obstacle's edge instead.
    let { x, z } = point;
    for (const b of this.blockers) {
      const dx = x - b.x, dz = z - b.z;
      const d = Math.hypot(dx, dz);
      const clearance = b.r + 0.8;
      if (d < clearance) {
        if (d < 0.0001) { x = b.x + clearance; z = b.z; }
        else { x = b.x + (dx / d) * clearance; z = b.z + (dz / d) * clearance; }
      }
    }
    this.target = new THREE.Vector3(x, 0, z);
    this._stallTime = 0;
    this._lastDist = Infinity;   // best (smallest) distance reached so far
  }

  stop() { this.target = null; this.speed = 0; this._stallTime = 0; }

  teleport(x, z, facing = 0) {
    this.object.position.set(x, 0, z);
    this.object.rotation.y = facing;
    this.stop();
  }

  update(dt, t) {
    if (this.target) {
      this._dir.copy(this.target).sub(this.object.position);
      this._dir.y = 0;
      const dist = this._dir.length();

      if (dist < ARRIVE) {
        this.target = null;
        this.speed = 0;
      } else if (this._isStalled(dist, dt)) {
        // Destination is unreachable (inside a building, behind a blocker).
        // Give up rather than grinding against the obstacle forever.
        this.stop();
      } else {
        this._dir.normalize();
        this._desired.copy(this._dir);

        // push away from nearby blockers so you slide around houses instead of stopping dead
        for (const b of this.blockers) {
          const dx = this.object.position.x - b.x;
          const dz = this.object.position.z - b.z;
          const d = Math.hypot(dx, dz);
          const clearance = b.r + 0.7;
          if (d < clearance && d > 0.0001) {
            const push = (clearance - d) / clearance;
            this._desired.x += (dx / d) * push * 2.4;
            this._desired.z += (dz / d) * push * 2.4;
          }
        }
        this._desired.y = 0;
        if (this._desired.lengthSq() > 0.00001) this._desired.normalize();

        const step = Math.min(SPEED * dt, dist);
        this.object.position.addScaledVector(this._desired, step);
        this.speed = step / Math.max(dt, 0.0001);

        // stay inside the world
        const r = Math.hypot(this.object.position.x, this.object.position.z);
        if (r > this.bounds) {
          this.object.position.multiplyScalar(this.bounds / r);
        }

        // face travel direction
        const want = Math.atan2(this._desired.x, this._desired.z);
        this.object.rotation.y = smoothAngle(this.object.rotation.y, want, dt * 12);
      }
    } else {
      this.speed *= 0.7;
    }

    animateRobot(this.object, t, this.speed);
  }

  /**
   * True when we have stopped closing on the target. Tracks the best distance
   * reached rather than frame-to-frame change, so sliding sideways around an
   * obstacle (which makes distance oscillate) still counts as stalled.
   */
  _isStalled(dist, dt) {
    if (dist < this._lastDist - 0.05) {
      this._lastDist = dist;
      this._stallTime = 0;
      return false;
    }
    this._stallTime = (this._stallTime || 0) + dt;
    return this._stallTime > STALL_LIMIT;
  }
}

function smoothAngle(current, target, k) {
  let diff = ((target - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return current + diff * Math.min(1, k);
}
