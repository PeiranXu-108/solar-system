import { useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useSolarSystem } from '../contexts/SolarSystemContext';
import { PlanetInstance } from '../types';

interface UsePlanetInteractionsProps {
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  controls?: any;
  planets: PlanetInstance[];
}

export function usePlanetInteractions({
  scene,
  camera,
  controls,
  planets,
}: UsePlanetInteractionsProps) {
  const { dispatch } = useSolarSystem();

  const flyToPlanet = useCallback((planet: PlanetInstance) => {
    if (!camera || !controls) return;

    const worldPos = new THREE.Vector3();
    planet.holder.getWorldPosition(worldPos);
    const dir = worldPos.clone().sub(controls.target).normalize();
    const camStart = camera.position.clone();
    // Ensure final distance respects OrbitControls.minDistance to avoid snapping
    const radius = (planet.mesh.geometry as THREE.SphereGeometry).parameters.radius;
    const desiredDistance = radius * 8 + 20;
    const minDist = typeof controls.minDistance === 'number' ? controls.minDistance : 0;
    const safeDistance = Math.max(desiredDistance, minDist + 1);
    const camEnd = worldPos.clone().add(dir.multiplyScalar(safeDistance));
    const targetStart = controls.target.clone();
    const targetEnd = worldPos.clone();
    
    let k = 0;
    const dur = 1.6;
    const ease = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
    
    const animate = () => {
      k += 1 / 60;
      const e = ease(Math.min(1, k / dur));
      camera.position.lerpVectors(camStart, camEnd, e);
      controls.target.lerpVectors(targetStart, targetEnd, e);
      if (e < 1) requestAnimationFrame(animate);
    };
    
    animate();
    dispatch({ type: 'SET_CURRENT_TARGET', payload: planet });
  }, [camera, controls, dispatch]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!camera || !scene) return;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const meshes = planets.map(p => p.mesh);
    const intersection = raycaster.intersectObjects(meshes, false)[0];

    if (intersection) {
      const planet = planets.find(p => p.mesh === intersection.object);
      if (planet) {
        flyToPlanet(planet);
      }
    } else {
      dispatch({ type: 'SET_CURRENT_TARGET', payload: null });
    }
  }, [camera, scene, planets, flyToPlanet, dispatch]);

  const focusEarth = useCallback(() => {
    const earth = planets.find(p => p.name === 'Earth');
    if (earth) {
      flyToPlanet(earth);
    }
  }, [planets, flyToPlanet]);

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [handlePointerDown]);

  return {
    flyToPlanet,
    focusEarth,
  };
}
