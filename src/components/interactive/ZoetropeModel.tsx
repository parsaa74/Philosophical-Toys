import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { HorseFigure } from './HorseFigure';

// Constants for the zoetrope
const FRAME_COUNT = 12;

interface ZoetropeModelProps {
  isSpinning: boolean;
  speed: number;
  onToggleSpin: () => void;
}

/**
 * ZoetropeModel Component
 * 
 * This component renders the 3D zoetrope model with all its parts:
 * - Base
 * - Main disc
 * - Slits around the edge
 * - Horse figures in different animation poses
 */
export function ZoetropeModel({ isSpinning, speed, onToggleSpin }: ZoetropeModelProps) {
  // Refs for animated parts
  const discRef = useRef<THREE.Mesh>(null);
  const innerDiscRef = useRef<THREE.Mesh>(null);
  const slitsRef = useRef<THREE.Group>(null);
  const figuresRef = useRef<THREE.Group>(null);
  
  // Load wood texture
  const woodTexture = useTexture('/textures/wood.jpg');
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 4);
  
  // Animation for spinning parts
  useFrame(() => {
    if (isSpinning && discRef.current && innerDiscRef.current && slitsRef.current && figuresRef.current) {
      // Rotate all parts together
      discRef.current.rotation.y += speed;
      innerDiscRef.current.rotation.y += speed;
      slitsRef.current.rotation.y += speed;
      figuresRef.current.rotation.y += speed;
    }
  });
  
  return (
    <group>
      {/* Base */}
      <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1, 1.5, 0.8, 32]} />
        <meshStandardMaterial color="#5D4037" map={woodTexture} />
      </mesh>
      
      {/* Main disc */}
      <mesh ref={discRef} position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3, 3, 0.2, 32]} />
        <meshStandardMaterial map={woodTexture} color="#8B4513" />
      </mesh>
      
      {/* Inner disc with figures */}
      <mesh ref={innerDiscRef} position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
        <meshStandardMaterial color="#5C3317" map={woodTexture} />
      </mesh>
      
      {/* Slits around the edge */}
      <group ref={slitsRef}>
        {Array.from({ length: FRAME_COUNT }).map((_, i) => {
          const angle = (i / FRAME_COUNT) * Math.PI * 2;
          const x = Math.sin(angle) * 2.9;
          const z = Math.cos(angle) * 2.9;
          
          return (
            <mesh key={`slit-${i}`} position={[x, 0.1, z]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="black" transparent opacity={0.7} />
            </mesh>
          );
        })}
      </group>
      
      {/* Horse figures around the disc */}
      <group ref={figuresRef}>
        {Array.from({ length: FRAME_COUNT }).map((_, i) => {
          const angle = (i / FRAME_COUNT) * Math.PI * 2;
          const x = Math.sin(angle) * 2;
          const z = Math.cos(angle) * 2;
          
          // Calculate animation phase based on position
          const phase = i / FRAME_COUNT;
          
          return (
            <HorseFigure 
              key={`horse-${i}`}
              position={[x, 0.3, z]}
              rotation={[0, -angle, 0]}
              phase={phase}
            />
          );
        })}
      </group>
    </group>
  );
}

export default ZoetropeModel;
