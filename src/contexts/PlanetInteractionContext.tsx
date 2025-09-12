import React, { createContext, useContext, ReactNode } from 'react';
import { PlanetInstance } from '../types';

interface PlanetInteractionContextType {
  focusEarth: () => void;
  flyToPlanet: (planet: PlanetInstance) => void;
}

const PlanetInteractionContext = createContext<PlanetInteractionContextType | undefined>(undefined);

export function PlanetInteractionProvider({ 
  children, 
  focusEarth, 
  flyToPlanet 
}: { 
  children: ReactNode;
  focusEarth: () => void;
  flyToPlanet: (planet: PlanetInstance) => void;
}) {
  const value = React.useMemo(() => ({
    focusEarth,
    flyToPlanet,
  }), [focusEarth, flyToPlanet]);

  return (
    <PlanetInteractionContext.Provider value={value}>
      {children}
    </PlanetInteractionContext.Provider>
  );
}

export function usePlanetInteraction() {
  const context = useContext(PlanetInteractionContext);
  if (context === undefined) {
    throw new Error('usePlanetInteraction must be used within a PlanetInteractionProvider');
  }
  return context;
}
