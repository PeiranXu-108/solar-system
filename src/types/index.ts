import * as THREE from 'three';

export interface PlanetData {
  name: string;
  radius: number;
  distance: number;
  orbitSpeed: number;
  rotationSpeed: number;
  texture?: string;
  normalMap?: string;
  ring?: {
    inner: number;
    outer: number;
    texture: string;
  };
  orbitInclination?: number;
  axialTilt?: number;
}

export interface PlanetInstance {
  name: string;
  pivot: THREE.Group;
  holder: THREE.Group;
  mesh: THREE.Mesh;
  label: HTMLElement;
  distance: number;
  orbitSpeed: number;
  rotationSpeed: number;
  orbitInclination: number;
  axialTilt: number;
}

export interface SolarSystemState {
  paused: boolean;
  timeScale: number;
  bloomStrength: number;
  earthMode: boolean;
  currentTarget: PlanetInstance | null;
  audioEnabled: boolean;
}

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  autoRotate: boolean;
}

export interface UIControls {
  speed: number;
  bloom: number;
  pause: boolean;
  earthMode: boolean;
  audioSync: boolean;
}

export interface AudioState {
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
  audioContext: AudioContext | null;
  audioElement: HTMLAudioElement | null;
}
