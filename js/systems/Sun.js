import * as THREE from "three";

export class Sun {
  constructor(scene, textureManager) {
    this.scene = scene;
    this.textureManager = textureManager;
    this.sun = null;
    this.glow = null;
    this.init();
  }

  init() {
    this.createSun();
    this.createGlow();
  }

  createSun() {
    const sunTex = this.textureManager.loadColorTex(this.textureManager.getImageTexture("2k_sun.jpg"));
    this.sun = new THREE.Mesh(
      new THREE.SphereGeometry(18, 64, 64),
      new THREE.MeshBasicMaterial({ map: sunTex })
    );
    this.scene.add(this.sun);
    this.sun.material.color.set(0xffa500); // 设为更暗的橙色
  }

  createGlow() {
    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.textureManager.loadTexture(this.textureManager.getSpriteTexture("glow.png")),
        color: 0xffc266,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      })
    );
    this.glow.scale.set(150, 150, 1);
    this.sun.add(this.glow);
  }

  update(dt) {
    this.sun.rotation.y += dt * 0.02;
  }

  getSun() {
    return this.sun;
  }
}
