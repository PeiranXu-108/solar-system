# Solar System - React + Three.js

A beautiful, interactive 3D solar system visualization built with React and Three.js. This project has been refactored from vanilla JavaScript to React for better maintainability and extensibility.

## Features

- 🌍 **Interactive 3D Solar System** - Navigate through all 8 planets with realistic textures
- 🎮 **Intuitive Controls** - Mouse controls for rotation, panning, and zooming
- 🎯 **Planet Focus** - Click on planets to fly to them automatically
- 🌙 **Earth Mode** - Special detailed view of Earth with clouds and atmosphere
- ✨ **Visual Effects** - Bloom effects, lens flares, and atmospheric scattering
- 🎵 **Audio Sync** - Optional audio synchronization for enhanced experience
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **React 18** - Modern React with hooks and context
- **TypeScript** - Type safety and better development experience
- **Three.js** - 3D graphics and WebGL rendering
- **Vite** - Fast build tool and development server
- **CSS3** - Modern styling with backdrop filters and gradients

## Project Structure

```
src/
├── components/          # React components
│   ├── SolarSystem.tsx  # Main 3D scene component
│   ├── Controls.tsx     # UI controls component
│   └── InfoCard.tsx     # Planet information display
├── contexts/            # React contexts for state management
│   ├── SolarSystemContext.tsx
│   └── PlanetInteractionContext.tsx
├── hooks/               # Custom React hooks
│   ├── useThreeScene.ts
│   ├── useAnimation.ts
│   └── usePlanetInteractions.ts
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   └── planetFactory.ts
└── App.tsx             # Main application component
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solor-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Controls

- **Left Mouse Button** - Rotate camera around the solar system
- **Right Mouse Button** - Pan the camera
- **Mouse Wheel** - Zoom in/out
- **Click on Planets** - Fly to the selected planet
- **Focus Earth Button** - Quickly focus on Earth
- **Earth Mode** - Switch to detailed Earth view with clouds and atmosphere

### UI Controls

- **Pause/Play** - Toggle animation
- **Time Scale** - Adjust the speed of planetary motion
- **Bloom** - Control the intensity of bloom effects
- **Audio Sync** - Enable audio synchronization (requires audio file)

## Development

### Adding New Planets

1. Add planet data to `src/utils/planetFactory.ts`:
```typescript
{
  name: 'New Planet',
  radius: 5,
  distance: 100,
  orbitSpeed: 2.0,
  rotationSpeed: 0.02,
  texture: '/path/to/texture.jpg',
  // ... other properties
}
```

2. The planet will automatically be created and added to the scene.

### Customizing Visual Effects

- Modify bloom settings in `src/hooks/useThreeScene.ts`
- Adjust lighting in `src/components/SolarSystem.tsx`
- Customize post-processing effects in the scene setup

### Adding New Features

The modular React architecture makes it easy to add new features:

1. Create new components in `src/components/`
2. Add state management in `src/contexts/`
3. Create custom hooks in `src/hooks/`
4. Update types in `src/types/`

## Performance Optimization

- The scene uses instanced rendering for efficient planet rendering
- LOD (Level of Detail) can be implemented for distant objects
- Texture compression and optimization for faster loading
- WebGL context management for memory efficiency

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

WebGL 2.0 support is required for optimal performance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Three.js community for the excellent 3D library
- NASA for planetary texture data
- React team for the amazing framework
- Vite team for the fast build tool