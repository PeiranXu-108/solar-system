import React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Lensflare } from 'three/examples/jsm/objects/Lensflare.js';
import { useThreeScene } from '../hooks/useThreeScene';
import { useAnimation } from '../hooks/useAnimation';
import { usePlanetInteractions } from '../hooks/usePlanetInteractions';
import { createPlanet, planetData } from '../utils/planetFactory';
import { PLANET_BASE } from '../config/assets';
import { useSolarSystem } from '../contexts/SolarSystemContext';
import { PlanetInstance } from '../types';

const IMG_BASE = PLANET_BASE;

const texLoader = new THREE.TextureLoader();

const loadColorTex = (url: string) => {
  const t = texLoader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

interface SolarSystemProps {
  onInteractionReady?: (interactions: { focusEarth: () => void; flyToPlanet: (planet: PlanetInstance) => void }) => void;
}

export function SolarSystem({ onInteractionReady }: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const { scene, renderer, camera, controls, composer, bloomPass } = useThreeScene(containerRef);
  const { state } = useSolarSystem();
  const [planets, setPlanets] = useState<PlanetInstance[]>([]);
  const [stars, setStars] = useState<THREE.Points>();
  const [sun, setSun] = useState<THREE.Mesh>();
  const [belt, setBelt] = useState<THREE.Points>();
  const [moonPivot, setMoonPivot] = useState<THREE.Group>();
  const [earthClouds] = useState<THREE.Mesh>();

  // Initialize scene elements
  useEffect(() => {
    if (!scene || !camera) {
      return;
    }
    

    // Create starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 8000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      const r = THREE.MathUtils.randFloat(600, 2000);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(THREE.MathUtils.randFloatSpread(2));
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
      positions[i * 3 + 1] = r * Math.cos(ph) * 0.4;
      positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      sizes[i] = Math.random() * 2.5 + 0.5;
    }
    
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    
    const starMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uPixelRatio;
        varying float vTw;
        void main() {
          vTw = fract(sin(dot(position.xyz, vec3(12.9898,78.233,37.719))) * 43758.5453);
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uPixelRatio * (80.0 / -mv.z);
          gl_PointSize = max(gl_PointSize, 1.0);
        }
      `,
      fragmentShader: `
        varying float vTw;
        void main() {
          float d = length(gl_PointCoord-0.5);
          float a = smoothstep(0.5,0.2,0.5-d);
          float tw = smoothstep(0.0,1.0,vTw);
          gl_FragColor = vec4(vec3(0.75+tw*0.25), a*(0.6+0.4*tw));
        }
      `,
    });
    
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    setStars(stars);

    // Create lighting
    const ambient = new THREE.AmbientLight(0x223355, 0.55);
    scene.add(ambient);
    
    const hemi = new THREE.HemisphereLight(0x324055, 0x000000, 0.35);
    scene.add(hemi);
    
    const sunLight = new THREE.PointLight(0xffe9a6, 3.2, 0, 2);
    sunLight.castShadow = false;
    scene.add(sunLight);

    // Create lens flare (simplified without textures)
    const lensflare = new Lensflare();
    // Add simple lensflare elements without textures
    sunLight.add(lensflare);

    // Create sun
    const sunTex = loadColorTex(IMG_BASE + '2k_sun.jpg');
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(18, 64, 64),
      new THREE.MeshBasicMaterial({ map: sunTex })
    );
    sunMesh.material.color.set(0xffa500);
    scene.add(sunMesh);
    setSun(sunMesh);

    // Add sun glow (using a simple colored sprite instead of texture)
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        color: 0xffc266,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
    );
    glow.scale.set(150, 150, 1);
    sunMesh.add(glow);

    // Create nebulas (using simple colored sprites instead of textures)
    for (let i = 0; i < 4; i++) {
      const sm = new THREE.SpriteMaterial({
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
      scene.add(sp);
    }

    // Create asteroid belt
    const beltGeo = new THREE.BufferGeometry();
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
    
    beltGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const beltMat = new THREE.PointsMaterial({
      size: 0.7,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.9,
    });
    const beltPoints = new THREE.Points(beltGeo, beltMat);
    scene.add(beltPoints);
    setBelt(beltPoints);

    // Create moon pivot
    const moonPivotGroup = new THREE.Group();
    setMoonPivot(moonPivotGroup);

    // Create planets
    if (labelContainerRef.current) {
      const planetInstances = planetData.map(planetData => 
        createPlanet(scene, planetData, labelContainerRef.current!)
      );
      setPlanets(planetInstances);

      // Add moon to Earth
      const earth = planetInstances.find(p => p.name === 'Earth');
      if (earth) {
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(1.1, 32, 32),
          new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 1,
          })
        );
        moonPivotGroup.rotation.x = 0.45;
        earth.holder.add(moonPivotGroup);
        moon.position.x = 8;
        moonPivotGroup.add(moon);
      }
    }

  }, [scene, camera, labelContainerRef.current]);

  // Update bloom strength
  useEffect(() => {
    if (bloomPass) {
      bloomPass.strength = state.bloomStrength;
    }
  }, [bloomPass, state.bloomStrength]);

  // Planet interactions
  const { focusEarth, flyToPlanet } = usePlanetInteractions({
    scene,
    camera,
    controls,
    planets,
  });

  // Expose interaction functions to parent
  useEffect(() => {
    if (onInteractionReady) {
      onInteractionReady({ focusEarth, flyToPlanet });
    }
  }, [onInteractionReady, focusEarth, flyToPlanet]);

  // Animation
  useAnimation({
    scene,
    renderer,
    camera,
    controls,
    composer,
    planets,
    stars,
    sun,
    belt,
    earthClouds,
    moonPivot,
  });

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div ref={labelContainerRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
    </>
  );
}
