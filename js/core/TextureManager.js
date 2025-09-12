import * as THREE from "three";

export class TextureManager {
  constructor() {
    this.TEX_BASE = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r161/examples/textures/";
    this.PLANET = this.TEX_BASE + "planets/";
    this.SPRITE = this.TEX_BASE + "sprites/";
    this.LENS = this.TEX_BASE + "lensflare/";
    this.IMG_BASE = "static/planets/";
    
    this.texLoader = new THREE.TextureLoader();
  }

  loadColorTex(url) {
    const t = this.texLoader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  loadTexture(url, colorSpace = THREE.SRGBColorSpace) {
    const texture = this.texLoader.load(url);
    texture.colorSpace = colorSpace;
    return texture;
  }

  getPlanetTexture(filename) {
    return this.PLANET + filename;
  }

  getSpriteTexture(filename) {
    return this.SPRITE + filename;
  }

  getLensTexture(filename) {
    return this.LENS + filename;
  }

  getImageTexture(filename) {
    return this.IMG_BASE + filename;
  }
}
