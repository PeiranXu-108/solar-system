import * as THREE from "three";

export class InteractionController {
  constructor(camera, controls, planetSystem, earthMode = null) {
    this.camera = camera;
    this.controls = controls;
    this.planetSystem = planetSystem;
    this.earthMode = earthMode;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.currentTarget = null;
    this.infoCard = null;
    this.cardTitle = null;
    this.cardBody = null;
    
    this.init();
  }

  init() {
    this.infoCard = document.getElementById("infoCard");
    this.cardTitle = document.getElementById("cardTitle");
    this.cardBody = document.getElementById("cardBody");
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("pointerdown", (ev) => this.onPointerDown(ev));
  }

  setInfoCard(p) {
    this.cardTitle.textContent = p.name;
    const period = (2 * Math.PI) / (p.orbitSpeed * 0.02);
    
    this.cardBody.innerHTML = `Distance: ${p.distance} (scaled)<br/>Orbit inc.: ${THREE.MathUtils.radToDeg(
      p.orbitInclination
    ).toFixed(1)}°<br/>Axial tilt: ${THREE.MathUtils.radToDeg(
      p.axialTilt
    ).toFixed(1)}°<br/>Approx. period: ${period.toFixed(1)}s (sim)`;
    this.infoCard.style.display = "block";
  }

  flyToPlanet(p) {
    const worldPos = new THREE.Vector3();
    p.holder.getWorldPosition(worldPos);
    const dir = worldPos.clone().sub(this.controls.target).normalize();
    const camStart = this.camera.position.clone();
    const camEnd = worldPos
      .clone()
      .add(dir.multiplyScalar(p.mesh.geometry.parameters.radius * 8 + 20));
    const targetStart = this.controls.target.clone();
    const targetEnd = worldPos.clone();
    let k = 0;
    const dur = 1.6;
    const ease = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
    
    const step = () => {
      k += 1 / 60;
      const e = ease(Math.min(1, k / dur));
      this.camera.position.lerpVectors(camStart, camEnd, e);
      this.controls.target.lerpVectors(targetStart, targetEnd, e);
      if (e < 1) requestAnimationFrame(step);
    };
    
    step();
    
    this.setInfoCard(p);
    this.currentTarget = p;
  }

  onPointerDown(ev) {
    this.mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.planetSystem.getPlanets().map((p) => p.mesh);
    const inter = this.raycaster.intersectObjects(meshes, false)[0];
    
    if (inter) {
      const p = this.planetSystem.getPlanets().find((pp) => pp.mesh === inter.object);
      // 所有行星使用标准飞行
      this.flyToPlanet(p);
    } else {
      this.infoCard.style.display = "none";
      this.currentTarget = null;
    }
  }

  focusEarth() {
    // 进入地球模式并飞到地球
    if (this.earthMode) {
      this.earthMode.enterEarthMode();
    } else {
      // 如果没有地球模式，使用标准飞行方式
      const earth = this.planetSystem.getEarth();
      if (earth) {
        this.flyToPlanet(earth);
      }
    }
  }

  getCurrentTarget() {
    return this.currentTarget;
  }
}
