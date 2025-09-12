import React from 'react';
import { useState, useCallback } from 'react';
import { SolarSystemProvider } from './contexts/SolarSystemContext';
import { PlanetInteractionProvider } from './contexts/PlanetInteractionContext';
import { SolarSystem } from './components/SolarSystem';
import { Controls } from './components/Controls';
import { InfoCard } from './components/InfoCard';
import { PlanetInstance } from './types';
import './App.css';

function App() {
  const [interactions, setInteractions] = useState<{ focusEarth: () => void; flyToPlanet: (planet: PlanetInstance) => void } | null>(null);

  const handleInteractionReady = useCallback((interactionFunctions: { focusEarth: () => void; flyToPlanet: (planet: PlanetInstance) => void }) => {
    setInteractions(interactionFunctions);
  }, []);

  return (
    <SolarSystemProvider>
      <PlanetInteractionProvider 
        focusEarth={interactions?.focusEarth || (() => {})}
        flyToPlanet={interactions?.flyToPlanet || (() => {})}
      >
        <div className="App">
          <SolarSystem onInteractionReady={handleInteractionReady} />
          <Controls />
          <InfoCard />
          <div className="legend">
            <b>Controls</b> — 左键旋转 · 右键平移 · 滚轮缩放。点击行星可飞过去；新增「Earth Mode」：高精地球 + 云层 + 大气散射。
          </div>
          <div className="credit">
            Built with three.js · PostFX: UnrealBloom · Lensflare · Atmosphere shader
          </div>
        </div>
      </PlanetInteractionProvider>
    </SolarSystemProvider>
  );
}

export default App;
