"use client";
import React, { useCallback, useState, useEffect, useRef } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import soundEffects from '../../lib/utils/soundEffects';
import styles from './ZoopraxiscopeSketch.module.css';

interface ZoopraxiscopeSketchProps {
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
}

export function ZoopraxiscopeSketch({
  size = 'medium',
  onClose
}: ZoopraxiscopeSketchProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(960); // Default RPM from original sketch
  const [inertia, setInertia] = useState(0.15); // Default inertia from original sketch
  const [ambientMode, setAmbientMode] = useState<'sepia' | 'natural' | 'noir'>('sepia');
  const frameCountRef = useRef(12); // Number of frames in sequence
  const captionRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Historical facts about the Zoopraxiscope to display
  const historicalFacts = [
    "Eadweard Muybridge invented the Zoopraxiscope in 1879.",
    "It was the first device to project motion pictures.",
    "The Zoopraxiscope used hand-painted images on glass disks.",
    "Muybridge's animal locomotion studies revolutionized our understanding of movement.",
    "The Zoopraxiscope was a precursor to modern cinema.",
    "Muybridge's famous 'The Horse in Motion' proved all four hooves leave the ground during a gallop.",
    "The device operated at approximately 960 rotations per minute.",
    "Muybridge's work bridged photography, science, and art.",
    "The Zoopraxiscope helped settle a bet made by Leland Stanford about horse movement.",
    "Each disk contained between 12-16 sequential images."
  ];

  // Map sizes to base dimensions - these will be scaled based on container
  const sizeMultipliers = {
    small: 0.7,
    medium: 1.0,
    large: 1.4
  };

  const baseSize = 500; // Base size for calculations
  const multiplier = sizeMultipliers[size];

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 800;
      const containerHeight = rect.height || 700;
      
      // Calculate responsive size while maintaining aspect ratio
      const maxSize = Math.min(containerWidth * 0.9, containerHeight * 0.8);
      const finalSize = Math.min(baseSize * multiplier, maxSize);
      
      setDimensions({ 
        width: Math.max(400, finalSize), 
        height: Math.max(400, finalSize) 
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

  // Cycle through historical facts
  useEffect(() => {
    if (!isPlaying || !captionRef.current) return;
    
    const factInterval = setInterval(() => {
      if (captionRef.current) {
        captionRef.current.classList.remove(styles.fadeIn);
        setTimeout(() => {
          if (captionRef.current) {
            const randomFact = historicalFacts[Math.floor(Math.random() * historicalFacts.length)];
            captionRef.current.textContent = randomFact;
            captionRef.current.classList.add(styles.fadeIn);
          }
        }, 500);
      }
    }, 6000);
    
    return () => clearInterval(factInterval);
  }, [isPlaying]);

  // Initialize sound effects
  useEffect(() => {
    let isMounted = true;
    startTimeRef.current = Date.now();

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
      soundEffects.stopSound('mechanical', 0.1);
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
    if (!isPlaying) {
      startTimeRef.current = Date.now();
      soundEffects.playSound('mechanical', true, -10);
      soundEffects.setPlaybackRate('mechanical', rotationSpeed / 960);
      
      // Show first historical fact with animation
      if (captionRef.current) {
        const randomFact = historicalFacts[Math.floor(Math.random() * historicalFacts.length)];
        captionRef.current.textContent = randomFact;
        captionRef.current.classList.add(styles.fadeIn);
      }
      
      // Play transition effect
      soundEffects.playEffect('transition');
    } else {
      soundEffects.stopSound('mechanical', 0.3);
      
      // Reset caption animation
      if (captionRef.current) {
        captionRef.current.classList.remove(styles.fadeIn);
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setRotationSpeed(speed);
    if (isPlaying) {
      soundEffects.setPlaybackRate('mechanical', speed / 960);
    }
  };

  const handleAmbientModeChange = (mode: 'sepia' | 'natural' | 'noir') => {
    setAmbientMode(mode);
  };

  const getRunningTime = () => {
    if (!isPlaying) return '00:00';
    const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sketch = useCallback((p5: p5Types) => {
    // Constants from original sketch
    const ANIMATION_FRAME_RATE = 60;
    const HISTORICAL_DISK_SCALE = 0.8;

    // State variables
    let frames: p5Types.Image[] = [];
    let diskBuffer: p5Types.Graphics | null = null;
    let diskImage: p5Types.Image | null = null;
    let projectionBuffer: p5Types.Graphics | null = null;
    let diskRotation = 0;
    let vignetteMask: p5Types.Image | null = null;
    let dustParticles: { x: number, y: number, size: number, speed: number, opacity: number }[] = [];

    p5.preload = () => {
      // Load sequence with proper async handling
      frames = new Array(frameCountRef.current);
      let loadedCount = 0;

      for (let i = 0; i < frameCountRef.current; i++) {
        const fileName = `/textures/zoopraxiscope/${i + 1}.svg`;
        p5.loadImage(
          fileName,
          (loadedImg) => {
            console.log(`Successfully loaded frame ${i + 1}`);
            frames[i] = loadedImg;
            loadedCount++;
            if (loadedCount === frameCountRef.current) {
              console.log("All frames loaded successfully");
            }
          },
          () => {
            console.error(`Failed to load frame ${i + 1}`);
            setError(new Error(`Failed to load frame ${i + 1}`));
          }
        );
      }
    };

    p5.setup = () => {
      p5.createCanvas(dimensions.width, dimensions.height);

      // Initialize all buffers
      initializeBuffers();

      // Create disk image
      createDiskImage();

      // Create dust particles
      createDustParticles();

      // Set frame rate
      p5.frameRate(ANIMATION_FRAME_RATE);
    };

    function createDustParticles() {
      dustParticles = [];
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        dustParticles.push({
          x: p5.random(p5.width),
          y: p5.random(p5.height),
          size: p5.random(1, 3),
          speed: p5.random(0.1, 0.5),
          opacity: p5.random(20, 180)
        });
      }
    }

    function initializeBuffers() {
      // Ensure minimum dimensions
      const minDim = Math.max(p5.width, p5.height, 400);

      // Initialize buffers with consistent dimensions
      diskBuffer = p5.createGraphics(minDim, minDim);
      diskBuffer.pixelDensity(1);

      projectionBuffer = p5.createGraphics(minDim, minDim);
      projectionBuffer.pixelDensity(1);

      // Initialize disk image
      diskImage = p5.createImage(minDim, minDim);

      // Create vignette mask
      vignetteMask = p5.createImage(minDim, minDim);
      vignetteMask.loadPixels();
      
      for (let y = 0; y < vignetteMask.height; y++) {
        for (let x = 0; x < vignetteMask.width; x++) {
          const centerX = vignetteMask.width / 2;
          const centerY = vignetteMask.height / 2;
          
          // Calculate distance from center (normalized)
          const distance = p5.dist(x, y, centerX, centerY) / (vignetteMask.width / 2);
          
          // Create a strong vignette effect
          const vignetteIntensity = p5.constrain(p5.map(distance, 0.5, 1.0, 255, 0), 0, 255);
          
          // Set pixel value
          const index = (y * vignetteMask.width + x) * 4;
          vignetteMask.pixels[index] = 0;
          vignetteMask.pixels[index+1] = 0;
          vignetteMask.pixels[index+2] = 0;
          vignetteMask.pixels[index+3] = 255 - vignetteIntensity;
        }
      }
      
      vignetteMask.updatePixels();
    }

    function createDiskImage() {
      // Check if we have all necessary components
      if (!diskBuffer || frames.length === 0) {
        console.warn("Cannot create disk image: missing buffer or frames");
        return;
      }

      // Clear the buffer with transparency
      diskBuffer.clear();
      diskBuffer.background(255, 0); // transparent background

      const centerX = diskBuffer.width / 2;
      const centerY = diskBuffer.height / 2;
      const radius = Math.min(diskBuffer.width, diskBuffer.height) * HISTORICAL_DISK_SCALE * 0.45;

      diskBuffer.push();
      diskBuffer.imageMode(p5.CENTER);

      // Create the base disk with a cream/sepia color for historical accuracy
      diskBuffer.fill(245, 240, 225);
      diskBuffer.noStroke();
      diskBuffer.ellipse(centerX, centerY, radius * 2, radius * 2);

      // Add texture to the disk for an aged look
      diskBuffer.fill(0, 10);
      for (let i = 0; i < 100; i++) {
        const angle = p5.random(p5.TWO_PI);
        const dist = p5.random(radius * 0.1, radius * 0.9);
        const size = p5.random(3, 10);
        diskBuffer.ellipse(
          centerX + Math.cos(angle) * dist,
          centerY + Math.sin(angle) * dist,
          size, size
        );
      }

      // Draw disk outline
      diskBuffer.noFill();
      diskBuffer.stroke(108, 99, 255, 180); // purple accent, slightly transparent
      diskBuffer.strokeWeight(2);
      diskBuffer.ellipse(centerX, centerY, radius * 2.1, radius * 2.1);

      // Add a subtle inner ring for historical authenticity
      diskBuffer.stroke(200, 190, 170, 180);
      diskBuffer.strokeWeight(1);
      diskBuffer.ellipse(centerX, centerY, radius * 1.8, radius * 1.8);

      // Add engraved text along the border
      diskBuffer.push();
      diskBuffer.translate(centerX, centerY);
      diskBuffer.fill(60, 50, 40);
      diskBuffer.noStroke();
      diskBuffer.textSize(radius * 0.06);
      diskBuffer.textAlign(p5.CENTER, p5.CENTER);
      
      // Draw text along the circle
      const text = "EADWEARD MUYBRIDGE • ZOOPRAXISCOPE • 1879 • ANIMAL LOCOMOTION";
      
      for (let i = 0; i < text.length; i++) {
        const angle = p5.map(i, 0, text.length, 0, p5.TWO_PI);
        diskBuffer.push();
        diskBuffer.rotate(angle + p5.HALF_PI);
        diskBuffer.translate(0, -radius * 0.9);
        diskBuffer.rotate(-p5.HALF_PI);
        diskBuffer.text(text[i], 0, 0);
        diskBuffer.pop();
      }
      diskBuffer.pop();

      // Draw a center point
      diskBuffer.fill(108, 99, 255); // purple accent
      diskBuffer.noStroke();
      diskBuffer.ellipse(centerX, centerY, 10, 10);

      // Draw radial lines to make rotation more visible
      diskBuffer.stroke(108, 99, 255, 120); // purple accent, more transparent
      diskBuffer.strokeWeight(1);
      for (let i = 0; i < 12; i++) {
        const angle = (p5.TWO_PI * i) / 12;
        const x2 = centerX + Math.cos(angle) * radius * 1.05;
        const y2 = centerY + Math.sin(angle) * radius * 1.05;
        diskBuffer.line(centerX, centerY, x2, y2);
      }

      diskBuffer.noStroke();

      // Draw frames directly on the disk buffer with enhanced visual treatment
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if (!frame) {
          console.warn(`Missing frame ${i}`);
          continue;
        }

        const angle = (p5.TWO_PI * i) / frames.length;

        // Calculate position for the frame on the disk
        const frameRadius = radius * 0.75;
        const x = centerX + Math.cos(angle) * frameRadius;
        const y = centerY + Math.sin(angle) * frameRadius;

        // Scale frames based on historical measurements
        const frameSize = ((radius * 2 * Math.PI) / frames.length) * 0.7;

        diskBuffer.push();
        diskBuffer.imageMode(p5.CENTER);
        diskBuffer.translate(x, y);
        diskBuffer.rotate(angle + p5.HALF_PI);

        // Add subtle shadow under each frame
        diskBuffer.fill(0, 30);
        diskBuffer.ellipse(2, 2, frameSize, frameSize);
        
        // Draw frame on the disk with an aged effect
        diskBuffer.tint(245, 240, 225);
        diskBuffer.image(frame, 0, 0, frameSize, frameSize);
        
        // Add frame number
        diskBuffer.fill(60, 50, 40);
        diskBuffer.textSize(frameSize * 0.1);
        diskBuffer.textAlign(p5.CENTER, p5.BOTTOM);
        diskBuffer.text(`${i+1}`, 0, frameSize/2 + 15);

        diskBuffer.pop();
      }

      diskBuffer.pop();

      // Copy to disk image with proper alpha handling
      if (diskImage) {
        diskImage.copy(
          diskBuffer,
          0,
          0,
          diskBuffer.width,
          diskBuffer.height,
          0,
          0,
          diskImage.width,
          diskImage.height
        );
      }
    }

    function applyHistoricalProjection() {
      if (!projectionBuffer || !diskImage || !vignetteMask) return;

      // Clear projection buffer
      projectionBuffer.clear();

      // Set background color based on ambient mode
      switch (ambientMode) {
        case 'sepia':
          projectionBuffer.background(10, 5, 0);
          break;
        case 'natural':
          projectionBuffer.background(5, 5, 5);
          break;
        case 'noir':
          projectionBuffer.background(0, 0, 0);
          break;
      }

      const centerX = projectionBuffer.width / 2;
      const centerY = projectionBuffer.height / 2;

      // Draw the rotating disk
      projectionBuffer.push();
      projectionBuffer.imageMode(p5.CENTER);
      projectionBuffer.translate(centerX, centerY);

      // Add projection light simulation
      const lightRadius = projectionBuffer.width * 0.4;
      const lightIntensity = isPlaying ? 120 : 60;
      
      // Draw ambient light glow
      projectionBuffer.fill(255, lightIntensity);
      projectionBuffer.noStroke();
      projectionBuffer.ellipse(0, 0, lightRadius * 1.5, lightRadius * 1.5);
      
      // Add light flicker if playing
      if (isPlaying) {
        const flicker = p5.random(-5, 5);
        projectionBuffer.scale(1 + flicker * 0.001);
      }
      
      // Apply rotation
      projectionBuffer.rotate(diskRotation);
      
      // Apply color tint based on ambient mode
      switch (ambientMode) {
        case 'sepia':
          projectionBuffer.tint(255, 240, 220);
          break;
        case 'natural':
          projectionBuffer.tint(250, 250, 250);
          break;
        case 'noir':
          projectionBuffer.tint(220, 220, 220);
          break;
      }
      
      // Draw the disk image
      projectionBuffer.image(diskImage, 0, 0);
      
      projectionBuffer.pop();

      // Draw dust particles
      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];
        
        // Only show particles when playing
        if (isPlaying) {
          projectionBuffer.fill(255, p.opacity);
          projectionBuffer.noStroke();
          projectionBuffer.ellipse(p.x, p.y, p.size, p.size);
          
          // Move particles
          p.y += p.speed;
          if (p.y > projectionBuffer.height) {
            p.y = 0;
            p.x = p5.random(projectionBuffer.width);
          }
        }
      }
      
      // Add film grain effect
      if (isPlaying) {
        projectionBuffer.loadPixels();
        for (let i = 0; i < projectionBuffer.pixels.length; i += 4) {
          if (p5.random() > 0.99) {
            const grain = p5.random(-20, 20);
            projectionBuffer.pixels[i] = p5.constrain(projectionBuffer.pixels[i] + grain, 0, 255);
            projectionBuffer.pixels[i+1] = p5.constrain(projectionBuffer.pixels[i+1] + grain, 0, 255);
            projectionBuffer.pixels[i+2] = p5.constrain(projectionBuffer.pixels[i+2] + grain, 0, 255);
          }
        }
        projectionBuffer.updatePixels();
      }

      // Apply vignette mask
      projectionBuffer.push();
      projectionBuffer.imageMode(p5.CORNER);
      projectionBuffer.blendMode(p5.MULTIPLY);
      projectionBuffer.image(vignetteMask, 0, 0);
      projectionBuffer.pop();
      
      // Add projector beam effect
      projectionBuffer.push();
      projectionBuffer.blendMode(p5.SCREEN);
      const beamIntensity = isPlaying ? 100 : 30;
      
      projectionBuffer.fill(255, 255, 240, beamIntensity);
      projectionBuffer.noStroke();
      projectionBuffer.beginShape();
      projectionBuffer.vertex(centerX, centerY);
      projectionBuffer.vertex(centerX - 150, projectionBuffer.height);
      projectionBuffer.vertex(centerX + 150, projectionBuffer.height);
      projectionBuffer.endShape(p5.CLOSE);
      
      projectionBuffer.pop();
      
      // Add frame jitter effect when playing
      if (isPlaying) {
        const jitterX = p5.random(-2, 2);
        const jitterY = p5.random(-1, 1);
        
        // Store current pixels
        const tempImg = projectionBuffer.get();
        
        // Clear and redraw with jitter
        projectionBuffer.clear();
        projectionBuffer.image(tempImg, jitterX, jitterY);
      }
    }

    p5.draw = () => {
      if (isPlaying) {
        // Calculate rotation increment based on speed and inertia
        const targetRPM = rotationSpeed;
        const rotationIncrement = (p5.TWO_PI * targetRPM) / (ANIMATION_FRAME_RATE * 60);
        
        // Apply inertia
        diskRotation += rotationIncrement * inertia;
      }

      // Apply historical projection effects
      applyHistoricalProjection();

      // Draw final composition
      p5.background(0);
      p5.imageMode(p5.CENTER);
      
      // Draw the projection
      if (projectionBuffer) {
        p5.image(projectionBuffer, p5.width / 2, p5.height / 2, p5.width, p5.height);
      }
      
      // Draw playback UI elements
      drawPlaybackIndicator();
    };
    
    function drawPlaybackIndicator() {
      if (!isPlaying) return;
      
      // Calculate animation progress visualization
      const rpm = rotationSpeed;
      const revsPerSecond = rpm / 60;
      const frameRate = revsPerSecond * frameCountRef.current;
      const framesPlayed = (diskRotation / p5.TWO_PI) * frameCountRef.current;
      
      // Draw playback indicator
      p5.push();
      p5.fill(255, 150);
      p5.noStroke();
      p5.textSize(12);
      p5.textFont('monospace');
      p5.textAlign(p5.LEFT, p5.BOTTOM);
      p5.text(`${frameRate.toFixed(1)} FPS`, 10, p5.height - 10);
      p5.text(`Frame: ${Math.floor(framesPlayed) % frameCountRef.current + 1}/${frameCountRef.current}`, 10, p5.height - 30);
      p5.text(getRunningTime(), 10, p5.height - 50);
      
      // Small equipment temperature indicator (historical touch)
      const opTemp = p5.map(isPlaying ? Date.now() - startTimeRef.current : 0, 0, 120000, 20, 100);
      p5.text(`Apparatus Temp: ${Math.min(100, Math.floor(opTemp))}°`, p5.width - 180, p5.height - 10);
      p5.pop();
    }

    p5.windowResized = () => {
      p5.resizeCanvas(dimensions.width, dimensions.height);
      initializeBuffers();
      createDiskImage();
      createDustParticles();
    };
  }, [dimensions, isPlaying, rotationSpeed, inertia, ambientMode, getRunningTime]);

  return (
    <div ref={containerRef} className={styles.zoopraxiscopeWrapper}>
      <div className={styles.sketchHeader}>
        <h2>Eadweard Muybridge&apos;s Zoopraxiscope (1879)</h2>
        <p>A pioneer of motion picture projection technology</p>
      </div>
      
      <div className={styles.sketchContainer}>
        <div id="canvas-container" className={styles.canvasContainer}>
          <NextReactP5Wrapper sketch={sketch} />
          {isPlaying && (
            <div ref={captionRef} className={styles.historicalCaption}></div>
          )}
        </div>
        
        <div className={styles.controlsContainer}>
          <div className={styles.controlsHeader}>
            <span className={styles.antiqueBrass}>Apparatus Controls</span>
            <div className={styles.runningTime}>{getRunningTime()}</div>
          </div>
          
          <button 
            onClick={handlePlayPause}
            className={`${styles.mainButton} ${isPlaying ? styles.active : ''}`}
          >
            {isPlaying ? 'Stop Projection' : 'Begin Projection'}
          </button>
          
          <div className={styles.controlGroup}>
            <label htmlFor="speed-slider">Rotation Speed: {rotationSpeed} RPM</label>
            <input
              id="speed-slider"
              type="range"
              min="900"
              max="1000"
              step="10"
              value={rotationSpeed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label htmlFor="inertia-slider">Mechanical Authenticity: {inertia.toFixed(2)}</label>
            <input
              id="inertia-slider"
              type="range"
              min="0.05"
              max="0.3"
              step="0.01"
              value={inertia}
              onChange={(e) => setInertia(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label>Projection Atmosphere:</label>
            <div className={styles.buttonGroup}>
              <button 
                className={`${styles.modeButton} ${ambientMode === 'sepia' ? styles.active : ''}`}
                onClick={() => handleAmbientModeChange('sepia')}
              >
                Sepia
              </button>
              <button 
                className={`${styles.modeButton} ${ambientMode === 'natural' ? styles.active : ''}`}
                onClick={() => handleAmbientModeChange('natural')}
              >
                Natural
              </button>
              <button 
                className={`${styles.modeButton} ${ambientMode === 'noir' ? styles.active : ''}`}
                onClick={() => handleAmbientModeChange('noir')}
              >
                Noir
              </button>
            </div>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className={styles.closeButton}
            >
              Return to Timeline
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.historicalContext}>
        <p>
          The Zoopraxiscope was one of the earliest devices for displaying motion pictures,
          created by photographer Eadweard Muybridge in 1879. The device projected images
          from rotating glass disks, creating the illusion of motion. Muybridge used it in his
          lectures on animal movement, which transformed our understanding of locomotion and
          laid the groundwork for cinema.
        </p>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
}

export default ZoopraxiscopeSketch; 