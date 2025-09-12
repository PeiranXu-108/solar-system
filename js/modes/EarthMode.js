import * as THREE from "three";

export class EarthMode {
  constructor(scene, planetSystem, textureManager, interactionController) {
    this.scene = scene;
    this.planetSystem = planetSystem;
    this.textureManager = textureManager;
    this.interactionController = interactionController;
    this.earthClouds = null;
    this.earthAtmo = null;
    this.earthModeBtn = null;
    this.solarModeBtn = null;
    this.infoCard = null;
    this.earthModeLights = [];
    
    this.init();
  }

  init() {
    this.earthModeBtn = document.getElementById("earthMode");
    this.solarModeBtn = document.getElementById("solarMode");
    this.infoCard = document.getElementById("infoCard");
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.earthModeBtn) {
      this.earthModeBtn.addEventListener("click", () => this.enterEarthMode());
    }
    if (this.solarModeBtn) {
      this.solarModeBtn.addEventListener("click", () => this.exitEarthMode());
    }
  }

  makeAtmosphere(radius) {
    const atmoGeo = new THREE.SphereGeometry(radius * 1.03, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.35 },
        p: { value: 2.2 },
        glowColor: { value: new THREE.Color(0x4fa8ff) },
        viewVector: { value: this.scene.getObjectByName('camera')?.position || new THREE.Vector3() },
      },
      vertexShader: `uniform vec3 viewVector; varying float intensity; void main(){ vec3 vNormal = normalize(normalMatrix * normal); vec3 vNormel = normalize(normalMatrix * (modelViewMatrix * vec4(position,1.0)).xyz); intensity = pow(0.6 - dot(vNormal, normalize(viewVector - (modelMatrix * vec4(position,1.0)).xyz)), 2.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 glowColor; varying float intensity; void main(){ gl_FragColor = vec4(glowColor, intensity*0.9); }`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    return new THREE.Mesh(atmoGeo, atmoMat);
  }

  createEarthModeLighting() {
    // 创建环境光，提供基础照明
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    this.earthModeLights.push(ambientLight);
    
    // 创建主光源，模拟太阳光
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(50, 50, 50);
    mainLight.castShadow = false;
    this.scene.add(mainLight);
    this.earthModeLights.push(mainLight);
    
    // 创建补光，照亮阴影区域
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4);
    fillLight.position.set(-30, 20, -30);
    this.scene.add(fillLight);
    this.earthModeLights.push(fillLight);
    
    // 创建点光源，提供额外的照明
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight.position.set(0, 0, 30);
    this.scene.add(pointLight);
    this.earthModeLights.push(pointLight);
  }

  removeEarthModeLighting() {
    // 移除地球模式专用光照
    this.earthModeLights.forEach(light => {
      this.scene.remove(light);
    });
    this.earthModeLights = [];
  }

  flyToEarthCloseUp(earth) {
    const worldPos = new THREE.Vector3();
    earth.holder.getWorldPosition(worldPos);
    
    // 计算让地球占据屏幕95%高度的距离
    const earthRadius = earth.mesh.geometry.parameters.radius;
    const fov = this.interactionController.camera.fov || 55; // 获取相机FOV
    const fovRad = THREE.MathUtils.degToRad(fov);
    const screenHeight = window.innerHeight;
    const desiredHeight = screenHeight * 0.5; // 让地球占据巨大的空间，创造震撼的视觉效果
    
    // 计算所需距离：distance = radius / tan(fov/2) * (screenHeight / desiredHeight)
    const distance = earthRadius / Math.tan(fovRad / 2) * (screenHeight / desiredHeight);
    
    const dir = worldPos.clone().sub(this.interactionController.controls.target).normalize();
    const camStart = this.interactionController.camera.position.clone();
    const camEnd = worldPos.clone().add(dir.multiplyScalar(distance));
    const targetStart = this.interactionController.controls.target.clone();
    const targetEnd = worldPos.clone();
    
    let k = 0;
    const dur = 2.5; // 稍长的动画时间
    const ease = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
    
    const step = () => {
      k += 1 / 60;
      const e = ease(Math.min(1, k / dur));
      this.interactionController.camera.position.lerpVectors(camStart, camEnd, e);
      this.interactionController.controls.target.lerpVectors(targetStart, targetEnd, e);
      if (e < 1) requestAnimationFrame(step);
    };
    
    step();
    
    // 显示信息卡片
    this.interactionController.setInfoCard(earth);
    this.interactionController.currentTarget = earth;
  }

  enterEarthMode() {
    const earth = this.planetSystem.getEarth();
    if (!earth) return;
    
    // 隐藏所有其他天体
    this.planetSystem.getPlanets().forEach((p) => {
      if (p.name !== "Earth") {
        p.pivot.visible = false;
        p.label.style.display = "none";
      }
    });
    
    // 隐藏小行星带
    this.planetSystem.getBelt().visible = false;
    
    // 添加地球模式专用光照
    this.createEarthModeLighting();
    
    // 创建高精度地球材质
    const spec = this.textureManager.loadTexture(
      this.textureManager.getPlanetTexture("earth_specular_2048.jpg"),
      THREE.LinearSRGBColorSpace
    );
    const lights = this.textureManager.loadTexture(
      this.textureManager.getPlanetTexture("earth_lights_2048.png"),
      THREE.SRGBColorSpace
    );
    const normal = this.textureManager.loadTexture(
      this.textureManager.getPlanetTexture("earth_normal_2048.jpg")
    );
    
    earth.mesh.material = new THREE.MeshPhongMaterial({
      map: this.textureManager.loadColorTex(this.textureManager.getPlanetTexture("earth_atmos_2048.jpg")),
      specularMap: spec,
      normalMap: normal,
      shininess: 18,
      emissiveMap: lights,
      emissive: new THREE.Color(0x111133),
      emissiveIntensity: 0.55,
    });
    
    // 创建云层
    if (!this.earthClouds) {
      const cloudsTex = this.textureManager.loadTexture(
        this.textureManager.getPlanetTexture("earth_clouds_2048.png"),
        THREE.SRGBColorSpace
      );
      this.earthClouds = new THREE.Mesh(
        new THREE.SphereGeometry(
          earth.mesh.geometry.parameters.radius * 1.02,
          64,
          64
        ),
        new THREE.MeshLambertMaterial({
          map: cloudsTex,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        })
      );
      earth.holder.add(this.earthClouds);
    }
    
    // 创建大气层
    if (!this.earthAtmo) {
      this.earthAtmo = this.makeAtmosphere(earth.mesh.geometry.parameters.radius);
      earth.holder.add(this.earthAtmo);
    }
    
    // 相机移动到地球 - 自定义距离让地球占据屏幕80%高度
    this.flyToEarthCloseUp(earth);
    
    // 切换按钮显示
    if (this.earthModeBtn) this.earthModeBtn.style.display = "none";
    if (this.solarModeBtn) this.solarModeBtn.style.display = "inline-block";
  }

  exitEarthMode() {
    // 显示所有行星
    this.planetSystem.getPlanets().forEach((p) => {
      p.pivot.visible = true;
      p.label.style.display = "";
    });
    
    // 显示小行星带
    this.planetSystem.getBelt().visible = true;
    
    // 恢复所有隐藏的元素
    this.scene.children.forEach((child) => {
      child.visible = true;
    });
    
    // 移除地球模式专用光照
    this.removeEarthModeLighting();
    
    // 恢复简单地球材质
    const earth = this.planetSystem.getEarth();
    if (earth) {
      earth.mesh.material = new THREE.MeshStandardMaterial({
        map: this.textureManager.loadColorTex(this.textureManager.getPlanetTexture("earth_atmos_2048.jpg")),
        normalMap: this.textureManager.loadTexture(this.textureManager.getPlanetTexture("earth_normal_2048.jpg")),
        metalness: 0,
        roughness: 1,
      });
    }
    
    // 切换按钮显示
    if (this.earthModeBtn) this.earthModeBtn.style.display = "inline-block";
    if (this.solarModeBtn) this.solarModeBtn.style.display = "none";
    if (this.infoCard) this.infoCard.style.display = "none";
  }

  update(dt) {
    if (this.earthClouds) {
      this.earthClouds.rotation.y += dt * 0.02;
    }
  }

  getEarthClouds() {
    return this.earthClouds;
  }
}
