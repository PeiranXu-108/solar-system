import * as THREE from "three";
import { Lensflare, LensflareElement } from "three/addons/objects/Lensflare.js";

export class Lighting {
  constructor(scene, textureManager) {
    this.scene = scene;
    this.textureManager = textureManager;
    this.sunLight = null;
    this.init();
  }

  init() {
    this.createAmbientLight();
    this.createHemisphereLight();
    this.createSunLight();
    this.createLensFlare();
    this.createNebulas();
  }

  createAmbientLight() {
    // 增强环境光，让行星表面更亮
    const ambient = new THREE.AmbientLight(0x404060, 0.8);
    this.scene.add(ambient);
  }

  createHemisphereLight() {
    // 增强半球光，提供更好的基础照明
    const hemi = new THREE.HemisphereLight(0x404060, 0x202040, 0.6);
    this.scene.add(hemi);
  }

  createSunLight() {
    // 增强太阳光强度，让行星表面更亮
    this.sunLight = new THREE.PointLight(0xffe9a6, 4.5, 0, 2);
    this.sunLight.castShadow = false;
    this.scene.add(this.sunLight);
    
    // 添加补光，照亮行星的阴影面
    this.createFillLights();
  }
  
  createFillLights() {
    // 创建补光1：从侧面照亮
    const fillLight1 = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight1.position.set(-50, 30, 0);
    this.scene.add(fillLight1);
    
    // 创建补光2：从后方照亮
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight2.position.set(0, 0, -50);
    this.scene.add(fillLight2);
    
    // 创建点光源：提供全方位照明
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 200);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);
  }

  createLensFlare() {
    const flare0 = this.textureManager.loadTexture(this.textureManager.getLensTexture("lensflare0.png"));
    const flare3 = this.textureManager.loadTexture(this.textureManager.getLensTexture("lensflare3.png"));
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(flare0, 300, 0));
    lensflare.addElement(new LensflareElement(flare3, 60, 0.6));
    lensflare.addElement(new LensflareElement(flare3, 40, 0.7));
    this.sunLight.add(lensflare);
  }

  createNebulas() {
    const nebulaTex = this.textureManager.loadTexture(this.textureManager.getLensTexture("lensflare0.png"));
    this.nebulas = [];
    
    for (let i = 0; i < 4; i++) {
      const sm = new THREE.SpriteMaterial({
        map: nebulaTex,
        color: 0x66aaff,
        transparent: true,
        opacity: 0.05,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sp = new THREE.Sprite(sm);
      sp.scale.setScalar(800 + Math.random() * 400);
      sp.position.set(
        THREE.MathUtils.randFloatSpread(1200),
        THREE.MathUtils.randFloatSpread(200),
        THREE.MathUtils.randFloatSpread(1200)
      );
      this.nebulas.push(sp);
      this.scene.add(sp);
    }
  }

  update(beat) {
    if (beat > 0) {
      this.nebulas.forEach((n) => (n.material.opacity = 0.03 + beat * 0.12));
    }
  }

  getSunLight() {
    return this.sunLight;
  }

  getNebulas() {
    return this.nebulas;
  }
}
