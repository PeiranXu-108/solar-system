import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SolarSystemState, CameraState, UIControls, AudioState } from '../types';

interface SolarSystemContextType {
  state: SolarSystemState;
  cameraState: CameraState;
  uiControls: UIControls;
  audioState: AudioState;
  dispatch: React.Dispatch<SolarSystemAction>;
  updateCamera: (camera: Partial<CameraState>) => void;
  updateUIControls: (controls: Partial<UIControls>) => void;
  updateAudioState: (audio: Partial<AudioState>) => void;
}

type SolarSystemAction =
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_TIME_SCALE'; payload: number }
  | { type: 'SET_BLOOM_STRENGTH'; payload: number }
  | { type: 'SET_EARTH_MODE'; payload: boolean }
  | { type: 'SET_CURRENT_TARGET'; payload: any }
  | { type: 'SET_AUDIO_ENABLED'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialState: SolarSystemState = {
  paused: false,
  timeScale: 1.0,
  bloomStrength: 0.9,
  earthMode: false,
  currentTarget: null,
  audioEnabled: false,
};

const initialCameraState: CameraState = {
  position: { x: 0, y: 120, z: 330 } as any,
  target: { x: 0, y: 0, z: 0 } as any,
  autoRotate: false,
};

const initialUIControls: UIControls = {
  speed: 1.0,
  bloom: 0.9,
  pause: false,
  earthMode: false,
  audioSync: false,
};

const initialAudioState: AudioState = {
  analyser: null,
  dataArray: null,
  audioContext: null,
  audioElement: null,
};

function solarSystemReducer(state: SolarSystemState, action: SolarSystemAction): SolarSystemState {
  switch (action.type) {
    case 'SET_PAUSED':
      return { ...state, paused: action.payload };
    case 'SET_TIME_SCALE':
      return { ...state, timeScale: action.payload };
    case 'SET_BLOOM_STRENGTH':
      return { ...state, bloomStrength: action.payload };
    case 'SET_EARTH_MODE':
      return { ...state, earthMode: action.payload };
    case 'SET_CURRENT_TARGET':
      return { ...state, currentTarget: action.payload };
    case 'SET_AUDIO_ENABLED':
      return { ...state, audioEnabled: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const SolarSystemContext = createContext<SolarSystemContextType | undefined>(undefined);

export function SolarSystemProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(solarSystemReducer, initialState);
  const [cameraState, setCameraState] = React.useState<CameraState>(initialCameraState);
  const [uiControls, setUIControls] = React.useState<UIControls>(initialUIControls);
  const [audioState, setAudioState] = React.useState<AudioState>(initialAudioState);

  const updateCamera = React.useCallback((camera: Partial<CameraState>) => {
    setCameraState(prev => ({ ...prev, ...camera }));
  }, []);

  const updateUIControls = React.useCallback((controls: Partial<UIControls>) => {
    setUIControls(prev => ({ ...prev, ...controls }));
  }, []);

  const updateAudioState = React.useCallback((audio: Partial<AudioState>) => {
    setAudioState(prev => ({ ...prev, ...audio }));
  }, []);

  const value = React.useMemo(() => ({
    state,
    cameraState,
    uiControls,
    audioState,
    dispatch,
    updateCamera,
    updateUIControls,
    updateAudioState,
  }), [state, cameraState, uiControls, audioState, dispatch, updateCamera, updateUIControls, updateAudioState]);

  return (
    <SolarSystemContext.Provider value={value}>
      {children}
    </SolarSystemContext.Provider>
  );
}

export function useSolarSystem() {
  const context = useContext(SolarSystemContext);
  if (context === undefined) {
    throw new Error('useSolarSystem must be used within a SolarSystemProvider');
  }
  return context;
}
