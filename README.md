# Philosophical Toys

A modern web-based reimagining of historical philosophical toys using Next.js, P5.js, Three.js, and interactive web technologies. This project brings classic optical illusion devices into the digital age with smooth animations and educational content.

## Overview

This interactive application recreates historical pre-cinema optical devices that fascinated audiences in the 18th and 19th centuries. Each toy is meticulously crafted to demonstrate the scientific principles behind early animation and the persistence of vision.

## Features

- **Interactive Toy Collection**
  - Zoetrope: Animated sequences with a spinning drum and slots
  - Thaumatrope: 3D version of the classic two-sided optical illusion
  - Phenakistoscope: Interactive spinning disk animations with historical accuracy
  - Praxinoscope: Mirror-based animation viewer with smooth transitions

- **Visual Effects**
  - Particle-based transitions between toys
  - Film grain and sepia effects for historical authenticity
  - Dynamic lighting and reflections
  - Sound effects and musical feedback
  - Responsive sizing options

- **Historical Context**
  - Information about each toy's inventor and year
  - Educational descriptions
  - Historical references and timeline

## Technologies Used

- Next.js 14 with App Router
- P5.js for 2D animations and visual effects
- Three.js for 3D graphics and WebGL
- Tone.js for immersive sound effects
- Sanity CMS for content management
- TypeScript for type safety and better development experience
- Tailwind CSS for responsive styling
- Framer Motion for smooth animations
- Zustand for state management

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parsaa74/Philosophical-Toys.git
   cd philosophical-toys
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (if using Sanity CMS):
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Sanity project details
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
  ├── app/                 # Next.js app router pages
  ├── components/
  │   ├── canvas/         # Three.js 3D components
  │   ├── p5/            # P5.js 2D sketches and effects
  │   ├── interactive/   # Interactive toy components
  │   └── layout/        # Layout and navigation components
  ├── lib/
  │   ├── store/         # Zustand state management
  │   └── utils/         # Utility functions and helpers
  ├── types/             # TypeScript type definitions
  └── data/              # Static data and configurations

public/
  ├── fonts/            # Custom typography
  ├── images/           # Static images and textures
  ├── sounds/           # Audio files and sound effects
  └── textures/         # 3D model textures
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run test suite

## Contributing

We welcome contributions to this project! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Historical Background

The philosophical toys recreated in this project represent crucial steps in the development of moving images:

- **Camera Obscura** (11th century): The foundation of all photography and cinema
- **Magic Lantern** (1659): Early image projection technology
- **Thaumatrope** (1825): First toy to demonstrate persistence of vision
- **Phenakistoscope** (1832): Created by Joseph Plateau to study motion
- **Zoetrope** (1834): William George Horner's "wheel of life"
- **Praxinoscope** (1877): Charles-Émile Reynaud's mirror-based improvement

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- **William George Horner** - Inventor of the Zoetrope
- **John Ayrton Paris** - Creator of the Thaumatrope
- **Joseph Plateau** - Pioneer of the Phenakistoscope
- **Charles-Émile Reynaud** - Developer of the Praxinoscope

Special thanks to all the pioneers of early animation and optical illusions who inspired this project, and to the open-source community for the amazing tools that made this possible.
