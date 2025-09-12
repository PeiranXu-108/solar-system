import * as THREE from "three";
import { SceneManager } from "./core/SceneManager.js";
import { TextureManager } from "./core/TextureManager.js";
import { Starfield } from "./systems/Starfield.js";
import { Lighting } from "./systems/Lighting.js";
import { Sun } from "./systems/Sun.js";
import { PlanetSystem } from "./systems/PlanetSystem.js";
import { InteractionController } from "./controls/InteractionController.js";
import { LabelController } from "./controls/LabelController.js";
import { UIController } from "./ui/UIController.js";
import { TestController } from "./ui/TestController.js";
import { EarthMode } from "./modes/EarthMode.js";

class SolarSystemApp {
  constructor() {
    this.clock = new THREE.Clock();
    this.init();
  }

  init() {
    // 初始化核心管理器
    this.sceneManager = new SceneManager();
    this.textureManager = new TextureManager();
    
    // 初始化系统组件
    this.starfield = new Starfield(this.sceneManager.getScene());
    this.lighting = new Lighting(this.sceneManager.getScene(), this.textureManager);
    this.sun = new Sun(this.sceneManager.getScene(), this.textureManager);
    this.planetSystem = new PlanetSystem(this.sceneManager.getScene(), this.textureManager);
    
    // 初始化地球模式
    this.earthMode = new EarthMode(
      this.sceneManager.getScene(),
      this.planetSystem,
      this.textureManager,
      null // 先传null，稍后设置
    );
    
    // 初始化控制器
    this.interactionController = new InteractionController(
      this.sceneManager.getCamera(),
      this.sceneManager.getControls(),
      this.planetSystem,
      this.earthMode
    );
    this.labelController = new LabelController(
      this.sceneManager.getCamera(),
      this.planetSystem
    );
    this.uiController = new UIController(
      this.sceneManager,
      this.planetSystem,
      this.interactionController
    );
    this.testController = new TestController(this.sceneManager, this.planetSystem);
    
    // 设置地球模式的交互控制器引用
    this.earthMode.interactionController = this.interactionController;
    
    // 设置全局函数（为了兼容测试）
    window.enterEarthMode = () => this.earthMode.enterEarthMode();
    window.exitEarthMode = () => this.earthMode.exitEarthMode();
    
    // 开始动画循环
    this.animate();
    
    // 执行开场动画
    this.introDolly();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const dt = this.clock.getDelta();
    const beat = this.uiController.getBeat();
    
    if (!this.uiController.isPaused()) {
      const t = dt * this.uiController.getTimeScale();
      
      // 更新星空
      this.starfield.update(dt);
      
      // 更新太阳
      this.sun.update(t);
      
      // 更新行星系统
      this.planetSystem.update(t);
      
      // 更新地球模式
      this.earthMode.update(t);
      
      // 更新标签
      this.labelController.updateLabels();
    }
    
    // 更新光照效果
    this.lighting.update(beat);
    
    // 更新泛光效果
    if (this.uiController.getAnalyser()) {
      this.sceneManager.getBloomPass().strength = 0.8 + beat * 0.8;
    }
    
    // 更新像素比例
    this.starfield.updatePixelRatio();
    
    // 渲染场景
    this.sceneManager.render();
  }

  introDolly() {
    (async () => {
      await new Promise((r) => setTimeout(r, 400));
      const target = new THREE.Vector3(0, 0, 0);
      let k = 0;
      const dur = 2.6;
      const start = this.sceneManager.getCamera().position.clone();
      const end = new THREE.Vector3(0, 90, 250);
      const ease = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
      
      (function tick() {
        k += 1 / 60;
        const e = ease(Math.min(1, k / dur));
        this.sceneManager.getCamera().position.lerpVectors(start, end, e);
        this.sceneManager.getControls().target.lerpVectors(
          this.sceneManager.getControls().target.clone(),
          target,
          e
        );
        if (e < 1) requestAnimationFrame(tick);
      }.bind(this))();
    })();
  }
}

// 启动应用
new SolarSystemApp();
