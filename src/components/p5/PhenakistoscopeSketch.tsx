"use client";
import React, { useCallback, useState, useEffect, useRef } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";

interface PhenakistoscopeSketchProps {
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
  className?: string;
}

export function PhenakistoscopeSketch({
  size = 'medium',
  onClose,
  className = ''
}: PhenakistoscopeSketchProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [viewMode, setViewMode] = useState<'stroboscopic' | 'fluid'>('stroboscopic');
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeMultipliers = {
    small: 0.9,
    medium: 1.2,
    large: 1.5
  };

  const baseSize = 650;
  const multiplier = sizeMultipliers[size];

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 700;
      const containerHeight = rect.height || 700;
      
      const maxSize = Math.min(containerWidth * 0.9, containerHeight * 0.8);
      const finalSize = Math.min(baseSize * multiplier, maxSize);
      
      setDimensions({ 
        width: Math.max(400, finalSize), 
        height: Math.max(400, finalSize) 
      });
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [multiplier]);

  const sketch = useCallback((p5: p5Types) => {
    // Core variables
    let rotation = 0;
    let velocity = 0;
    let slitMask: p5Types.Graphics;
    let contentLayer: p5Types.Graphics;

    
    // Physics constants
    const maxVelocity = 0.08;
    const acceleration = 0.002;
    const friction = 0.985;
    const segments = 12;
    
    // Visual parameters
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.32;
    
    // Minimal color palette
    const colors = {
      bg: [8, 8, 12] as [number, number, number],
      primary: [255, 255, 255] as [number, number, number],
      accent: [100, 255, 160] as [number, number, number],
      secondary: [100, 100, 120] as [number, number, number],
      ghost: [255, 255, 255, 40] as [number, number, number, number]
    };
    
    p5.setup = () => {
      const canvas = p5.createCanvas(dimensions.width, dimensions.height);
      canvas.parent('phenakistoscope-container');
      
      slitMask = p5.createGraphics(dimensions.width, dimensions.height);
      contentLayer = p5.createGraphics(dimensions.width, dimensions.height);
      
      createSlitPattern();
      generateContent();
    };

    function createSlitPattern() {
      slitMask.background(0);
      slitMask.fill(255);
      slitMask.noStroke();
      
      const slitWidth = 3;
      const innerRadius = radius * 0.5;
      const outerRadius = radius * 1.1;
      
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * p5.TWO_PI;
        
        slitMask.push();
        slitMask.translate(centerX, centerY);
        slitMask.rotate(angle);
        slitMask.rect(-slitWidth/2, innerRadius, slitWidth, outerRadius - innerRadius);
        slitMask.pop();
      }
    }

    function generateContent() {
      contentLayer.background(...colors.bg);
      
      // Minimal geometric animation frames
      for (let i = 0; i < segments; i++) {
        const progress = i / segments;
        const segmentAngle = (i / segments) * p5.TWO_PI;
        
        // Position each frame around the circle
        const frameX = centerX + Math.cos(segmentAngle) * radius * 0.7;
        const frameY = centerY + Math.sin(segmentAngle) * radius * 0.7;
        
        drawMinimalFrame(contentLayer, frameX, frameY, progress);
      }
      
      // Central reference point
      contentLayer.fill(...colors.secondary);
      contentLayer.noStroke();
      contentLayer.circle(centerX, centerY, 4);
      
      // Subtle circular guides
      contentLayer.noFill();
      contentLayer.strokeWeight(0.5);
      contentLayer.stroke(...colors.ghost);
      contentLayer.circle(centerX, centerY, radius * 1.4);
      contentLayer.circle(centerX, centerY, radius * 2);
    }

    function drawMinimalFrame(graphics: p5Types.Graphics, x: number, y: number, progress: number) {
      graphics.push();
      graphics.translate(x, y);
      
      // Rotating geometric element
      const elementRotation = progress * p5.TWO_PI * 2;
      graphics.rotate(elementRotation);
      
      // Scale animation
      const scale = 0.7 + 0.4 * Math.sin(progress * p5.TWO_PI);
      graphics.scale(scale);
      
      // Primary shape - minimal square
      graphics.fill(...colors.primary);
      graphics.noStroke();
      graphics.rectMode(p5.CENTER);
      graphics.rect(0, 0, 12, 12, 1);
      
      // Secondary elements
      graphics.fill(...colors.accent);
      for (let j = 0; j < 4; j++) {
        const angle = (j / 4) * p5.TWO_PI + progress * p5.PI;
        const distance = 18 + Math.sin(progress * p5.TWO_PI * 3) * 4;
        const dotX = Math.cos(angle) * distance;
        const dotY = Math.sin(angle) * distance;
        graphics.circle(dotX, dotY, 3);
      }
      
      graphics.pop();
    }

    p5.draw = () => {
      
      // Clean gradient background
      for (let y = 0; y < dimensions.height; y++) {
        const alpha = p5.map(y, 0, dimensions.height, 0.8, 1);
        const [r, g, b] = colors.bg.map(v => v * alpha);
        const c = p5.color(r, g, b);
        p5.stroke(c);
        p5.line(0, y, dimensions.width, y);
      }
      
      // Update physics
      if (isSpinning) {
        velocity = p5.lerp(velocity, maxVelocity, acceleration * 60);
      } else {
        velocity *= friction;
      }
      
      rotation += velocity;
      
      // Draw outer frame
      drawFrame();
      
      // Apply viewing mode
      if (viewMode === 'stroboscopic') {
        drawStroboscopicView();
      } else {
        drawFluidView();
      }
      
      // Interface elements
      drawInterface();
      
      if (showInstructions) {
        drawInstructions();
      }
    };

    function drawFrame() {
      // Minimal outer ring
      p5.strokeWeight(1);
      p5.stroke(...colors.secondary);
      p5.noFill();
      p5.circle(centerX, centerY, radius * 2.4);
      
      // Accent ring
      p5.strokeWeight(2);
      p5.stroke(...colors.accent, 100);
      p5.circle(centerX, centerY, radius * 2.2);
    }

    function drawStroboscopicView() {
      // Rotate content
      p5.push();
      p5.translate(centerX, centerY);
      p5.rotate(rotation);
      p5.translate(-centerX, -centerY);
      
      // Draw content
      p5.image(contentLayer, 0, 0);
      
      p5.pop();
      
      // Apply stroboscopic mask
      p5.blendMode(p5.MULTIPLY);
      p5.image(slitMask, 0, 0);
      p5.blendMode(p5.BLEND);
    }

    function drawFluidView() {
      // Smooth rotation without mask
      p5.push();
      p5.translate(centerX, centerY);
      p5.rotate(rotation);
      p5.translate(-centerX, -centerY);
      
      p5.tint(255, 220);
      p5.image(contentLayer, 0, 0);
      p5.noTint();
      
      p5.pop();
    }

    function drawInterface() {
      // Minimal status indicator
      const statusY = 30;
      
      p5.fill(...colors.secondary);
      p5.textAlign(p5.LEFT);
      p5.textSize(12);
      p5.textFont('JetBrains Mono, monospace');
      p5.text(`MODE: ${viewMode.toUpperCase()}`, 20, statusY);
      
      // Speed indicator
      const speedPercent = Math.round(Math.abs(velocity) / maxVelocity * 100);
      p5.textAlign(p5.RIGHT);
      p5.fill(...colors.accent);
      p5.textSize(12);
      p5.text(`${speedPercent}%`, dimensions.width - 20, statusY);
      
      // Active indicator
      if (isSpinning) {
        p5.fill(...colors.accent);
        p5.noStroke();
        p5.circle(20, statusY + 15, 4);
      }
    }

    function drawInstructions() {
      // Minimal overlay
      p5.fill(0, 0, 0, 180);
      p5.noStroke();
      p5.rect(0, 0, dimensions.width, dimensions.height);
      
      // Clean instruction panel
      const panelW = 280;
      const panelH = 160;
      const panelX = (dimensions.width - panelW) / 2;
      const panelY = (dimensions.height - panelH) / 2;
      
      p5.fill(20, 20, 30);
      p5.stroke(...colors.secondary);
      p5.strokeWeight(1);
      p5.rect(panelX, panelY, panelW, panelH, 4);
      
      // Typography
      p5.fill(...colors.primary);
      p5.textAlign(p5.CENTER);
      p5.textSize(16);
      p5.textFont('Inter, system-ui, sans-serif');
      p5.text("OPTICAL ILLUSION DISC", centerX, panelY + 30);
      
      p5.textSize(11);
      p5.fill(...colors.secondary);
      p5.text("Interactive phenakistoscope", centerX, panelY + 50);
      
      // Instructions
      p5.textSize(10);
      p5.fill(...colors.accent);
      p5.text("CLICK + HOLD  →  Spin", centerX, panelY + 80);
      p5.text("S  →  Stroboscopic mode", centerX, panelY + 95);
      p5.text("F  →  Fluid mode", centerX, panelY + 110);
      
      p5.fill(255, 255, 255, 150);
      p5.textSize(9);
      p5.text("Click to begin", centerX, panelY + 135);
    }

    // Interaction handlers
    p5.mousePressed = () => {
      if (showInstructions) {
        setShowInstructions(false);
        return false;
      }
      
      const distance = p5.dist(p5.mouseX, p5.mouseY, centerX, centerY);
      if (distance < radius * 1.2) {
        setIsSpinning(true);
        return false;
      }
    };

    p5.mouseReleased = () => {
      setIsSpinning(false);
    };

    p5.touchStarted = () => {
      if (showInstructions) {
        setShowInstructions(false);
        return false;
      }
      
      const distance = p5.dist(p5.mouseX, p5.mouseY, centerX, centerY);
      if (distance < radius * 1.2) {
        setIsSpinning(true);
        return false;
      }
    };

    p5.touchEnded = () => {
      setIsSpinning(false);
    };

    p5.keyPressed = () => {
      if (p5.key === 's' || p5.key === 'S') {
        setViewMode('stroboscopic');
      } else if (p5.key === 'f' || p5.key === 'F') {
        setViewMode('fluid');
      } else if (p5.key === ' ') {
        setShowInstructions(!showInstructions);
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(dimensions.width, dimensions.height);
      slitMask = p5.createGraphics(dimensions.width, dimensions.height);
      contentLayer = p5.createGraphics(dimensions.width, dimensions.height);
      createSlitPattern();
      generateContent();
    };
  }, [dimensions, isSpinning, showInstructions, viewMode]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        position: 'relative', 
        background: 'linear-gradient(135deg, #080810 0%, #0f0f18 50%, #080810 100%)', 
        borderRadius: '8px', 
        padding: '24px',
        width: '100%',
        height: '100%',
        minWidth: dimensions.width + 60,
        minHeight: dimensions.height + 100,
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.05),
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 0 0 1px rgba(100, 255, 160, 0.1)
        `,
        overflow: 'hidden'
      }}
    >
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.7)',
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 10,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(100, 255, 160, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(100, 255, 160, 0.3)';
            e.currentTarget.style.color = 'rgba(100, 255, 160, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          ×
        </button>
      )}
      
      <div id="phenakistoscope-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: dimensions.height
      }}>
        <NextReactP5Wrapper sketch={sketch} />
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        color: 'rgba(255, 255, 255, 0.6)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
        lineHeight: '1.6',
        letterSpacing: '0.5px'
      }}>
        <p style={{ 
          margin: '0 0 4px 0', 
          color: 'rgba(100, 255, 160, 0.8)',
          fontWeight: '500',
          textTransform: 'uppercase'
        }}>
          Optical Illusion Device
        </p>
        <p style={{ 
          margin: '0', 
          fontSize: '10px', 
          opacity: '0.5'
        }}>
          Mode: {viewMode} • Press S/F to switch • Space for help
        </p>
      </div>
    </div>
  );
}

export default PhenakistoscopeSketch;