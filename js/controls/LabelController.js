import * as THREE from "three";

export class LabelController {
  constructor(camera, planetSystem) {
    this.camera = camera;
    this.planetSystem = planetSystem;
    this.tempV = new THREE.Vector3();
  }

  updateLabels() {
    for (const p of this.planetSystem.getPlanets()) {
      this.tempV.copy(p.holder.position).applyMatrix4(p.pivot.matrixWorld);
      this.tempV.project(this.camera);
      const x = (this.tempV.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-this.tempV.y * 0.5 + 0.5) * window.innerHeight;
      p.label.style.transform = `translate(${x}px, ${y}px)`;
      const inView = this.tempV.z < 1 && this.tempV.z > -1;
      p.label.style.opacity = inView ? "1" : "0";
    }
  }
}
