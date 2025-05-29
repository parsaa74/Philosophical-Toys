"use client";
import { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree, invalidate } from '@react-three/fiber';
import {
  PerspectiveCamera,
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import FilmEffectOverlay from './FilmEffectOverlay';
import Canvas3D from './Canvas3D';

interface ToyProps {
  position: [number, number, number];
  scale?: number;
}

// Reusable geometries and materials for better performance
const geometryCache = new Map<string, THREE.BufferGeometry>();
const materialCache = new Map<string, THREE.Material>();

// Get cached geometry or create a new one
function getCachedGeometry(type: string, args: unknown[]): THREE.BufferGeometry {
  const key = `${type}-${JSON.stringify(args)}`;
  if (!geometryCache.has(key)) {
    const GeometryConstructor = THREE[type as keyof typeof THREE] as new (...args: unknown[]) => THREE.BufferGeometry;
    geometryCache.set(key, new GeometryConstructor(...args));
  }
  return geometryCache.get(key)!;
}

// Get cached material or create a new one
function getCachedMaterial(type: string, props: unknown): THREE.Material {
  const key = `${type}-${JSON.stringify(props)}`;
  if (!materialCache.has(key)) {
    const MaterialConstructor = THREE[type as keyof typeof THREE] as new (props: unknown) => THREE.Material;
    materialCache.set(key, new MaterialConstructor(props));
  }
  return materialCache.get(key)!;
}

// Controls component with invalidation for on-demand rendering
function Controls() {
  const controlsRef = useRef(null);
  const { invalidate } = useThree();

  // Invalidate on control changes to trigger a render
  const handleChange = useCallback(() => {
    invalidate();
  }, [invalidate]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      autoRotate
      autoRotateSpeed={0.3}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 1.5}
      minDistance={3}
      maxDistance={10}
      onChange={handleChange}
    />
  );
}

// Sample model component with optimizations
function Toy({ position, scale = 1 }: ToyProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // Create a reusable vector for rotation calculations
  const rotationVector = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  // Memoize geometry and material to prevent recreation
  const geometry = useMemo(() => {
    return getCachedGeometry('DodecahedronGeometry', [1, 0]);
  }, []);

  const baseMaterial = useMemo(() => {
    return getCachedMaterial('MeshStandardMaterial', {
      color: '#6A5A55',
      roughness: 0.5,
      metalness: 0.8
    });
  }, []);

  const hoverMaterial = useMemo(() => {
    return getCachedMaterial('MeshStandardMaterial', {
      color: 'hotpink',
      roughness: 0.5,
      metalness: 0.8
    });
  }, []);

  // Optimized animation using useFrame
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotateOnAxis(rotationVector, delta * 0.2);
    }
  });

  // Event handlers
  const handleClick = useCallback(() => {
    setActive(prev => !prev);
    invalidate(); // Request a render on state change
  }, []);

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    invalidate(); // Request a render on state change
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    invalidate(); // Request a render on state change
  }, []);

  const currentScale = active ? 1.2 * scale : scale;

  return (
    <mesh
      position={position}
      ref={meshRef}
      scale={currentScale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      geometry={geometry}
      material={hovered ? hoverMaterial : baseMaterial}
    />
  );
}

export default function Scene() {
  // Memoize Canvas props for better performance
  const canvasProps = useMemo(() => ({
    shadows: true,
    dpr: [1, 2] as [number, number],
    gl: {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance' as WebGLPowerPreference,
      stencil: false,
      depth: true
    },
    className: "bg-transparent",
    // Use on-demand rendering for better performance
    frameloop: "demand" as "demand" | "always" | "never",
  }), []);

  return (
    <div className="w-full aspect-square max-w-md mx-auto" style={{ position: 'relative', minHeight: '300px' }}>
      <Canvas3D {...canvasProps}>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <Controls />

        {/* Lighting - optimized */}
        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={[512, 512]} // Reduced for performance
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Environment and interactive effects - optimized */}
        <Environment preset="city" />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4.5}
          resolution={256} // Reduced for performance
        />
        <Sparkles
          count={window.innerWidth < 768 ? 30 : 50} // Reduce particles on mobile
          scale={[5, 5, 5]}
          color="white"
          speed={1.5}
          size={2}
        />
        <Float speed={1} floatIntensity={0.5} rotationIntensity={0.2}>
          <Toy position={[0, 0, 0]} scale={1.2} />
        </Float>
      </Canvas3D>
      <FilmEffectOverlay />
    </div>
  );
}