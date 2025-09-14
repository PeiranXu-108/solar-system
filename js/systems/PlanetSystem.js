import * as THREE from "three";

export class PlanetSystem {
  constructor(scene, textureManager) {
    this.scene = scene;
    this.textureManager = textureManager;
    this.planets = [];
    this.belt = null;
    this.moon = null;
    this.moonPivot = null;
    this.earthRef = null;
    this.init();
  }

  init() {
    this.createPlanets();
    this.createAsteroidBelt();
    this.createMoon();
  }
 
  makeOrbit(radius, tilt = 0) {
    const g = new THREE.BufferGeometry();
    const seg = 128; // sufficient resolution, halves line vertices
    const v = [];
    for (let i = 0; i <= seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      v.push(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    const m = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.6,
    });
    const loop = new THREE.LineLoop(g, m);
    loop.rotation.x = tilt;
    return loop;
  }

  addPlanet({
    name,
    radius,
    distance,
    orbitSpeed,
    rotationSpeed,
    texture,
    normalMap,
    ring,
    orbitInclination = 0,
    axialTilt = 0,
  }) {
    const group = new THREE.Group();
    this.scene.add(group);
    
    // Reduce geometry segments for small planets, keep quality for large
    const segs = Math.min(64, Math.max(16, Math.round(radius * 6)));
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segs, segs),
      new THREE.MeshStandardMaterial({
        map: texture ? this.textureManager.loadColorTex(texture) : null,
        color: 0xffffff,
        metalness: 0.0,
        roughness: 1.0,
        emissive: new THREE.Color(0x111111), // 添加轻微的自发光
        emissiveIntensity: 0.1, // 自发光强度
      })
    );
    
    if (normalMap) mesh.material.normalMap = this.textureManager.loadTexture(normalMap);
    
    const pivot = new THREE.Group();
    pivot.rotation.x = orbitInclination;
    group.add(pivot);
    
    const holder = new THREE.Group();
    holder.position.x = distance;
    pivot.add(holder);
    
    mesh.rotation.z = axialTilt;
    holder.add(mesh);
    
    const orbit = this.makeOrbit(distance, orbitInclination);
    group.add(orbit);
    
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = name;
    document.body.appendChild(label);
    
    if (ring) {
      const ringGeo = new THREE.RingGeometry(ring.inner, ring.outer, 128, 1);
      const ringMat = new THREE.MeshBasicMaterial({
        map: this.textureManager.loadColorTex(ring.texture),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
      });
      ringGeo.rotateX(-Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(mesh.position);
      holder.add(ringMesh);
    }
    
    const planet = {
      name,
      pivot,
      holder,
      mesh,
      label,
      distance,
      orbitSpeed,
      rotationSpeed,
      orbitInclination,
      axialTilt,
    };
    this.planets.push(planet);
    if (name === "Earth") this.earthRef = planet;
  }

  createPlanets() {
    // Mercury
    this.addPlanet({
      name: "Mercury",
      radius: 2,
      distance: 30,
      orbitSpeed: 4.8,
      rotationSpeed: 0.01,
      texture: this.textureManager.getImageTexture("2k_mercury.jpg"),
      orbitInclination: THREE.MathUtils.degToRad(7),
      axialTilt: THREE.MathUtils.degToRad(0.03),
    });

    // Venus
    this.addPlanet({
      name: "Venus",
      radius: 3.5,
      distance: 42,
      orbitSpeed: 3.5,
      rotationSpeed: 0.008,
      texture: this.textureManager.getImageTexture("2k_venus_surface.jpg"),
      orbitInclination: THREE.MathUtils.degToRad(3.4),
      axialTilt: THREE.MathUtils.degToRad(177),
    });

    // Earth
    this.addPlanet({
      name: "Earth",
      radius: 3.8,
      distance: 58,
      orbitSpeed: 3.0,
      rotationSpeed: 0.03,
      texture: this.textureManager.getPlanetTexture("earth_atmos_2048.jpg"),
      normalMap: this.textureManager.getPlanetTexture("earth_normal_2048.jpg"),
      orbitInclination: 0,
      axialTilt: THREE.MathUtils.degToRad(23.4),
    });

    // Mars
    this.addPlanet({
      name: "Mars",
      radius: 3.0,
      distance: 74,
      orbitSpeed: 2.4,
      rotationSpeed: 0.024,
      texture: this.textureManager.getImageTexture("2k_mars.jpg"),
      orbitInclination: THREE.MathUtils.degToRad(1.85),
      axialTilt: THREE.MathUtils.degToRad(25.2),
    });

    // Jupiter
    this.addPlanet({
      name: "Jupiter",
      radius: 11.5,
      distance: 160,
      orbitSpeed: 1.6,
      rotationSpeed: 0.05,
      texture: this.textureManager.getImageTexture("2k_jupiter.jpg"),
      orbitInclination: THREE.MathUtils.degToRad(1.3),
      axialTilt: THREE.MathUtils.degToRad(3.1),
    });

    // Saturn
    this.addPlanet({
      name: "Saturn",
      radius: 9.8,
      distance: 210,
      orbitSpeed: 1.2,
      rotationSpeed: 0.04,
      texture: this.textureManager.getImageTexture("2K_saturn.jpg"),
      ring: { 
        inner: 14, 
        outer: 22, 
        texture: this.textureManager.getPlanetTexture("saturnring.png") 
      },
      orbitInclination: THREE.MathUtils.degToRad(2.5),
      axialTilt: THREE.MathUtils.degToRad(26.7),
    });

    // Uranus
    this.addPlanet({
      name: "Uranus",
      radius: 7.2,
      distance: 260,
      orbitSpeed: 0.9,
      rotationSpeed: 0.03,
      texture: this.textureManager.getImageTexture("2k_uranus.jpg"),
      orbitInclination: THREE.MathUtils.degToRad(0.8),
      axialTilt: THREE.MathUtils.degToRad(97.8),
    });

    // Neptune
    this.addPlanet({
      name: "Neptune",
      radius: 7.0,
      distance: 300,
      orbitSpeed: 0.7,
      rotationSpeed: 0.03,
      texture: this.textureManager.getImageTexture("2k_neptune.jpg"),
      orbitInclination: THREE.MathUtils.degToRad(1.8),
      axialTilt: THREE.MathUtils.degToRad(28.3),
    });
  }

  createAsteroidBelt() {
    const g = new THREE.BufferGeometry();
    const n = 5000;
    const pos = new Float32Array(n * 3);
    const rMin = 90, rMax = 130;
    
    for (let i = 0; i < n; i++) {
      const r = THREE.MathUtils.lerp(rMin, rMax, Math.random());
      const t = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(t) * r + THREE.MathUtils.randFloatSpread(2);
      pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(1.2);
      pos[i * 3 + 2] = Math.sin(t) * r + THREE.MathUtils.randFloatSpread(2);
    }
    
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      size: 0.7,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.9,
    });
    
    this.belt = new THREE.Points(g, m);
    this.scene.add(this.belt);
  }

  createMoon() {
    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 32, 32),
      new THREE.MeshStandardMaterial({
        map: this.textureManager.loadColorTex(this.textureManager.getPlanetTexture("moon_1024.jpg")),
        roughness: 1,
      })
    );
    this.moonPivot = new THREE.Group();
  }

  update(dt) {
    for (const p of this.planets) {
      p.pivot.rotation.y += dt * (p.orbitSpeed * 0.02);
      p.mesh.rotation.y += dt * p.rotationSpeed;
    }
    
    this.belt.rotation.y += dt * 0.0015;
    
    if (!this.moon.parent && (this.earthRef?.holder || this.getEarth()?.holder)) {
      const earth = this.earthRef || this.getEarth();
      const earthHolder = earth.holder;
      this.moonPivot.rotation.x = 0.45;
      earthHolder.add(this.moonPivot);
      this.moon.position.x = 8;
      this.moonPivot.add(this.moon);
    }
    
    if (this.moonPivot.parent) {
      this.moonPivot.rotation.y += dt * 0.8;
      this.moon.rotation.y += dt * 0.4;
    }
  }

  getEarth() {
    return this.planets.find((p) => p.name === "Earth");
  }

  getPlanets() {
    return this.planets;
  }

  getBelt() {
    return this.belt;
  }

  getMoon() {
    return this.moon;
  }
}
