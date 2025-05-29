import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import styles from './Zoetrope3D.module.css';
import { soundEffects } from '../../lib/utils/soundEffects';

interface Zoetrope3DProps {
  onInteraction?: (type: string) => void;
}

// Preload the model to avoid loading issues
useGLTF.preload('/zoetrope.glb');

/**
 * Zoetrope3D Component
 *
 * This component loads a 3D model of a zoetrope and applies
 * a galloping horse animation strip as a texture.
 */
function ZoetropeModel({ isSpinning, speed, onToggleSpin }: {
  isSpinning: boolean;
  speed: number;
  onToggleSpin: () => void;
}) {
  const gltf = useGLTF('/zoetrope.glb');
  const zoetropeRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh | null>(null);
  const { camera } = useThree();
  const [gallopTexture, setGallopTexture] = useState<THREE.Texture | null>(null);
  const [woodTexture, setWoodTexture] = useState<THREE.Texture | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Load textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    let gallopLoaded = false;
    let woodLoaded = false;

    const checkAllLoaded = () => {
      if (gallopLoaded && woodLoaded) {
        // All textures loaded successfully
      }
    };

    textureLoader.load(
      '/textures/gallop-cycle.png',
      (texture) => {
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        setGallopTexture(texture);
        gallopLoaded = true;
        checkAllLoaded();
      },
      undefined,
      (error) => {
        console.error('Error loading gallop texture:', error);
        setLoadingError('Failed to load gallop texture.');
      }
    );

    textureLoader.load(
      '/textures/wood.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        texture.generateMipmaps = true;
        setWoodTexture(texture);
        woodLoaded = true;
        checkAllLoaded();
      },
      undefined,
      (error) => {
        console.error('Error loading wood texture:', error);
        setLoadingError('Failed to load wood texture.');
      }
    );
  }, []);


  // Process GLTF model once textures are loaded
  useEffect(() => {
    if (gltf.scene && gallopTexture && woodTexture && zoetropeRef.current) {
      const clonedScene = gltf.scene.clone(true);
      
      const gallopMaterial = new THREE.MeshStandardMaterial({
        map: gallopTexture,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const woodMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.8,
        metalness: 0.05,
      });

      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const nameLower = child.name.toLowerCase();
          if (nameLower.includes('disk') || nameLower.includes('disc') || nameLower.includes('cylinder_animation_strip') || nameLower.includes('strip')) {
            diskRef.current = child;
            child.material = gallopMaterial;
          } else if (nameLower.includes('base') || nameLower.includes('stand') || nameLower.includes('drum_outer') || nameLower.includes('zoetrope_body')) {
            child.material = woodMaterial;
          } else {
             if (child.material instanceof THREE.MeshStandardMaterial) {
                if (!child.material.map) {
                    child.material = woodMaterial.clone();
                }
             }
          }
        }
      });

      zoetropeRef.current.clear();
      zoetropeRef.current.add(clonedScene);
      setModelReady(true);
    }

    // Clean up materials on unmount
    return () => {
      gallopTexture?.dispose();
      woodTexture?.dispose();
      // Note: materials assigned to meshes are disposed when the meshes are removed from scene or the GLTF is unmounted
    };
  }, [gltf.scene, gallopTexture, woodTexture]);


  useEffect(() => {
    camera.position.set(0, 1.5, 3); // Initial camera position
  }, [camera]);


  useFrame((state, delta) => {
    if (modelReady && isSpinning && diskRef.current) {
      // Ensure diskRef.current is the correct object that should spin.
      // If the whole zoetropeRef should spin, use that instead.
      // For a classic zoetrope, only the inner drum/disk with images spins.
      diskRef.current.rotation.y += speed * delta * 2;
    }
  });

  if (loadingError) {
    return <Text position={[0, 0, 0]} color="red" fontSize={0.1}>{loadingError}</Text>;
  }

  if (!modelReady) {
    return <Text position={[0, 0, 0]} color="white" fontSize={0.1}>Loading 3D Model...</Text>;
  }

  return (
    <group ref={zoetropeRef} position={[0, -1, 0]} scale={1} onClick={onToggleSpin}>
      {/* The model is added via useEffect */}
      {/* Invisible clickable plane for potentially larger click area if needed, though group click should work */}
      <mesh
        position={[0, 1, 0]} // Adjust Y if model's origin is at its base
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false} // Keep it invisible
      >
        <planeGeometry args={[3, 3]} /> {/* Adjust size as needed */}
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * Main Zoetrope3D component that sets up the scene and controls
 */
export function Zoetrope3D({ onInteraction }: Zoetrope3DProps) {
  const [isSpinning, setIsSpinning] = useState(true); // Start spinning by default
  const [speed, setSpeed] = useState(0.3); // Default speed
  const [showInfo, setShowInfo] = useState(false);

  const handleToggleSpin = useCallback(() => {
    soundEffects.playSound('twopop', false, -8); // Click sound for interaction
    setIsSpinning(prev => {
      const newSpinningState = !prev;
      if (onInteraction) {
        onInteraction(newSpinningState ? 'spin' : 'stop');
      }
      return newSpinningState;
    });
  }, [onInteraction]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (onInteraction) {
      onInteraction('speed-change');
    }
  };

  const handleInfoToggle = () => {
    setShowInfo(!showInfo);
    if (onInteraction) {
      onInteraction('info-toggle');
    }
  };
  
  const instructionText = isSpinning
    ? `Spinning (Speed: ${speed.toFixed(1)}) - Click to Stop`
    : 'Click to Spin';

  // Initialize sound effects and manage ambient sound
  useEffect(() => {
    let isMounted = true;
    const initSound = async () => {
      await soundEffects.initialize(); // Initialize will handle if already initialized
      if (isMounted) {
        soundEffects.playSound('crackle', true, -25); // Ambient crackle
      }
    };
    initSound();

    return () => {
      isMounted = false;
      soundEffects.stopSound('crackle', 0.5);
      soundEffects.stopSound('film', 0.5); // Ensure film sound is stopped on unmount
    };
  }, []);

  // Manage spinning sound based on isSpinning and speed state
  useEffect(() => {
    const manageSpinSound = async () => {
      await soundEffects.initialize(); // Initialize will handle if already initialized

      if (isSpinning) {
        // Map speed (0.1 to 2.0) to volume (-18dB to -8dB)
        const minSpeed = 0.1;
        const maxSpeed = 2.0;
        const minVol = -18;
        const maxVol = -8;
        const volume = minVol + ((speed - minSpeed) / (maxSpeed - minSpeed)) * (maxVol - minVol);
        
        if (soundEffects.isSoundPlaying('film')) {
          soundEffects.setSoundVolume('film', volume, 0.2);
        } else {
          soundEffects.playSound('film', true, volume, 0.2);
        }
      } else {
        if (soundEffects.isSoundPlaying('film')) {
          soundEffects.stopSound('film', 0.5);
        }
      }
    };

    manageSpinSound();
  }, [isSpinning, speed]);


  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <Canvas shadows camera={{ position: [0, 1.5, 3], fov: 50 }}>
          <ambientLight intensity={0.6} /> {/* Slightly brighter ambient */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-5, -5, -5]} intensity={0.3} />
          <hemisphereLight args={['#ffffff', '#444444', 0.5]} />


          <React.Suspense fallback={null}> {/* Suspense for model loading */}
            <ZoetropeModel
              isSpinning={isSpinning}
              speed={speed}
              onToggleSpin={handleToggleSpin}
            />
          </React.Suspense>

          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8} // Allow slightly higher angle
            minDistance={1.5} // Allow closer inspection
            maxDistance={8}
          />

          {/* Instructions */}
          <Text
            position={[0, 1.8, 0]} // Slightly higher
            color="white"
            fontSize={0.12} // Slightly smaller if text is longer
            maxWidth={2.5}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            outlineColor="black"
            outlineWidth={0.005}
          >
            {instructionText}
          </Text>
        </Canvas>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={styles.button}
          onClick={handleToggleSpin}
        >
          {isSpinning ? 'Stop' : 'Spin'}
        </button>

        <div className={styles.sliderContainer}>
          <span className={styles.label}>Speed:</span>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={speed}
            onChange={handleSpeedChange}
            className={styles.slider}
          />
        </div>

        <button
          className={styles.infoButton}
          onClick={handleInfoToggle}
        >
          ?
        </button>
      </div>

      {/* Info Overlay */}
      {showInfo && (
        <div className={styles.infoOverlay}>
          <div className={styles.infoContent}>
            <h2>How the Zoetrope Works</h2>
            <p>
              The zoetrope creates the illusion of motion through a series of sequential images.
              When the drum spins, you view the images through the slits, which act like a shutter
              in a camera. This creates the illusion of smooth motion due to a phenomenon called
              <strong>&ldquo;persistence of vision&rdquo;</strong> - where an image remains on your retina for a fraction of a
              second after viewing it.
            </p>
            <p>
              This principle was crucial to the development of cinema and animation, demonstrating
              how a series of still images could create the illusion of movement.
            </p>
            <button
              className={styles.closeButton}
              onClick={handleInfoToggle}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Preload textures (optional, useGLTF.preload is more common for models)
// new THREE.TextureLoader().load('/textures/gallop-cycle.png');
// new THREE.TextureLoader().load('/textures/wood.jpg');


export default Zoetrope3D;
