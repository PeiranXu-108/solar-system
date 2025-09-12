import React from 'react';
import { useSolarSystem } from '../contexts/SolarSystemContext';
import { usePlanetInteraction } from '../contexts/PlanetInteractionContext';

export function Controls() {
  const { state, dispatch, updateUIControls } = useSolarSystem();
  const { focusEarth } = usePlanetInteraction();

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    dispatch({ type: 'SET_TIME_SCALE', payload: value });
    updateUIControls({ speed: value });
  };

  const handleBloomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    dispatch({ type: 'SET_BLOOM_STRENGTH', payload: value });
    updateUIControls({ bloom: value });
  };

  const handlePauseToggle = () => {
    const newPaused = !state.paused;
    dispatch({ type: 'SET_PAUSED', payload: newPaused });
    updateUIControls({ pause: newPaused });
  };

  const handleEarthModeToggle = () => {
    const newEarthMode = !state.earthMode;
    dispatch({ type: 'SET_EARTH_MODE', payload: newEarthMode });
    updateUIControls({ earthMode: newEarthMode });
  };

  const handleAudioToggle = () => {
    const newAudioEnabled = !state.audioEnabled;
    dispatch({ type: 'SET_AUDIO_ENABLED', payload: newAudioEnabled });
    updateUIControls({ audioSync: newAudioEnabled });
  };

  const handleFocusEarth = () => {
    focusEarth();
  };

  return (
    <div className="hud">
      <button onClick={handlePauseToggle}>
        {state.paused ? '▶️ Play' : '⏯️ Pause'}
      </button>
      
      <div className="group">
        <label htmlFor="speed">Time Scale</label>
        <input
          id="speed"
          type="range"
          min="0"
          max="8"
          step="0.1"
          value={state.timeScale}
          onChange={handleSpeedChange}
        />
      </div>
      
      <div className="group">
        <label htmlFor="bloom">Bloom</label>
        <input
          id="bloom"
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={state.bloomStrength}
          onChange={handleBloomChange}
        />
      </div>
      
      <button onClick={handleFocusEarth}>Focus Earth</button>
      
      <button onClick={handleEarthModeToggle}>
        {state.earthMode ? 'Solar Mode' : 'Earth Mode'}
      </button>
      
      <button onClick={handleAudioToggle}>
        {state.audioEnabled ? 'Audio Off' : 'Audio Sync'}
      </button>
      
      {state.audioEnabled && (
        <input
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          id="audioFile"
        />
      )}
    </div>
  );
}
