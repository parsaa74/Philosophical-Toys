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
  const containerRef = useRef<HTMLDivElement>(null);

  // Map sizes to responsive multipliers instead of fixed dimensions
  const sizeMultipliers = {
    small: 0.7,
    medium: 1.0,
    large: 1.4
  };

  const baseWidth = 500;
  const baseHeight = 375;
  const multiplier = sizeMultipliers[size];

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 800;
      const containerHeight = rect.height || 600;
      
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
        width: Math.max(400, finalWidth), 
        height: Math.max(300, finalHeight) 
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

  const sketch = useCallback((p5: p5Types) => {
    let drumRotation = 0;
    let spinSpeed = 0;
    const maxSpinSpeed = 0.12;
    const frameCount = 12;
    const animationFrames: p5Types.Graphics[] = [];
    let woodTexture: p5Types.Graphics;

    p5.setup = () => {
      const canvas = p5.createCanvas(dimensions.width, dimensions.height, p5.WEBGL);
      canvas.parent('zoetrope-container');
      
      createWoodTexture();
      createAnimationFrames();
    };

    function createWoodTexture() {
      woodTexture = p5.createGraphics(200, 200);
      woodTexture.background(139, 118, 74); // Wood brown
      
      // Add wood grain lines
      woodTexture.stroke(120, 100, 60);
      woodTexture.strokeWeight(1);
      for (let i = 0; i < 50; i++) {
        const y = p5.random(200);
        const opacity = p5.random(30, 100);
        woodTexture.stroke(120, 100, 60, opacity);
        woodTexture.line(0, y, 200, y + p5.random(-10, 10));
      }
      
      // Add darker grain details
      woodTexture.stroke(100, 80, 40);
      for (let i = 0; i < 20; i++) {
        const y = p5.random(200);
        woodTexture.line(0, y, 200, y + p5.random(-5, 5));
      }
    }

    function createAnimationFrames() {
      // Create a galloping horse animation similar to Muybridge
      
      for (let i = 0; i < frameCount; i++) {
        const frame = p5.createGraphics(100, 80);
        frame.background(245, 240, 230); // Off-white paper color
        
        const progress = i / frameCount;
        
        // Horse body (simple oval)
        frame.fill(80, 60, 40);
        frame.noStroke();
        const bodyX = 50;
        const bodyY = 40;
        const bodyBounce = Math.sin(progress * p5.TWO_PI * 2) * 3;
        frame.ellipse(bodyX, bodyY + bodyBounce, 40, 20);
        
        // Horse head
        frame.ellipse(bodyX + 15, bodyY - 5 + bodyBounce, 15, 12);
        
        // Legs with galloping motion
        frame.stroke(80, 60, 40);
        frame.strokeWeight(3);
        
        // Front legs
        const frontLegAngle1 = progress * p5.TWO_PI * 2;
        const frontLegAngle2 = frontLegAngle1 + p5.PI;
        
        const frontLeg1X = bodyX + 8 + Math.sin(frontLegAngle1) * 3;
        const frontLeg1Y = bodyY + 10 + Math.abs(Math.sin(frontLegAngle1)) * 8;
        
        const frontLeg2X = bodyX + 12 + Math.sin(frontLegAngle2) * 3;
        const frontLeg2Y = bodyY + 10 + Math.abs(Math.sin(frontLegAngle2)) * 8;
        
        frame.line(bodyX + 8, bodyY + 8 + bodyBounce, frontLeg1X, frontLeg1Y + bodyBounce);
        frame.line(bodyX + 12, bodyY + 8 + bodyBounce, frontLeg2X, frontLeg2Y + bodyBounce);
        
        // Back legs
        const backLegAngle1 = frontLegAngle1 + p5.PI / 3;
        const backLegAngle2 = backLegAngle1 + p5.PI;
        
        const backLeg1X = bodyX - 8 + Math.sin(backLegAngle1) * 3;
        const backLeg1Y = bodyY + 10 + Math.abs(Math.sin(backLegAngle1)) * 8;
        
        const backLeg2X = bodyX - 4 + Math.sin(backLegAngle2) * 3;
        const backLeg2Y = bodyY + 10 + Math.abs(Math.sin(backLegAngle2)) * 8;
        
        frame.line(bodyX - 8, bodyY + 8 + bodyBounce, backLeg1X, backLeg1Y + bodyBounce);
        frame.line(bodyX - 4, bodyY + 8 + bodyBounce, backLeg2X, backLeg2Y + bodyBounce);
        
        // Tail
        const tailAngle = progress * p5.PI + p5.PI / 4;
        const tailX = bodyX - 20 + Math.cos(tailAngle) * 8;
        const tailY = bodyY + Math.sin(tailAngle) * 5 + bodyBounce;
        frame.line(bodyX - 20, bodyY + bodyBounce, tailX, tailY);
        
        // Mane
        frame.strokeWeight(2);
        for (let j = 0; j < 3; j++) {
          const maneX = bodyX + 15 + j * 2 + Math.sin(progress * p5.TWO_PI + j) * 2;
          const maneY = bodyY - 12 + j * 2 + bodyBounce;
          frame.line(bodyX + 15 + j * 2, bodyY - 8 + bodyBounce, maneX, maneY);
        }
        
        animationFrames[i] = frame;
      }
    }

    p5.draw = () => {
      p5.background(40, 35, 30);
      
      // Update rotation
      if (isSpinning) {
        spinSpeed = p5.lerp(spinSpeed, maxSpinSpeed, 0.1);
      } else {
        spinSpeed = p5.lerp(spinSpeed, 0, 0.05);
      }
      drumRotation += spinSpeed;
      
      // Set up lighting
      p5.ambientLight(80, 70, 60);
      p5.directionalLight(255, 255, 240, -1, 0.5, -1);
      
      // Position camera to view the zoetrope from a slight angle
      const cameraX = Math.sin(p5.frameCount * 0.005) * 50;
      const cameraY = -50;
      const cameraZ = 200;
      p5.camera(cameraX, cameraY, cameraZ, 0, 0, 0, 0, 1, 0);
      
      drawZoetrope();
      
      // Reset to 2D for UI
      p5.camera();
      p5.ortho();
      
      // Draw instructions in 2D
      if (showInstructions) {
        p5.fill(255, 255, 255, 200);
        p5.noStroke();
        p5.textAlign(p5.CENTER);
        p5.textSize(16);
        p5.text("Click to spin the zoetrope", 0, dimensions.height/2 - 30);
        p5.textSize(12);
        p5.text("Look through the slits to see the animation", 0, dimensions.height/2 - 10);
      }
    };

    function drawZoetrope() {
      p5.push();
      p5.rotateY(drumRotation);
      
      // Base platform
      p5.push();
      p5.translate(0, 60, 0);
      p5.fill(100, 80, 50);
      p5.noStroke();
      p5.cylinder(dimensions.height * 0.25, 10);
      p5.pop();
      
      // Main drum (cylindrical)
      const drumRadius = dimensions.height * 0.2;
      const drumHeight = 80;
      
      p5.push();
      p5.texture(woodTexture);
      p5.noStroke();
      p5.cylinder(drumRadius, drumHeight);
      p5.pop();
      
      // Viewing slits
      for (let i = 0; i < frameCount; i++) {
        const angle = (i / frameCount) * p5.TWO_PI;
        p5.push();
        p5.rotateY(angle);
        p5.translate(0, -20, drumRadius);
        p5.fill(20);
        p5.noStroke();
        p5.plane(3, 40); // Narrow slit
        p5.pop();
      }
      
      // Animation strips inside the drum
      for (let i = 0; i < frameCount; i++) {
        const angle = (i / frameCount) * p5.TWO_PI;
        p5.push();
        p5.rotateY(angle);
        p5.translate(0, 10, drumRadius * 0.8);
        p5.rotateY(p5.PI); // Face inward
        
        if (animationFrames[i]) {
          p5.texture(animationFrames[i]);
          p5.noStroke();
          p5.plane(30, 25);
        }
        p5.pop();
      }
      
      // Top rim
      p5.push();
      p5.translate(0, -drumHeight/2 - 3, 0);
      p5.fill(80, 60, 40);
      p5.noStroke();
      p5.cylinder(drumRadius + 5, 6);
      p5.pop();
      
      // Bottom rim
      p5.push();
      p5.translate(0, drumHeight/2 + 3, 0);
      p5.fill(80, 60, 40);
      p5.noStroke();
      p5.cylinder(drumRadius + 5, 6);
      p5.pop();
      
      p5.pop();
    }

    p5.mousePressed = () => {
      setIsSpinning(!isSpinning);
      setShowInstructions(false);
      return false;
    };

    p5.touchStarted = () => {
      setIsSpinning(!isSpinning);
      setShowInstructions(false);
      return false;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(dimensions.width, dimensions.height);
      createWoodTexture(); // Recreate textures with new dimensions
      createAnimationFrames(); // Recreate frames with new dimensions
    };
  }, [dimensions, isSpinning, showInstructions]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        position: 'relative', 
        background: '#2d2a25', 
        borderRadius: '10px', 
        padding: '20px',
        width: '100%',
        height: '100%',
        minWidth: dimensions.width,
        minHeight: dimensions.height
      }}
    >
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          Close
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
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'serif',
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
      }}>
        <p><em>William George Horner&apos;s Zoetrope (1834)</em></p>
        <p>The &quot;Wheel of Life&quot; - multiple viewers can watch the animation simultaneously</p>
      </div>
    </div>
  );
}

export default ZoetropeSketch; 