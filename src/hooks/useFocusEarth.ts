import { useCallback } from 'react';
import { useSolarSystem } from '../contexts/SolarSystemContext';

export function useFocusEarth() {
  const {} = useSolarSystem();

  const focusEarth = useCallback(() => {
    // This will be implemented by the parent component that has access to planets
    console.log('Focus Earth clicked');
  }, []);

  return { focusEarth };
}
