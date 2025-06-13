"use client";
import React, { useCallback, useState, useEffect, useRef } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";

interface ZoetropeSketchProps {
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
  className?: string;
}

export function ZoetropeSketch({
  size = 'medium',
  onClose,
  className = ''
}: ZoetropeSketchProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [debugMode, setDebugMode] = useState(false);
  const [terminalBuffer, setTerminalBuffer] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map sizes to responsive multipliers
  const sizeMultipliers = {
    small: 0.7,
    medium: 1.0,
    large: 1.4
  };

  const baseWidth = 500;
  const baseHeight = 375;
  const multiplier = sizeMultipliers[size];

  // Add terminal output helper
  const addTerminalOutput = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => {
      const newOutput = [...prev, `[${timestamp}] ${message}`];
      return newOutput.slice(-8); // Keep only last 8 messages
    });
  }, []);

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 800;
      const containerHeight = rect.height || 600;
      
      const targetWidth = Math.min(baseWidth * multiplier, containerWidth * 0.9);
      const targetHeight = Math.min(baseHeight * multiplier, containerHeight * 0.8);
      
      const aspectRatio = baseWidth / baseHeight;
      let finalWidth = targetWidth;
      let finalHeight = targetHeight;
      
      if (finalWidth / finalHeight > aspectRatio) {
        finalWidth = finalHeight * aspectRatio;
      } else {
        finalHeight = finalWidth / aspectRatio;
      }
      
      setDimensions({ 
        width: Math.max(400, finalWidth), 
        height: Math.max(300, finalHeight) 
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [multiplier]);

  // Initialize terminal
  useEffect(() => {
    addTerminalOutput('UNIX ZOETROPE TERMINAL v2.3.7 INITIALIZED');
    addTerminalOutput('System ready for operation...');
    addTerminalOutput('Type commands or click to interact');
  }, [addTerminalOutput]);

  const sketch = useCallback((p5: p5Types) => {
    // Unix Terminal Zoetrope System Variables
    let SYSTEM = {
      angularPosition: 0,
      angularVelocity: 0,
      targetAngularVelocity: 0,
      cameraDistance: -200,
      targetCameraDistance: -200,
      cameraElevation: 0,
      targetElevation: 0,
      cameraPan: 0,
      targetPan: 0,
      frameCount: 11,
      colorScheme: {
        primary: [0, 255, 65, 255] as [number, number, number, number],
        secondary: [255, 100, 0, 255] as [number, number, number, number],
        background: [0, 0, 0, 255] as [number, number, number, number],
        accent: [255, 255, 255, 255] as [number, number, number, number]
      },
      performance: {
        frameTime: 0,
        lastFrameTime: 0
      }
    };

    let animationTexture: p5Types.Graphics;
    let matrixDrops: Array<{y: number, speed: number, char: string}> = [];
    const MATRIX_COLUMNS = 30;
    const matrixChars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    p5.setup = () => {
      const canvas = p5.createCanvas(dimensions.width, dimensions.height, p5.WEBGL);
      canvas.parent('zoetrope-container');
      
      // Initialize matrix rain
      for (let i = 0; i < MATRIX_COLUMNS; i++) {
        matrixDrops[i] = {
          y: p5.random(-dimensions.height, 0),
          speed: p5.random(2, 6),
          char: p5.random(matrixChars.split(''))
        };
      }

      createAnimationTexture();
      p5.frameRate(60);
    };

    function createAnimationTexture() {
      // Create a horizontal strip of Unix-themed animation frames
      const frameWidth = 80;
      const frameHeight = 60;
      const totalFrames = SYSTEM.frameCount;
      
      animationTexture = p5.createGraphics(frameWidth * totalFrames, frameHeight);
      animationTexture.background(0, 20, 0); // Dark green background
      
      for (let i = 0; i < totalFrames; i++) {
        const x = i * frameWidth;
        const progress = i / totalFrames;
        
        // Draw ASCII-style animation frames
        animationTexture.fill(0, 255, 65); // Matrix green
        animationTexture.textAlign(p5.CENTER, p5.CENTER);
        animationTexture.textSize(8);
        animationTexture.textFont('monospace');
        
        // Create a simple character-based animation
        const chars = ['█', '▓', '▒', '░', '▓', '█', '▒', '░', '▓', '▒', '█'];
        const char = chars[i];
        
        // Draw multiple characters in a pattern
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 8; col++) {
            const charX = x + col * 10 + 5;
            const charY = row * 10 + 5;
            
            // Create wave effect
            const wave = Math.sin(progress * p5.TWO_PI + col * 0.5 + row * 0.3) * 2;
            const alpha = 100 + Math.sin(progress * p5.TWO_PI * 2 + col + row) * 155;
            
            animationTexture.fill(0, 255, 65, alpha);
            animationTexture.text(char, charX, charY + wave);
          }
        }
        
        // Add frame border
        animationTexture.stroke(255, 100, 0, 150);
        animationTexture.strokeWeight(1);
        animationTexture.noFill();
        animationTexture.rect(x + 2, 2, frameWidth - 4, frameHeight - 4);
      }
    }

    p5.draw = () => {
      // Performance monitoring
      SYSTEM.performance.frameTime = p5.millis() - SYSTEM.performance.lastFrameTime;
      SYSTEM.performance.lastFrameTime = p5.millis();

      configureScene();
      renderZoetropeDrum();
      renderViewingSlits();
      
      // Switch to 2D for overlays
      p5.camera();
      p5.ortho();
      p5.resetMatrix();
      
      renderMatrixRain();
      renderTerminalInterface();
      
      if (debugMode) {
        renderDebugOverlay();
      }
      
      if (showInstructions) {
        renderInstructions();
      }
    };

    function configureScene() {
      // Terminal-black background
      p5.background(...SYSTEM.colorScheme.background);
      
      // Unix-style lighting
      p5.ambientLight(30, 100, 30);
      p5.directionalLight(0, 255, 100, -1, 0.5, -1);
      p5.pointLight(255, 150, 0, dimensions.width * 0.3, dimensions.height * 0.3, 100);
      
      // Camera system
      SYSTEM.targetCameraDistance = p5.constrain(SYSTEM.targetCameraDistance, -400, -100);
      SYSTEM.cameraDistance = p5.lerp(SYSTEM.cameraDistance, SYSTEM.targetCameraDistance, 0.08);
      
      // Mouse controls (scaled for component size)
      const mouseXNorm = p5.map(p5.mouseX, -dimensions.width/2, dimensions.width/2, -1, 1);
      const mouseYNorm = p5.map(p5.mouseY, -dimensions.height/2, dimensions.height/2, -1, 1);
      
      SYSTEM.targetElevation = mouseYNorm * p5.PI / 12;
      SYSTEM.cameraElevation = p5.lerp(SYSTEM.cameraElevation, SYSTEM.targetElevation, 0.12);
      
      SYSTEM.targetPan = mouseXNorm * p5.PI / 8;
      SYSTEM.cameraPan = p5.lerp(SYSTEM.cameraPan, SYSTEM.targetPan, 0.08);
      
      p5.translate(0, -20, SYSTEM.cameraDistance);
      p5.rotateX(SYSTEM.cameraElevation);
      p5.rotateY(SYSTEM.angularPosition + SYSTEM.cameraPan);
      
      // Update rotation
      SYSTEM.angularPosition += SYSTEM.angularVelocity;
      SYSTEM.angularVelocity = p5.lerp(SYSTEM.angularVelocity, SYSTEM.targetAngularVelocity, 0.06);
      SYSTEM.angularVelocity = p5.constrain(SYSTEM.angularVelocity, -0.3, 0.3);
    }

    function renderZoetropeDrum() {
      if (!animationTexture) return;
      
      p5.push();
      
      // Main cylinder with animation texture
      p5.texture(animationTexture);
      p5.noStroke();
      p5.translate(0, 20, 0);
      
      const radius = dimensions.width * 0.15;
      const height = dimensions.height * 0.25;
      
      p5.cylinder(radius, height, 24, 1, false, false);
      
      // Outer ring with Unix-green glow
      p5.specularMaterial(...SYSTEM.colorScheme.primary);
      p5.cylinder(radius + 3, height, 24, 1, false, false);
      
      p5.pop();
      
      // Top and bottom rings
      for (let yPos = -height/3; yPos <= height; yPos += height * 0.8) {
        p5.push();
        p5.specularMaterial(...SYSTEM.colorScheme.secondary);
        p5.noStroke();
        p5.translate(0, yPos, 0);
        p5.rotateX(p5.PI / 2);
        p5.torus(radius + 3, 6);
        p5.pop();
      }
    }

    function renderViewingSlits() {
      const radius = dimensions.width * 0.15;
      const height = dimensions.height * 0.25;
      
      p5.push();
      
      for (let i = 0; i < SYSTEM.frameCount; i++) {
        const slitAngle = p5.map(i, 0, SYSTEM.frameCount, 0, p5.TWO_PI);
        
        p5.push();
        p5.rotateY(slitAngle);
        p5.translate(0, 20, radius - 3);
        
        // Alternating slit colors for Unix aesthetic
        if (i % 2 === 0) {
          p5.specularMaterial(...SYSTEM.colorScheme.primary);
        } else {
          p5.specularMaterial(...SYSTEM.colorScheme.secondary);
        }
        
        p5.noStroke();
        p5.box(6, height, 3);
        p5.pop();
      }
      
      p5.pop();
    }

    function renderMatrixRain() {
      p5.fill(0, 255, 65, 80);
      p5.textAlign(p5.LEFT);
      p5.textSize(8);
      p5.textFont('monospace');
      
      const columnWidth = dimensions.width / MATRIX_COLUMNS;
      
      for (let i = 0; i < MATRIX_COLUMNS; i++) {
        const drop = matrixDrops[i];
        const x = (i * columnWidth) - dimensions.width/2;
        const y = drop.y - dimensions.height/2;
        
        p5.text(drop.char, x, y);
        
        drop.y += drop.speed;
        
        if (drop.y > dimensions.height) {
          drop.y = p5.random(-100, 0);
          drop.char = p5.random(matrixChars.split(''));
        }
        
        if (p5.random() > 0.98) {
          drop.char = p5.random(matrixChars.split(''));
        }
      }
    }

    function renderTerminalInterface() {
      p5.fill(0, 255, 65, 200);
      p5.textAlign(p5.LEFT);
      p5.textSize(9);
      p5.textFont('monospace');
      
      // Terminal output
      let yPos = dimensions.height/2 - 20;
      for (let i = terminalOutput.length - 1; i >= 0; i--) {
        if (yPos < -dimensions.height/2 + 100) break;
        p5.text(terminalOutput[i], -dimensions.width/2 + 10, yPos);
        yPos -= 12;
      }
      
      // Command prompt
      p5.fill(255, 255, 255);
      p5.text(`unix@zoetrope:~$ ${terminalBuffer}█`, -dimensions.width/2 + 10, dimensions.height/2 - 5);
    }

    function renderInstructions() {
      p5.fill(255, 255, 255, 180);
      p5.textAlign(p5.CENTER);
      p5.textSize(12);
      p5.textFont('monospace');
      p5.text("█ UNIX ZOETROPE TERMINAL █", 0, -dimensions.height/3);
      p5.textSize(10);
      p5.text("Click to toggle rotation", 0, -dimensions.height/3 + 20);
      p5.text("Mouse: pan/tilt | Space: brake", 0, -dimensions.height/3 + 35);
      p5.text("Enter: debug mode", 0, -dimensions.height/3 + 50);
    }

    function renderDebugOverlay() {
      p5.fill(255, 255, 0, 180);
      p5.textAlign(p5.RIGHT);
      p5.textSize(8);
      p5.textFont('monospace');
      
      const debugInfo = [
        `FPS: ${p5.nf(p5.frameRate(), 0, 1)}`,
        `Angular Vel: ${p5.nf(SYSTEM.angularVelocity, 0, 4)}`,
        `Camera Dist: ${p5.nf(SYSTEM.cameraDistance, 0, 0)}`,
        `Elevation: ${p5.nf(p5.degrees(SYSTEM.cameraElevation), 0, 1)}°`,
        `Spinning: ${isSpinning ? 'ON' : 'OFF'}`
      ];
      
      let yPos = -dimensions.height/2 + 20;
      for (const info of debugInfo) {
        p5.text(info, dimensions.width/2 - 10, yPos);
        yPos += 10;
      }
    }

    p5.mousePressed = () => {
      if (p5.mouseX >= -dimensions.width/2 && p5.mouseX <= dimensions.width/2 &&
          p5.mouseY >= -dimensions.height/2 && p5.mouseY <= dimensions.height/2) {
        
        setIsSpinning(!isSpinning);
        setShowInstructions(false);
        
        if (!isSpinning) {
          SYSTEM.targetAngularVelocity = 0.15;
          addTerminalOutput('Rotation: ACTIVATED');
        } else {
          SYSTEM.targetAngularVelocity = 0;
          addTerminalOutput('Rotation: DEACTIVATED');
        }
      }
      return false;
    };

    p5.keyPressed = () => {
      if (p5.keyCode === 13) { // Enter
        setDebugMode(!debugMode);
        addTerminalOutput(`Debug mode: ${!debugMode ? 'ON' : 'OFF'}`);
      } else if (p5.keyCode === 32) { // Space
        SYSTEM.angularVelocity *= 0.9;
        addTerminalOutput('EMERGENCY BRAKE APPLIED');
      }
      return false;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(dimensions.width, dimensions.height);
      createAnimationTexture();
      
      // Reinitialize matrix drops for new dimensions
      for (let i = 0; i < MATRIX_COLUMNS; i++) {
        matrixDrops[i] = {
          y: p5.random(-dimensions.height, 0),
          speed: p5.random(2, 6),
          char: p5.random(matrixChars.split(''))
        };
      }
    };
  }, [dimensions, isSpinning, showInstructions, debugMode, terminalBuffer, terminalOutput, addTerminalOutput]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        position: 'relative', 
        background: 'linear-gradient(135deg, #000000, #001100)', 
        borderRadius: '10px', 
        padding: '20px',
        width: '100%',
        height: '100%',
        minWidth: dimensions.width,
        minHeight: dimensions.height,
        border: '2px solid #00FF41',
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
      }}
    >
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 100, 0, 0.8)',
            border: '1px solid #FF6400',
            color: '#000000',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 10,
            fontFamily: 'monospace',
            fontWeight: 'bold'
          }}
        >
          [X]
        </button>
      )}
      
      <div id="zoetrope-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: dimensions.height
      }}>
        <NextReactP5Wrapper sketch={sketch} />
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '10px', 
        color: '#00FF41',
        fontFamily: 'monospace',
        fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
        textShadow: '0 0 10px rgba(0, 255, 65, 0.5)'
      }}>
        <p><strong>█ UNIX ZOETROPE TERMINAL v2.3.7-dev █</strong></p>
        <p>Hardcore terminal-inspired wheel of life | Type commands for interaction</p>
        <p style={{ color: '#FF6400', fontSize: '0.7em' }}>
          Built with pure Unix philosophy | Licensed under GNU GPL v3.0
        </p>
      </div>
    </div>
  );
}

export default ZoetropeSketch;