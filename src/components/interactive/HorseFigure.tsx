import React from 'react';
import * as THREE from 'three';

interface HorseFigureProps {
  position: [number, number, number];
  rotation: [number, number, number];
  phase: number;
}

/**
 * HorseFigure Component
 * 
 * This component renders a simplified 3D horse figure in different poses
 * based on the animation phase (0-1).
 */
export function HorseFigure({ position, rotation, phase }: HorseFigureProps) {
  // Calculate leg raise amount based on animation phase
  // Create a galloping motion
  const legRaiseAmount = Math.sin(phase * Math.PI * 2) * 0.5;
  const bodyRaise = Math.abs(Math.sin(phase * Math.PI * 2)) * 0.1;
  
  return (
    <group position={position} rotation={rotation}>
      {/* Horse body */}
      <mesh position={[0, bodyRaise, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
        <meshStandardMaterial color="#E0C9A6" />
      </mesh>
      
      {/* Horse head */}
      <mesh position={[0.4, 0.2 + bodyRaise, 0]}>
        <capsuleGeometry args={[0.1, 0.3, 8, 16]} />
        <meshStandardMaterial color="#E0C9A6" />
      </mesh>
      
      {/* Horse legs - front left */}
      <mesh position={[0.2, -0.3 + bodyRaise, 0.1]} rotation={[0, 0, legRaiseAmount]}>
        <capsuleGeometry args={[0.05, 0.4, 8, 16]} />
        <meshStandardMaterial color="#E0C9A6" />
      </mesh>
      
      {/* Horse legs - front right */}
      <mesh position={[0.2, -0.3 + bodyRaise, -0.1]} rotation={[0, 0, -legRaiseAmount]}>
        <capsuleGeometry args={[0.05, 0.4, 8, 16]} />
        <meshStandardMaterial color="#E0C9A6" />
      </mesh>
      
      {/* Horse legs - back left */}
      <mesh position={[-0.2, -0.3 + bodyRaise, 0.1]} rotation={[0, 0, -legRaiseAmount]}>
        <capsuleGeometry args={[0.05, 0.4, 8, 16]} />
        <meshStandardMaterial color="#E0C9A6" />
      </mesh>
      
      {/* Horse legs - back right */}
      <mesh position={[-0.2, -0.3 + bodyRaise, -0.1]} rotation={[0, 0, legRaiseAmount]}>
        <capsuleGeometry args={[0.05, 0.4, 8, 16]} />
        <meshStandardMaterial color="#E0C9A6" />
      </mesh>
      
      {/* Horse tail */}
      <mesh position={[-0.4, 0.1 + bodyRaise, 0]} rotation={[0, 0, Math.PI / 4 + legRaiseAmount * 0.5]}>
        <capsuleGeometry args={[0.05, 0.3, 8, 16]} />
        <meshStandardMaterial color="#E0C9A6" />
      </mesh>
    </group>
  );
}

export default HorseFigure;
