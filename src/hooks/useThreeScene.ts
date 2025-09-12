import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export function useThreeScene(containerRef: React.RefObject<HTMLDivElement>) {
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const composerRef = useRef<EffectComposer>();
  const bloomPassRef = useRef<UnrealBloomPass>();
  const animationIdRef = useRef<number>();
  // Force a re-render once objects are initialized so consumers receive them
  const [, setReadyTick] = useState(0);

  const initScene = useCallback(() => {
    if (!containerRef.current) {
      console.log('Container ref not ready');
      return;
    }
    
    console.log('Initializing Three.js scene...');

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070c, 0.0008);
    sceneRef.current = scene;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1); // 设置黑色背景
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.25;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    console.log('Renderer created and added to container');
    console.log('Canvas element:', renderer.domElement);
    console.log('Canvas size:', renderer.domElement.width, 'x', renderer.domElement.height);
    console.log('Container element:', containerRef.current);
    console.log('Container size:', containerRef.current.offsetWidth, 'x', containerRef.current.offsetHeight);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75, // 增大视野角度
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    camera.position.set(0, 5, 20); // 调整相机位置，稍微高一点，近一点
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.minDistance = 60;
    controls.maxDistance = 1200;
    controlsRef.current = controls;

    // Post Processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.9,
      0.8,
      0.02
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    // Trigger a re-render so that the hook returns initialized objects
    setReadyTick((n) => n + 1);

    return { scene, renderer, camera, controls, composer, bloomPass };
  }, [containerRef, setReadyTick]);

  const cleanup = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    if (controlsRef.current) {
      controlsRef.current.dispose();
    }
  }, []);

  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current || !composerRef.current) return;

    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    composerRef.current.setSize(window.innerWidth, window.innerHeight);
  }, []);

  useEffect(() => {
    initScene();

    window.addEventListener('resize', handleResize);

    return () => {
      cleanup();
      window.removeEventListener('resize', handleResize);
    };
  }, [initScene, cleanup, handleResize]);

  const result = {
    scene: sceneRef.current,
    renderer: rendererRef.current,
    camera: cameraRef.current,
    controls: controlsRef.current,
    composer: composerRef.current,
    bloomPass: bloomPassRef.current,
  };
  
  console.log('useThreeScene returning:', {
    scene: !!result.scene,
    renderer: !!result.renderer,
    camera: !!result.camera,
    controls: !!result.controls,
    composer: !!result.composer,
    bloomPass: !!result.bloomPass,
  });
  
  return result;
}
