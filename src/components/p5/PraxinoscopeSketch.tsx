import React, { useCallback, useState, useEffect, useRef } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { generatePraxinoscopeFrames } from '../../lib/utils/generatePraxinoscopeFrames';
import soundEffects from '../../lib/utils/soundEffects';

interface PraxinoscopeSketchProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

interface Mirror {
  angle: number;
  reflection: number;
}

export function PraxinoscopeSketch({
  size = 'medium',
  className = ''
}: PraxinoscopeSketchProps) {
  const [error, setError] = useState<Error | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Map sizes to responsive multipliers instead of fixed dimensions
  const sizeMultipliers = {
    small: 0.7,
    medium: 1.0,
    large: 1.4
  };

  const baseWidth = 700;
  const baseHeight = 525;
  const multiplier = sizeMultipliers[size];

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 1000;
      const containerHeight = rect.height || 700;
      
      // Calculate responsive size while maintaining aspect ratio
      const targetWidth = Math.min(baseWidth * multiplier, containerWidth * 0.9);
      const targetHeight = Math.min(baseHeight * multiplier, containerHeight * 0.8);
      
      // Maintain aspect ratio based on original proportions (4:3 ratio)
      const aspectRatio = baseWidth / baseHeight;
      let finalWidth = targetWidth;
      let finalHeight = targetHeight;
      
      if (finalWidth / finalHeight > aspectRatio) {
        finalWidth = finalHeight * aspectRatio;
      } else {
        finalHeight = finalWidth / aspectRatio;
      }
      
      setDimensions({ 
        width: Math.max(600, finalWidth), 
        height: Math.max(450, finalHeight) 
      });
    };

    updateDimensions();

    // Set up ResizeObserver for responsive behavior
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [multiplier]);

  // Initialize sound effects
  useEffect(() => {
    let isMounted = true;
    const initSounds = async () => {
      await soundEffects.initialize();
      if (isMounted) {
        soundEffects.playSound('crackle', true, -28); // Ambient crackle
      }
    };
    initSounds();

    return () => {
      isMounted = false;
      soundEffects.stopSound('crackle', 0.5);
      soundEffects.stopSound('film', 0.1); // Quick stop on unmount
      // soundEffects.dispose(); // Dispose is broad, consider if needed here or at app level
    };
  }, []);

  const sketch = useCallback((p5: p5Types) => {
    let drumImages: p5Types.Image[] = [];
    let woodTexture: p5Types.Image;
    const mirrorCount = 12;
    let drumRotation = 0;
    let mirrorRotation = 0;
    let frameIndex = 0;
    let isSpinning = false;
    let spinSpeed = 0;
    const maxSpinSpeed = 0.15; // Slightly reduced for finer control with mouse
    const minSpinSpeed = 0.001; // Minimum speed to show subtle motion
    // let lastSpinState = false; // Will be replaced by direct check of isSoundPlaying
    
    const mirrors: Mirror[] = [];

    p5.preload = async () => {
      try {
        drumImages = await generatePraxinoscopeFrames(p5);
        woodTexture = p5.loadImage('/textures/wood.jpg',
          () => console.log("Wood texture loaded for Praxinoscope"),
          () => {
            console.error('Failed to load wood texture for Praxinoscope');
            setError(new Error('Failed to load wood texture'));
          }
        );
      } catch (err) {
        console.error('Frame generation or texture loading error:', err);
        setError(new Error('Failed to generate animation frames or load textures'));
      }
    };

    p5.setup = () => {
      const canvas = p5.createCanvas(dimensions.width, dimensions.height, p5.WEBGL);
      canvas.parent('praxinoscope-container');
      p5.angleMode(p5.RADIANS);
      p5.textureMode(p5.NORMAL); // Ensure texture coordinates are 0-1
      
      for (let i = 0; i < mirrorCount; i++) {
        mirrors.push({
          angle: (i / mirrorCount) * p5.TWO_PI,
          reflection: i
        });
      }
    };

    const drawDrum = () => {
      p5.push();
      p5.translate(0, 0, 0);
      p5.rotateY(drumRotation);
      
      // Main drum cylinder (wood)
      p5.push();
      p5.texture(woodTexture);
      p5.noStroke();
      const drumRadius = dimensions.height * 0.3;
      const drumHeight = dimensions.height * 0.2;
      p5.cylinder(drumRadius, drumHeight);
      p5.pop();

      // Top and bottom rings (darker, slightly metallic)
      const ringHeight = 5;
      const ringOffset = drumHeight / 2 - ringHeight / 2;
      p5.push();
      p5.fill(50, 50, 60); // Dark metallic color
      p5.noStroke();
      // Top ring
      p5.translate(0, -ringOffset, 0);
      p5.cylinder(drumRadius + 2, ringHeight); // Slightly larger radius
      p5.pop();

      p5.push();
      p5.fill(50, 50, 60);
      p5.noStroke();
      // Bottom ring
      p5.translate(0, ringOffset, 0);
      p5.cylinder(drumRadius + 2, ringHeight);
      p5.pop();
      
      // Draw the animation frames around the drum
      if (drumImages.length > 0) {
        for (let i = 0; i < drumImages.length; i++) {
          const angle = (i / drumImages.length) * p5.TWO_PI;
          p5.push();
          p5.rotateY(angle);
          // Position frames on the outer surface of the drum
          p5.translate(0, 0, drumRadius * 0.95); // Slightly inside the visual drum radius
          p5.rotateY(p5.PI); // Orient texture to face outwards from center
          p5.texture(drumImages[i]);
          p5.noStroke();
          p5.plane(dimensions.width * 0.1, dimensions.height * 0.15); // Adjust size as needed
          p5.pop();
        }
      }
      p5.pop();
    };

    const drawMirrors = () => {
      p5.push();
      p5.translate(0, 0, 0);
      p5.rotateY(mirrorRotation);
      
      const mirrorWidth = dimensions.width * 0.035;
      const mirrorHeight = dimensions.height * 0.13;
      const mirrorDepth = 2;
      const mirrorPrismRadius = dimensions.height * 0.15;


      for (const mirror of mirrors) {
        p5.push();
        p5.rotateY(mirror.angle);
        p5.translate(0, 0, mirrorPrismRadius);
        
        // Draw mirror surface
        p5.push();
        p5.specularMaterial(230); // Highly reflective
        p5.shininess(100);
        p5.noStroke();
        // p5.stroke(150); // Optional subtle edge
        p5.box(mirrorWidth, mirrorHeight, mirrorDepth);
        p5.pop();
        
        // Draw reflection
        if (drumImages.length > 0) {
          const frameToShow = (mirror.reflection + frameIndex + drumImages.length) % drumImages.length;
          p5.push();
          p5.translate(0, 0, mirrorDepth); // Position reflection on front surface
          p5.texture(drumImages[frameToShow]);
          p5.noStroke();
          p5.plane(mirrorWidth * 0.9, mirrorHeight * 0.9); // Slightly smaller than mirror
          p5.pop();
        }
        p5.pop();
      }
      p5.pop();
    };
    
    const drawFrameIndex = () => {
      p5.push();
      // Use ortho for 2D overlay
      p5.ortho(-dimensions.width / 2, dimensions.width / 2, -dimensions.height / 2, dimensions.height / 2, 0, 1000);
      p5.translate(-dimensions.width / 2 + 20, -dimensions.height / 2 + 30, 0); // Top-left corner
      p5.fill(255);
      p5.textSize(16);
      p5.textFont('monospace');
      if (drumImages.length > 0) {
        p5.text(`Frame: ${frameIndex}/${drumImages.length -1}`, 0, 0);
        p5.text(`Speed: ${spinSpeed.toFixed(3)}`, 0, 20);
      } else {
        p5.text('Loading frames...', 0, 0);
      }
      p5.pop();
    };

    p5.draw = () => {
      if (!woodTexture || drumImages.length === 0) {
        p5.background(20);
        p5.fill(255);
        p5.textSize(24);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text('Loading Praxinoscope...', 0, 0);
        return;
      }
      p5.background(30, 30, 40); // Slightly lighter, bluish background
      
      if (isSpinning) {
        // Mouse X controls speed
        const mouseSpeedRatio = p5.map(p5.mouseX, 0, dimensions.width, 0, 1, true); // true to constrain
        spinSpeed = p5.lerp(minSpinSpeed, maxSpinSpeed, mouseSpeedRatio);
      } else {
        // Decelerate when not spinning
        spinSpeed = p5.max(spinSpeed * 0.98, 0); // Smoother deceleration
        if (spinSpeed < 0.0001) spinSpeed = 0; // Snap to zero
      }
      
      // Manage operational "film" sound
      if (isSpinning && spinSpeed > minSpinSpeed) {
        if (!soundEffects.isSoundPlaying('film')) {
          soundEffects.playSound('film', true, -15, 0.2);
        }
      } else {
        if (soundEffects.isSoundPlaying('film')) {
          soundEffects.stopSound('film', 0.5);
        }
      }
      
      drumRotation += spinSpeed;
      mirrorRotation = -drumRotation;
      
      if (drumImages.length > 0) {
         frameIndex = (Math.floor((drumRotation / p5.TWO_PI) * drumImages.length * 2) % drumImages.length + drumImages.length) % drumImages.length;
         // The *2 in frameIndex calculation for praxinoscope due to mirror effect making it appear to need more "slots"
      }
      
      p5.ambientLight(100); // Brighter ambient
      p5.directionalLight(255, 250, 230, 0.5, 1, -0.5); // Softer directional light
      p5.pointLight(200, 200, 220, 0, -dimensions.height * 0.6, dimensions.height * 0.5);
      
      drawDrum();
      drawMirrors();
      
      p5.push();
      p5.translate(0, dimensions.height * 0.1 + (dimensions.height * 0.2)/2 + 10, 0); // Position base below drum
      p5.rotateX(p5.HALF_PI);
      p5.texture(woodTexture);
      p5.noStroke();
      p5.cylinder(dimensions.height * 0.35, 20);
      p5.pop();

      drawFrameIndex(); // Draw frame index as 2D overlay
    };

    p5.mousePressed = () => {
      if (p5.mouseX > 0 && p5.mouseX < dimensions.width &&
          p5.mouseY > 0 && p5.mouseY < dimensions.height) {
        isSpinning = !isSpinning;
        soundEffects.playSound('twopop', false, -10); // Click sound
        if (isSpinning) { // If starting to spin, give a slight initial nudge if mouse is far left
            if (p5.mouseX < dimensions.width * 0.1) {
                 spinSpeed = minSpinSpeed * 5; // Small kickstart
            }
        }
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(dimensions.width, dimensions.height);
    };
  }, [dimensions, setError]); // soundEffects is available globally via import

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        width: '100%', 
        height: '100%',
        minWidth: dimensions.width,
        minHeight: dimensions.height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div id="praxinoscope-container" style={{ width: dimensions.width, height: dimensions.height }}>
        <NextReactP5Wrapper sketch={sketch} />
      </div>
    </div>
  );
}

export default PraxinoscopeSketch; 