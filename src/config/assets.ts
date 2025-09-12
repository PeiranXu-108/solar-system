// Resolve where planet textures are served from.
// Default to `/planets/` (Vite `public/planets`),
// but can be overridden via Vite env: VITE_PLANET_BASE=/static/planets/
const raw = (import.meta as any).env?.VITE_PLANET_BASE || '/planets/';
export const PLANET_BASE = raw.endsWith('/') ? raw : raw + '/';

