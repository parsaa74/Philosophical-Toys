import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { getAssetPath } from '../../lib/utils/helpers';

interface ThaumatropeProps {
  rotation?: [number, number, number];
}

function Thaumatrope({ rotation = [0, 0, 0] }: ThaumatropeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureLoader = new THREE.TextureLoader();

  // Load both sides of the thaumatrope
  const textureFront = textureLoader.load(getAssetPath('/images/thaumatrope/bird.png'));
  const textureBack = textureLoader.load(getAssetPath('/images/thaumatrope/cage.png'));

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
    }
  });

  return (
    <mesh ref={meshRef} rotation={rotation as unknown as THREE.Euler}>
      {/* Front side */}
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial map={textureFront} side={THREE.FrontSide} />
      
      {/* Back side */}
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial map={textureBack} side={THREE.BackSide} />
    </mesh>
  );
}

export function ThreeToy() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: '#000' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Thaumatrope />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default ThreeToy; 