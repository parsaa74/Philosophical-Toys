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
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Size multipliers for responsive design
  const sizeMultipliers = {
    small: 0.7,
    medium: 1.0,
    large: 1.4
  };

  const baseWidth = 800;
  const baseHeight = 600;
  const multiplier = sizeMultipliers[size];

  // Responsive container sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 800;
      const containerHeight = rect.height || 600;
      
      // Fit to container while maintaining aspect ratio
      const targetWidth = Math.min(baseWidth * multiplier, containerWidth - 40);
      const targetHeight = Math.min(baseHeight * multiplier, containerHeight - 40);
      
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
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [multiplier]);

  const sketch = useCallback((p5: p5Types) => {
    // Core variables matching your original code
    let strip: p5Types.Image;
    let angle = 0;
    let avel = 0;
    let tavel = 0;
    let zoom = -3000;
    let ztarget = -3000;
    let frames = 11;
    let c = [91, 70, 40, 255] as [number, number, number, number];
    let tilt = 0;
    let ttarget = 0;
    let offset = 0;
    let otarget = 0;
    let eyeZ: number;

    p5.preload = () => {
      strip = p5.loadImage('/images/zoetrope9.jpg');
    };

    p5.setup = () => {
      const canvas = p5.createCanvas(dimensions.width, dimensions.height, p5.WEBGL);
      canvas.parent('zoetrope-container');
      
      eyeZ = (dimensions.height / 2.0) / p5.tan(p5.PI * 30.0 / 180.0);
      p5.perspective(p5.PI / 5.0, dimensions.width / dimensions.height, eyeZ / 10.0, eyeZ * 10.0);
      p5.tint(c);
      p5.frameRate(55); // Your preferred frame rate
    };

    p5.draw = () => {
      if (!strip) return;
      
      setScene();
      drawCylinder();
      drawFins();
      checkKeys();
    };

    function setScene() {
      p5.background(0);
      p5.ambientLight(200);
      p5.pointLight(80, 80, 80, dimensions.width, dimensions.height, 0);
      
      ztarget = p5.constrain(ztarget, -3200, -280);
      zoom = p5.lerp(zoom, ztarget, 0.05);
      p5.translate(0, -100, zoom);
      
      ttarget = p5.map(p5.mouseY, 0, dimensions.height, p5.PI / 9, -p5.PI / 9);
      tilt = p5.lerp(tilt, ttarget, 0.1);
      
      otarget = p5.map(p5.mouseX, 0, dimensions.width, -p5.PI / 6, p5.PI / 6);
      offset = p5.lerp(offset, otarget, 0.05);
      
      p5.rotateX(tilt);
      p5.rotateY(angle + offset);
      
      angle += avel;
      avel = p5.lerp(avel, tavel, 0.05);
      avel = p5.constrain(avel, -0.3, 0.3);
    }

    function drawCylinder() {
      p5.push();
      p5.texture(strip);
      p5.noStroke();
      p5.translate(0, strip.height, 0);
      p5.cylinder(strip.width / p5.TWO_PI, strip.height, 24, 1, false, false);
      p5.specularMaterial(c);
      p5.cylinder(strip.width / p5.TWO_PI + 5, strip.height, 24, 1, false, false);
      p5.pop();

      for (let y = -strip.height / 2; y <= 3 * strip.height / 2; y += strip.height) {
        p5.push();
        p5.specularMaterial(c);
        p5.noStroke();
        p5.translate(0, y, 0);
        p5.rotateX(p5.PI / 2);
        p5.torus(strip.width / p5.TWO_PI + 5, 15);
        p5.pop();
      }
    }

    function drawFins() {
      p5.push();
      const w = strip.width / (1.15 * frames);
      for (let i = 0; i < frames; i++) {
        const a = p5.map(i, 0, frames, 0, p5.TWO_PI);
        p5.push();
        p5.rotateY(a);
        p5.translate(0, 0, strip.width / p5.TWO_PI - 5);
        p5.specularMaterial(c);
        p5.noStroke();
        p5.box(w, strip.height, 5);
        p5.pop();
      }
      p5.pop();
    }

    function checkKeys() {
      if (p5.keyIsDown(p5.LEFT_ARROW)) tavel -= 0.005;
      if (p5.keyIsDown(p5.RIGHT_ARROW)) tavel += 0.005;
      if (p5.keyIsDown(p5.UP_ARROW)) ztarget += 20;
      if (p5.keyIsDown(p5.DOWN_ARROW)) ztarget -= 20;
      if (p5.keyIsDown(32)) avel *= 0.95; // Spacebar brake
    }

    p5.keyPressed = () => {
      if (p5.keyCode === 13) { // Enter - toggle transparency
        if (c[3] === 255) c[3] = 120;
        else c[3] = 255;
        p5.tint(c);
      }
      return false;
    };

    p5.mousePressed = () => {
      // Toggle zoom and rotation like your original
      if (ztarget > -3000) ztarget = -3000;
      else ztarget = -800;
      
      if (tavel < 0.2835) tavel = 0.2835;
      else tavel = 0;
      
      return false;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(dimensions.width, dimensions.height);
      eyeZ = (dimensions.height / 2.0) / p5.tan(p5.PI * 30.0 / 180.0);
      p5.perspective(p5.PI / 5.0, dimensions.width / dimensions.height, eyeZ / 10.0, eyeZ * 10.0);
    };
  }, [dimensions]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        minWidth: dimensions.width,
        minHeight: dimensions.height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent'
      }}
    >
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(91, 70, 40, 0.8)',
            border: '1px solid #5B4628',
            color: '#FFF',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: '12px'
          }}
        >
          ×
        </button>
      )}
      
      <div id="zoetrope-container" style={{ 
        width: dimensions.width,
        height: dimensions.height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <NextReactP5Wrapper sketch={sketch} />
      </div>
      
      <div style={{ 
        marginTop: '10px',
        textAlign: 'center',
        color: 'var(--foreground)',
        fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
        opacity: 0.7
      }}>
        <p>Click to zoom & spin | Arrow keys to control | Enter for transparency</p>
      </div>
    </div>
  );
}

export default ZoetropeSketch;