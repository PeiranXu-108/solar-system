import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useSolarSystem } from '../contexts/SolarSystemContext';
import { PlanetInstance } from '../types';

interface UseAnimationProps {
  scene?: THREE.Scene;
  renderer?: THREE.WebGLRenderer;
  camera?: THREE.PerspectiveCamera;
  controls?: any;
  composer?: any;
  planets: PlanetInstance[];
  stars?: THREE.Points;
  sun?: THREE.Mesh;
  belt?: THREE.Points;
  earthClouds?: THREE.Mesh;
  moonPivot?: THREE.Group;
}

export function useAnimation({
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
}: UseAnimationProps) {
  const { state } = useSolarSystem();
  const clockRef = useRef(new THREE.Clock());
  const animationIdRef = useRef<number>();

  const animate = useCallback(() => {
    // Render even if composer is not ready yet
    if (!scene || !renderer || !camera || !controls) {
      console.log('Animation: Missing required objects', {
        scene: !!scene,
        renderer: !!renderer,
        camera: !!camera,
        controls: !!controls,
        composer: !!composer
      });
      return;
    }

    const dt = clockRef.current.getDelta();
    
    if (!state.paused) {
      const t = dt * state.timeScale;
      
      // Animate stars
      if (stars) {
        stars.rotation.y += t * 0.005;
      }
      
      // Animate sun
      if (sun) {
        sun.rotation.y += t * 0.02;
      }
      
      // Animate planets
      planets.forEach(planet => {
        planet.pivot.rotation.y += t * (planet.orbitSpeed * 0.02);
        planet.mesh.rotation.y += t * planet.rotationSpeed;
      });
      
      // Animate asteroid belt
      if (belt) {
        belt.rotation.y += t * 0.0015;
      }
      
      // Animate earth clouds
      if (earthClouds) {
        earthClouds.rotation.y += t * 0.02;
      }
      
      // Animate moon
      if (moonPivot && moonPivot.parent) {
        moonPivot.rotation.y += t * 0.8;
        const moon = moonPivot.children[0] as THREE.Mesh;
        if (moon) {
          moon.rotation.y += t * 0.4;
        }
      }
    }

    // Update orbit controls
    controls.update();

    // Update planet label screen positions
    if (planets && planets.length) {
      const width = renderer.domElement.clientWidth;
      const height = renderer.domElement.clientHeight;
      const proj = new THREE.Vector3();
      planets.forEach(p => {
        p.mesh.getWorldPosition(proj);
        proj.project(camera);
        const x = (proj.x * 0.5 + 0.5) * width;
        const y = (-proj.y * 0.5 + 0.5) * height;
        p.label.style.left = `${x}px`;
        p.label.style.top = `${y}px`;
        // Basic hide when behind camera or off-screen
        const onScreen = proj.z < 1 && proj.z > -1 && x >= -50 && x <= width + 50 && y >= -50 && y <= height + 50;
        p.label.style.display = onScreen ? 'block' : 'none';
      });
    }

    // 暂时绕过composer，直接渲染
    renderer.render(scene, camera);
    
    // Debug: log every 60 frames to avoid spam
    // Reduced logging to avoid spamming console
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [scene, renderer, camera, controls, composer, planets, stars, sun, belt, earthClouds, moonPivot, state.paused, state.timeScale]);

  useEffect(() => {
    animate();
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [animate]);

  return { animate };
}
