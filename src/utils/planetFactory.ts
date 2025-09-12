import * as THREE from 'three';
import { PlanetData, PlanetInstance } from '../types';
import { PLANET_BASE } from '../config/assets';

const IMG_BASE = PLANET_BASE;

const texLoader = new THREE.TextureLoader();

const loadColorTex = (url: string) => {
  const t = texLoader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const makeOrbit = (radius: number, tilt = 0) => {
  const g = new THREE.BufferGeometry();
  const seg = 256;
  const v: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    v.push(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
  const m = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.6,
  });
  const loop = new THREE.LineLoop(g, m);
  loop.rotation.x = tilt;
  return loop;
};

export const createPlanet = (
  scene: THREE.Scene,
  planetData: PlanetData,
  labelContainer: HTMLElement
): PlanetInstance => {
  const group = new THREE.Group();
  scene.add(group);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(planetData.radius, 64, 64),
    new THREE.MeshStandardMaterial({
      map: planetData.texture ? loadColorTex(planetData.texture) : null,
      color: 0xffffff,
      metalness: 0.0,
      roughness: 1.0,
    })
  );

  if (planetData.normalMap) {
    (mesh.material as THREE.MeshStandardMaterial).normalMap = texLoader.load(planetData.normalMap);
  }

  const pivot = new THREE.Group();
  pivot.rotation.x = planetData.orbitInclination || 0;
  group.add(pivot);

  const holder = new THREE.Group();
  holder.position.x = planetData.distance;
  pivot.add(holder);

  mesh.rotation.z = planetData.axialTilt || 0;
  holder.add(mesh);

  const orbit = makeOrbit(planetData.distance, planetData.orbitInclination || 0);
  group.add(orbit);

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = planetData.name;
  labelContainer.appendChild(label);

  // Add ring if specified
  if (planetData.ring) {
    const ringGeo = new THREE.RingGeometry(planetData.ring.inner, planetData.ring.outer, 128, 1);
    const ringMat = new THREE.MeshBasicMaterial({
      map: loadColorTex(planetData.ring.texture),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(mesh.position);
    holder.add(ringMesh);
  }

  return {
    name: planetData.name,
    pivot,
    holder,
    mesh,
    label,
    distance: planetData.distance,
    orbitSpeed: planetData.orbitSpeed,
    rotationSpeed: planetData.rotationSpeed,
    orbitInclination: planetData.orbitInclination || 0,
    axialTilt: planetData.axialTilt || 0,
  };
};

export const planetData: PlanetData[] = [
  {
    name: 'Mercury',
    radius: 2,
    distance: 30,
    orbitSpeed: 4.8,
    rotationSpeed: 0.01,
    texture: IMG_BASE + '2k_mercury.jpg',
    orbitInclination: THREE.MathUtils.degToRad(7),
    axialTilt: THREE.MathUtils.degToRad(0.03),
  },
  {
    name: 'Venus',
    radius: 3.5,
    distance: 42,
    orbitSpeed: 3.5,
    rotationSpeed: 0.008,
    texture: IMG_BASE + '2k_venus_surface.jpg',
    orbitInclination: THREE.MathUtils.degToRad(3.4),
    axialTilt: THREE.MathUtils.degToRad(177),
  },
  {
    name: 'Earth',
    radius: 3.8,
    distance: 58,
    orbitSpeed: 3.0,
    rotationSpeed: 0.03,
    texture: IMG_BASE + '2k_earth.jpg',
    orbitInclination: 0,
    axialTilt: THREE.MathUtils.degToRad(23.4),
  },
  {
    name: 'Mars',
    radius: 3.0,
    distance: 74,
    orbitSpeed: 2.4,
    rotationSpeed: 0.024,
    texture: IMG_BASE + '2k_mars.jpg',
    orbitInclination: THREE.MathUtils.degToRad(1.85),
    axialTilt: THREE.MathUtils.degToRad(25.2),
  },
  {
    name: 'Jupiter',
    radius: 11.5,
    distance: 160,
    orbitSpeed: 1.6,
    rotationSpeed: 0.05,
    texture: IMG_BASE + '2k_jupiter.jpg',
    orbitInclination: THREE.MathUtils.degToRad(1.3),
    axialTilt: THREE.MathUtils.degToRad(3.1),
  },
  {
    name: 'Saturn',
    radius: 9.8,
    distance: 210,
    orbitSpeed: 1.2,
    rotationSpeed: 0.04,
    texture: IMG_BASE + '2k_saturn.jpg',
    // ring: { inner: 14, outer: 22, texture: IMG_BASE + 'saturnring.png' },
    orbitInclination: THREE.MathUtils.degToRad(2.5),
    axialTilt: THREE.MathUtils.degToRad(26.7),
  },
  {
    name: 'Uranus',
    radius: 7.2,
    distance: 260,
    orbitSpeed: 0.9,
    rotationSpeed: 0.03,
    texture: IMG_BASE + '2k_uranus.jpg',
    orbitInclination: THREE.MathUtils.degToRad(0.8),
    axialTilt: THREE.MathUtils.degToRad(97.8),
  },
  {
    name: 'Neptune',
    radius: 7.0,
    distance: 300,
    orbitSpeed: 0.7,
    rotationSpeed: 0.03,
    texture: IMG_BASE + '2k_neptune.jpg',
    orbitInclination: THREE.MathUtils.degToRad(1.8),
    axialTilt: THREE.MathUtils.degToRad(28.3),
  },
];
