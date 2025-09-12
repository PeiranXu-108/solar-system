import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export class SceneManager {
  constructor() {
    this.container = document.getElementById("app");
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.composer = null;
    this.bloomPass = null;
    
    this.init();
  }

  init() {
    this.createRenderer();
    this.createCamera();
    this.createControls();
    this.createPostProcessing();
    this.setupScene();
    this.setupResize();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2.25;
    this.container.appendChild(this.renderer.domElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    this.camera.position.set(0, 120, 330);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.04;
    this.controls.minDistance = 60;
    this.controls.maxDistance = 1200;
  }

  createPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.9,
      0.8,
      0.02
    );
    this.composer.addPass(renderPass);
    this.composer.addPass(this.bloomPass);
  }

  setupScene() {
    this.scene.fog = new THREE.FogExp2(0x05070c, 0.0008);
  }

  setupResize() {
    const onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
  }

  render() {
    this.controls.update();
    this.composer.render();
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  getControls() {
    return this.controls;
  }

  getRenderer() {
    return this.renderer;
  }

  getBloomPass() {
    return this.bloomPass;
  }
}
