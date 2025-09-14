import * as THREE from "three";

export class LabelController {
  constructor(camera, planetSystem) {
    this.camera = camera;
    this.planetSystem = planetSystem;
    this.tempV = new THREE.Vector3();
    this._lastUpdate = 0;
  }

  updateLabels() {
    // Throttle to ~30fps to reduce DOM work
    const now = performance.now();
    if (now - this._lastUpdate < 33) return;
    this._lastUpdate = now;

    for (const p of this.planetSystem.getPlanets()) {
      this.tempV.copy(p.holder.position).applyMatrix4(p.pivot.matrixWorld);
      this.tempV.project(this.camera);
      const x = (this.tempV.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-this.tempV.y * 0.5 + 0.5) * window.innerHeight;
      const transform = `translate(${x}px, ${y}px)`;
      if (p.label.__transform !== transform) {
        p.label.style.transform = transform;
        p.label.__transform = transform;
      }
      const inView = this.tempV.z < 1 && this.tempV.z > -1;
      const opacity = inView ? "1" : "0";
      if (p.label.__opacity !== opacity) {
        p.label.style.opacity = opacity;
        p.label.__opacity = opacity;
      }
    }
  }
}
