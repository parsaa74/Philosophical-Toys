import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { ZoetropeModel } from './ZoetropeModel';

/**
 * ZoetropeScene Component
 * 
 * This component sets up the Three.js scene with lighting, camera, and controls,
 * and includes the interactive zoetrope model.
 */
function ZoetropeScene() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [speed, setSpeed] = useState(0.01);
  const controlsRef = useRef<any>(null);
  
  // Handle click on the scene to toggle spinning
  const handleToggleSpin = () => {
    setIsSpinning(!isSpinning);
  };
  
  // Handle speed change
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };
  
  return (
    <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Camera Controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        minDistance={4}
        maxDistance={10}
      />
      
      {/* Zoetrope Model */}
      <ZoetropeModel 
        isSpinning={isSpinning} 
        speed={speed} 
        onToggleSpin={handleToggleSpin} 
      />
      
      {/* Instructions */}
      <Text
        position={[0, 2, 0]}
        color="white"
        fontSize={0.3}
        maxWidth={5}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        Click to {isSpinning ? 'stop' : 'spin'} the zoetrope
      </Text>
      
      {/* Speed Controls */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0, 2.5]}
          color="white"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
        >
          Speed Control
        </Text>
        
        {/* Decrease Speed Button */}
        <mesh 
          position={[-1.5, 0, 2.5]} 
          onClick={() => handleSpeedChange(Math.max(0.001, speed - 0.005))}
        >
          <boxGeometry args={[0.4, 0.4, 0.1]} />
          <meshStandardMaterial color="red" />
        </mesh>
        
        <Text
          position={[-1.5, 0, 2.7]}
          color="white"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
        >
          -
        </Text>
        
        {/* Increase Speed Button */}
        <mesh 
          position={[1.5, 0, 2.5]} 
          onClick={() => handleSpeedChange(Math.min(0.05, speed + 0.005))}
        >
          <boxGeometry args={[0.4, 0.4, 0.1]} />
          <meshStandardMaterial color="green" />
        </mesh>
        
        <Text
          position={[1.5, 0, 2.7]}
          color="white"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
        >
          +
        </Text>
      </group>
      
      {/* Invisible clickable plane for the entire scene */}
      <mesh position={[0, 0, 0]} onClick={handleToggleSpin}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </Canvas>
  );
}

export default ZoetropeScene;
