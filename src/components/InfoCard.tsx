import React from 'react';
import { useSolarSystem } from '../contexts/SolarSystemContext';
import * as THREE from 'three';

export function InfoCard() {
  const { state } = useSolarSystem();

  if (!state.currentTarget) {
    return null;
  }

  const planet = state.currentTarget;
  const period = (2 * Math.PI) / (planet.orbitSpeed * 0.02);

  return (
    <div className="card" style={{ display: 'block' }}>
      <h3 id="cardTitle">{planet.name}</h3>
      <div id="cardBody">
        Distance: {planet.distance} (scaled)<br/>
        Orbit inc.: {THREE.MathUtils.radToDeg(planet.orbitInclination).toFixed(1)}°<br/>
        Axial tilt: {THREE.MathUtils.radToDeg(planet.axialTilt).toFixed(1)}°<br/>
        Approx. period: {period.toFixed(1)}s (sim)
      </div>
      <small id="cardTip">Click empty space to dismiss</small>
    </div>
  );
}
