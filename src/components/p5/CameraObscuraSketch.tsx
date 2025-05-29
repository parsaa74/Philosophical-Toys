"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import P5Wrapper, { P5, P5Element } from './P5Wrapper';

interface CameraObscuraSketchProps {
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
  className?: string;
}

export function CameraObscuraSketch({
  size = 'medium',
  onClose,
  className = ''
}: CameraObscuraSketchProps) {
  const [showControls] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isContainerReady, setIsContainerReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive dimensions based on container and viewport
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Minimal margins for maximum sketch area
    const availableWidth = Math.min(rect.width - 5, viewportWidth - 10);
    const availableHeight = Math.min(rect.height - 40, viewportHeight - 60);
    
    // Much larger size multipliers for bigger sketches
    const sizeMultipliers = {
      small: 0.99,
      medium: 1.17,
      large: 1.35
    };
    
    const multiplier = sizeMultipliers[size];
    // Even wider aspect ratio for maximum space usage
    const targetAspectRatio = 1.8;
    
    let width = Math.floor(availableWidth * multiplier);
    let height = Math.floor(width / targetAspectRatio);
    
    if (height > availableHeight) {
      height = Math.floor(availableHeight * multiplier);
      width = Math.floor(height * targetAspectRatio);
    }
    
    // Decreased maximum sizes by 10%
    width = Math.max(810, Math.min(width, 1800));
    height = Math.max(450, Math.min(height, 1080));
    
    width = Math.floor(width / 2) * 2;
    height = Math.floor(height / 2) * 2;
    
    setDimensions({ width, height });
  }, [size]);

  // Ensure container is ready before initializing P5
  useEffect(() => {
    if (containerRef.current) {
      setIsContainerReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isContainerReady) return;
    
    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions, isContainerReady]);

  // Enhanced Camera Obscura sketch with sophisticated visuals and animations
  const cameraObscuraSketch = useCallback((p: P5) => {
    let aperture: { x: number; y: number; size: number; targetY: number };
    let objectPos: { x: number; y: number; size: number; targetX: number; targetY: number };
    let screenDistance: number;
    let lightRays: Array<{ start: { x: number; y: number }; aperture: { x: number; y: number }; end: { x: number; y: number } | null; intensity: number }> = [];
    let showRays = true;
    let draggingObject = false;
    let draggingAperture = false;
    let time = 0;

    // Enhanced visual elements
    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }> = [];
    let hoverGlow = 0;
    let objectHover = false;
    let apertureHover = false;

    // UI elements
    let apertureSlider: P5Element;
    let objectSlider: P5Element;
    let rayButton: P5Element;
    
    // Responsive scaling factors
    let scaleFactor: number;
    let uiScale: number;
    let isInitialized = false;

    // Color palette - sophisticated and elegant
    const colors = {
      background: [8, 12, 24],
      chamber: [25, 28, 35],
      chamberStroke: [65, 75, 95],
      object: [255, 85, 85],
      objectGlow: [255, 120, 120],
      aperture: [255, 220, 100],
      apertureGlow: [255, 240, 150],
      screen: [240, 245, 255],
      rays: [255, 220, 100],
      text: [220, 225, 235],
      accent: [100, 150, 255]
    };

    function initializeParameters() {
      scaleFactor = Math.min(dimensions.width / 900, dimensions.height / 600);
      uiScale = Math.max(0.9, Math.min(scaleFactor, 1.3));
      
      aperture = {
        x: p.width / 2,
        y: p.height / 2,
        targetY: p.height / 2,
        size: Math.max(8, 10 * scaleFactor)
      };
      
      objectPos = {
        x: p.width * 0.25,
        y: p.height / 2 - 40 * scaleFactor,
        targetX: p.width * 0.25,
        targetY: p.height / 2 - 40 * scaleFactor,
        size: Math.max(50, 70 * scaleFactor)
      };
      
      screenDistance = Math.max(180, 240 * scaleFactor);
    }

    p.setup = function() {
      p.createCanvas(dimensions.width, dimensions.height);
      initializeParameters();
      createControls();
      isInitialized = true;
      
      // Initialize particles
      for (let i = 0; i < 20; i++) {
        particles.push(createParticle());
      }
    };

    p.windowResized = function() {
      if (dimensions.width && dimensions.height && isInitialized) {
        p.resizeCanvas(dimensions.width, dimensions.height);
        initializeParameters();
        
        if (apertureSlider) apertureSlider.position(20 * uiScale, 20 * uiScale);
        if (objectSlider) objectSlider.position(20 * uiScale, (50 * uiScale) + (20 * uiScale));
        if (rayButton) rayButton.position(20 * uiScale, (80 * uiScale) + (40 * uiScale));
      }
    };

    function createControls() {
      // Enhanced control styling
      const controlStyle = {
        width: `${Math.max(140, 170 * uiScale)}px`,
        height: `${Math.max(22, 25 * uiScale)}px`,
        background: 'rgba(25, 28, 35, 0.9)',
        border: '1px solid rgba(100, 150, 255, 0.3)',
        borderRadius: '12px',
        outline: 'none',
        backdropFilter: 'blur(10px)'
      };

      apertureSlider = p.createSlider(
        Math.max(2, 2 * scaleFactor), 
        Math.max(12, 20 * scaleFactor), 
        aperture.size, 
        0.5 * scaleFactor
      );
      apertureSlider.position(20 * uiScale, 20 * uiScale);
      apertureSlider.style('width', controlStyle.width);
      apertureSlider.style('height', controlStyle.height);
      apertureSlider.style('background', controlStyle.background);
      apertureSlider.style('border', controlStyle.border);
      apertureSlider.style('border-radius', controlStyle.borderRadius);
      apertureSlider.style('outline', controlStyle.outline);
      apertureSlider.style('backdrop-filter', controlStyle.backdropFilter);
      
      objectSlider = p.createSlider(
        Math.max(20, 20 * scaleFactor), 
        Math.max(80, 120 * scaleFactor), 
        objectPos.size, 
        2 * scaleFactor
      );
      objectSlider.position(20 * uiScale, (50 * uiScale) + (20 * uiScale));
      objectSlider.style('width', controlStyle.width);
      objectSlider.style('height', controlStyle.height);
      objectSlider.style('background', controlStyle.background);
      objectSlider.style('border', controlStyle.border);
      objectSlider.style('border-radius', controlStyle.borderRadius);
      objectSlider.style('outline', controlStyle.outline);
      objectSlider.style('backdrop-filter', controlStyle.backdropFilter);
      
      rayButton = p.createButton('◯ Toggle Light Rays');
      rayButton.position(20 * uiScale, (80 * uiScale) + (40 * uiScale));
      rayButton.style('padding', `${Math.max(8, 10 * uiScale)}px ${Math.max(16, 20 * uiScale)}px`);
      rayButton.style('font-size', `${Math.max(11, 13 * uiScale)}px`);
      rayButton.style('background', 'rgba(25, 28, 35, 0.9)');
      rayButton.style('color', 'rgb(220, 225, 235)');
      rayButton.style('border', '1px solid rgba(100, 150, 255, 0.3)');
      rayButton.style('border-radius', '12px');
      rayButton.style('cursor', 'pointer');
      rayButton.style('backdrop-filter', 'blur(10px)');
      rayButton.style('transition', 'all 0.3s ease');
      rayButton.mousePressed(() => {
        showRays = !showRays;
      });
    }

    function createParticle() {
      return {
        x: p.random(p.width),
        y: p.random(p.height),
        vx: p.random(-0.5, 0.5),
        vy: p.random(-0.5, 0.5),
        life: p.random(100, 200),
        maxLife: p.random(100, 200)
      };
    }

    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        if (particle.life <= 0 || particle.x < 0 || particle.x > p.width || particle.y < 0 || particle.y > p.height) {
          particles[i] = createParticle();
        }
      }
    }

    function drawParticles() {
      for (const particle of particles) {
        const alpha = (particle.life / particle.maxLife) * 30;
        p.fill(colors.accent[0], colors.accent[1], colors.accent[2], alpha);
        p.noStroke();
        p.ellipse(particle.x, particle.y, 2 * scaleFactor);
      }
    }

    p.draw = function() {
      if (!isInitialized) return;

      time += 0.02;

      // Smooth easing for object and aperture positions
      const easing = 0.08;
      objectPos.x += (objectPos.targetX - objectPos.x) * easing;
      objectPos.y += (objectPos.targetY - objectPos.y) * easing;
      aperture.y += (aperture.targetY - aperture.y) * easing;

      // Update from sliders
      if (apertureSlider) aperture.size = Number(apertureSlider.value());
      if (objectSlider) objectPos.size = Number(objectSlider.value());

      // Enhanced background with subtle gradient
      drawBackground();
      
      // Update and draw ambient particles
      updateParticles();
      drawParticles();
      
      // Draw enhanced chamber
      drawEnhancedChamber();
      
      // Draw enhanced object with glow
      drawEnhancedObject();
      
      // Draw enhanced aperture with glow
      drawEnhancedAperture();
      
      // Draw enhanced screen
      drawEnhancedScreen();
      
      // Calculate and draw sophisticated light rays
      if (showRays) {
        calculateEnhancedLightRays();
        drawEnhancedLightRays();
      }
      
      // Draw enhanced projected image
      drawEnhancedProjectedImage();
      
      // Draw elegant labels
      drawEnhancedLabels();
      
      // Draw minimal instructions
      drawEnhancedInstructions();

      // Update hover effects
      updateHoverEffects();
    };

    function drawBackground() {
      // Subtle radial gradient background
      for (let r = Math.max(p.width, p.height); r > 0; r -= 2) {
        const alpha = ((Math.max(p.width, p.height) - r) / Math.max(p.width, p.height)) * 255;
        const lerpAmt = r / Math.max(p.width, p.height);
        
        // Manual color interpolation since p5.js lerpColor might not be available
        const bg1 = { r: colors.background[0] + 5, g: colors.background[1] + 8, b: colors.background[2] + 15 };
        const bg2 = { r: colors.background[0], g: colors.background[1], b: colors.background[2] };
        
        const bgColor = {
          r: bg2.r + (bg1.r - bg2.r) * lerpAmt,
          g: bg2.g + (bg1.g - bg2.g) * lerpAmt,
          b: bg2.b + (bg1.b - bg2.b) * lerpAmt
        };
        
        p.fill(bgColor.r, bgColor.g, bgColor.b, alpha * 0.1);
        p.noStroke();
        p.ellipse(p.width / 2, p.height / 2, r);
      }
    }

    function drawEnhancedChamber() {
      const wallOffset = Math.max(200, 300 * scaleFactor);
      const margin = Math.max(25, 40 * scaleFactor);
      
      // Enhanced chamber walls with gradient
      p.strokeWeight(Math.max(3, 5 * scaleFactor));
      
      // Create gradient effect
      const steps = 20;
      for (let i = 0; i < steps; i++) {
        const alpha = 180 - ((i / (steps - 1)) * (180 - 60));
        p.stroke(colors.chamberStroke[0], colors.chamberStroke[1], colors.chamberStroke[2], alpha);
        const offset = i * 0.5;
        
        // Left wall
        p.line(aperture.x - wallOffset - offset, margin, aperture.x - wallOffset - offset, p.height - margin);
        // Right wall  
        p.line(aperture.x + screenDistance + offset, margin, aperture.x + screenDistance + offset, p.height - margin);
        // Top wall
        p.line(aperture.x - wallOffset, margin - offset, aperture.x + screenDistance, margin - offset);
        // Bottom wall
        p.line(aperture.x - wallOffset, p.height - margin + offset, aperture.x + screenDistance, p.height - margin + offset);
      }
    }

    function drawEnhancedObject() {
      const hitRadius = Math.max(30, 40 * scaleFactor);
      objectHover = p.dist(p.mouseX, p.mouseY, objectPos.x, objectPos.y + objectPos.size/2) < hitRadius;
      
      p.push();
      p.translate(objectPos.x, objectPos.y);
      
      // Glow effect when hovering or dragging
      if (objectHover || draggingObject) {
        hoverGlow = hoverGlow + (1 - hoverGlow) * 0.1;
        
        // Outer glow
        for (let r = 40 * scaleFactor; r > 0; r--) {
          const alpha = ((40 * scaleFactor - r) / (40 * scaleFactor)) * 80 * hoverGlow;
          p.fill(colors.objectGlow[0], colors.objectGlow[1], colors.objectGlow[2], alpha);
          p.noStroke();
          p.ellipse(0, objectPos.size/2, r);
        }
      } else {
        hoverGlow = hoverGlow + (0 - hoverGlow) * 0.1;
      }
      
      // Enhanced arrow design
      const arrowWidth = Math.max(8, 12 * scaleFactor);
      const arrowHeadSize = Math.max(12, 18 * scaleFactor);
      
      // Arrow body with gradient
      p.strokeWeight(Math.max(1, 2 * scaleFactor));
      for (let i = 0; i < arrowWidth; i++) {
        const alpha = 255 - ((i / (arrowWidth - 1)) * (255 - 180));
        p.fill(colors.object[0], colors.object[1], colors.object[2], alpha);
        p.stroke(colors.objectGlow[0], colors.objectGlow[1], colors.objectGlow[2], alpha * 0.8);
        p.rect(-arrowWidth/2 + i, 0, 1, objectPos.size);
      }
      
      // Arrow head with glow
      p.fill(colors.object[0], colors.object[1], colors.object[2], 255);
      p.stroke(colors.objectGlow[0], colors.objectGlow[1], colors.objectGlow[2], 200);
      p.triangle(-arrowHeadSize, 0, arrowHeadSize, 0, 0, -arrowHeadSize * 1.3);
      
      p.pop();
    }

    function drawEnhancedAperture() {
      const margin = Math.max(25, 40 * scaleFactor);
      apertureHover = Math.abs(p.mouseX - aperture.x) < Math.max(15, 20 * scaleFactor) && 
                     Math.abs(p.mouseY - aperture.y) < aperture.size + Math.max(15, 20 * scaleFactor);
      
      p.push();
      
      // Enhanced aperture wall with depth
      p.strokeWeight(Math.max(6, 12 * scaleFactor));
      p.stroke(colors.chamberStroke[0], colors.chamberStroke[1], colors.chamberStroke[2]);
      p.line(aperture.x, margin, aperture.x, aperture.y - aperture.size / 2);
      p.line(aperture.x, aperture.y + aperture.size / 2, aperture.x, p.height - margin);
      
      // Aperture opening with intense glow
      if (apertureHover || draggingAperture) {
        // Intense glow effect
        for (let r = 60 * scaleFactor; r > 0; r -= 2) {
          const alpha = ((60 * scaleFactor - r) / (60 * scaleFactor)) * 120;
          p.stroke(colors.apertureGlow[0], colors.apertureGlow[1], colors.apertureGlow[2], alpha);
          p.strokeWeight(2);
          p.line(aperture.x, aperture.y - aperture.size / 2 - r/4, aperture.x, aperture.y + aperture.size / 2 + r/4);
        }
      }
      
      // Main aperture line with pulsing effect
      const pulseIntensity = 1 + 0.2 * Math.sin(time * 3);
      p.stroke(colors.aperture[0], colors.aperture[1], colors.aperture[2], 255 * pulseIntensity);
      p.strokeWeight(Math.max(3, 6 * scaleFactor));
      p.line(aperture.x, aperture.y - aperture.size / 2, aperture.x, aperture.y + aperture.size / 2);
      
      // Aperture center point with glow
      p.fill(colors.aperture[0], colors.aperture[1], colors.aperture[2], 255);
      p.noStroke();
      p.ellipse(aperture.x, aperture.y, Math.max(6, 8 * scaleFactor));
      
      p.pop();
    }

    function drawEnhancedScreen() {
      p.push();
      const margin = Math.max(25, 40 * scaleFactor);
      
      // Screen with frosted glass effect
      p.strokeWeight(Math.max(2, 4 * scaleFactor));
      p.stroke(colors.screen[0], colors.screen[1], colors.screen[2], 120);
      
      // Multiple layers for depth
      for (let i = 0; i < 3; i++) {
        const alpha = 40 - i * 10;
        p.fill(colors.screen[0], colors.screen[1], colors.screen[2], alpha);
        p.rect(aperture.x + screenDistance - 3 + i, margin, 6 - i * 2, p.height - 2 * margin);
      }
      
      p.pop();
    }

    function calculateEnhancedLightRays() {
      lightRays = [];
      
      const numRays = Math.max(6, Math.min(12, Math.floor(8 * scaleFactor)));
      
      for (let i = 0; i < numRays; i++) {
        const rayY = objectPos.y + (i / (numRays - 1)) * objectPos.size - 10 * scaleFactor;
        const intensity = 1.0 - (Math.abs(i - numRays/2) / (numRays/2)) * 0.7;
        
        const ray = {
          start: { x: objectPos.x + 12 * scaleFactor, y: rayY },
          aperture: { x: aperture.x, y: aperture.y },
          end: null as { x: number; y: number } | null,
          intensity: intensity
        };
        
        const dx = aperture.x - ray.start.x;
        const dy = aperture.y - ray.start.y;
        
        const screenX = aperture.x + screenDistance;
        const t = (screenX - aperture.x) / dx;
        const screenY = aperture.y + dy * t;
        
        ray.end = { x: screenX, y: screenY };
        lightRays.push(ray);
      }
    }

    function drawEnhancedLightRays() {
      for (const ray of lightRays) {
        if (ray.end) {
          // Multiple passes for glow effect
          for (let pass = 0; pass < 3; pass++) {
            const weight = (3 - pass) * Math.max(0.5, 1.5 * scaleFactor);
            const alpha = (120 - pass * 30) * ray.intensity;
            
            p.stroke(colors.rays[0], colors.rays[1], colors.rays[2], alpha);
            p.strokeWeight(weight);
            
            // Ray from object to aperture
            p.line(ray.start.x, ray.start.y, ray.aperture.x, ray.aperture.y);
            
            // Ray from aperture to screen (straight line for simplicity)
            p.line(ray.aperture.x, ray.aperture.y, ray.end.x, ray.end.y);
          }
        }
      }
    }

    function drawEnhancedProjectedImage() {
      if (lightRays.length === 0) return;
      
      p.push();
      
      const endYs = lightRays.map(r => r.end?.y || 0).filter(y => y !== 0);
      if (endYs.length === 0) return;
      
      const minY = Math.min(...endYs);
      const maxY = Math.max(...endYs);
      const imageHeight = maxY - minY;
      const imageCenter = (minY + maxY) / 2;
      
      p.translate(aperture.x + screenDistance, imageCenter);
      p.scale(1, -1);
      
      // Enhanced projected image with glow
      const scale_factor = imageHeight / objectPos.size;
      const projectedWidth = Math.max(3, 8 * scaleFactor * scale_factor);
      const projectedHeadSize = Math.max(8, 12 * scaleFactor * scale_factor);
      
      // Glow effect around projection
      for (let r = 30 * scaleFactor; r > 0; r -= 2) {
        const alpha = ((30 * scaleFactor - r) / (30 * scaleFactor)) * 60;
        p.fill(colors.object[0], colors.object[1], colors.object[2], alpha);
        p.noStroke();
        const glowScale = 1 + r / (100 * scaleFactor);
        p.rect(-projectedWidth/2 * glowScale, -imageHeight/2 + 10 * scaleFactor, 
              projectedWidth * glowScale, imageHeight - 20 * scaleFactor);
      }
      
      // Main projected image
      p.fill(colors.object[0], colors.object[1], colors.object[2], 220);
      p.stroke(colors.objectGlow[0], colors.objectGlow[1], colors.objectGlow[2], 150);
      p.strokeWeight(Math.max(0.5, 1 * scaleFactor));
      
      p.rect(-projectedWidth/2, -imageHeight/2 + 10 * scaleFactor, 
            projectedWidth, imageHeight - 20 * scaleFactor);
      p.triangle(-projectedHeadSize, -imageHeight/2 + 10 * scaleFactor, 
               projectedHeadSize, -imageHeight/2 + 10 * scaleFactor, 
               0, -imageHeight/2 - 10 * scaleFactor);
      
      p.pop();
    }

    function drawEnhancedLabels() {
      p.push();
      p.textAlign('center');
      p.textSize(Math.max(11, 14 * scaleFactor));
      p.textFont('system-ui, -apple-system, sans-serif');
      
      const labelOffset = Math.max(25, 35 * scaleFactor);
      
      // Enhanced label styling with subtle glow
      const drawLabel = (text: string, x: number, y: number, glow = false) => {
        if (glow) {
          p.fill(colors.accent[0], colors.accent[1], colors.accent[2], 100);
          for (let i = 0; i < 3; i++) {
            p.text(text, x + i - 1, y + i - 1);
          }
        }
        p.fill(colors.text[0], colors.text[1], colors.text[2], 200);
        p.text(text, x, y);
      };
      
      drawLabel("Object", objectPos.x, objectPos.y + objectPos.size + labelOffset, objectHover);
      drawLabel("Aperture", aperture.x, Math.max(25, 35 * scaleFactor), apertureHover);
      drawLabel("Screen", aperture.x + screenDistance, Math.max(25, 35 * scaleFactor));
      drawLabel("Inverted Image", aperture.x + screenDistance, p.height - Math.max(15, 25 * scaleFactor));
      
      p.pop();
    }

    function drawEnhancedInstructions() {
      p.push();
      p.textAlign('left');
      p.textSize(Math.max(10, 12 * scaleFactor));
      p.textFont('system-ui, -apple-system, sans-serif');
      
      const instrY = p.height - Math.max(90, 110 * scaleFactor);
      const lineHeight = Math.max(16, 18 * scaleFactor);
      
      // Semi-transparent background for instructions
      p.fill(colors.chamber[0], colors.chamber[1], colors.chamber[2], 120);
      p.noStroke();
      p.rect(10 * uiScale, instrY - 10, Math.max(280, 350 * uiScale), lineHeight * 5 + 20, 8);
      
      p.fill(colors.text[0], colors.text[1], colors.text[2], 180);
      p.text("◯ Drag the red arrow to move the object", 20 * uiScale, instrY + lineHeight);
      p.text("◯ Drag the yellow aperture vertically", 20 * uiScale, instrY + lineHeight * 2);
      p.text("◯ Use sliders to adjust sizes", 20 * uiScale, instrY + lineHeight * 3);
      p.text("◯ Press 'R' to toggle light rays", 20 * uiScale, instrY + lineHeight * 4);
      
      p.pop();
    }

    function updateHoverEffects() {
      // Update cursor based on hover state
      if (objectHover || apertureHover) {
        document.body.style.cursor = 'pointer';
      } else if (draggingObject || draggingAperture) {
        document.body.style.cursor = 'grabbing';
      } else {
        document.body.style.cursor = 'default';
      }
    }

    p.mousePressed = function() {
      const hitRadius = Math.max(30, 40 * scaleFactor);
      
      if (p.dist(p.mouseX, p.mouseY, objectPos.x, objectPos.y + objectPos.size/2) < hitRadius) {
        draggingObject = true;
        return;
      }
      
      if (Math.abs(p.mouseX - aperture.x) < Math.max(15, 20 * scaleFactor) && 
          Math.abs(p.mouseY - aperture.y) < aperture.size + Math.max(15, 20 * scaleFactor)) {
        draggingAperture = true;
        return;
      }
    };

    p.mouseDragged = function() {
      if (draggingObject) {
        const minX = Math.max(40, 60 * scaleFactor);
        const maxX = aperture.x - Math.max(40, 60 * scaleFactor);
        const minY = Math.max(60, 80 * scaleFactor);
        const maxY = p.height - minY - objectPos.size;
        
        objectPos.targetX = p.constrain(p.mouseX, minX, maxX);
        objectPos.targetY = p.constrain(p.mouseY, minY, maxY);
      }
      
      if (draggingAperture) {
        const minY = Math.max(60, 80 * scaleFactor);
        const maxY = p.height - minY;
        aperture.targetY = p.constrain(p.mouseY, minY, maxY);
      }
    };

    p.mouseReleased = function() {
      draggingObject = false;
      draggingAperture = false;
      document.body.style.cursor = 'default';
    };

    p.keyPressed = function() {
      if (p.key === 'r' || p.key === 'R') {
        showRays = !showRays;
      }
      
      if (p.key === ' ') {
        objectPos.targetX = p.width * 0.25;
        objectPos.targetY = p.height / 2 - 40 * scaleFactor;
        aperture.targetY = p.height / 2;
      }
    };
  }, [dimensions]);

  return (
    <div 
      ref={containerRef} 
      className={`camera-obscura-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: '600px',
        background: 'linear-gradient(135deg, rgb(8, 12, 24) 0%, rgb(15, 20, 35) 100%)'
      }}
    >
      {/* Enhanced close button */}
      {onClose && (
        <div style={{ 
          position: 'absolute',
          top: '15px', 
          right: '15px',
          zIndex: 20 
        }}>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(25, 28, 35, 0.9)',
              color: 'rgb(220, 225, 235)',
              border: '1px solid rgba(100, 150, 255, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              fontWeight: '300'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(35, 38, 45, 0.95)';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(25, 28, 35, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.3)';
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Enhanced title and description */}
      {showControls && (
        <div style={{ 
          position: 'absolute',
          top: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '80%',
          zIndex: 15
        }}>
          <div style={{
            color: 'rgb(220, 225, 235)',
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            lineHeight: '1.4',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0px 0px 8px rgba(0,0,0,0.7)',
            fontWeight: '300'
          }}>
            <h3 style={{ 
              margin: '0 0 5px 0', 
              fontSize: '1em', 
              fontWeight: '300',
              letterSpacing: '0.5px'
            }}>
              Camera Obscura
            </h3>
            <p style={{ 
              margin: '0', 
              fontSize: '0.8em', 
              fontStyle: 'italic', 
              opacity: 0.85,
              letterSpacing: '0.3px'
            }}>
              Explore how light travels through a small aperture to create an inverted image
            </p>
          </div>
        </div>
      )}
      
      <div 
        className="canvas-container" 
        style={{ 
          marginTop: '30px',
          width: dimensions.width,
          height: dimensions.height,
          border: '1px solid rgba(100, 150, 255, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          position: 'relative',
          backdropFilter: 'blur(10px)'
        }}
      >
        {isContainerReady && (
          <P5Wrapper 
            key={`${dimensions.width}-${dimensions.height}`}
            sketch={cameraObscuraSketch} 
            className="camera-obscura-sketch"
          />
        )}
      </div>
      
      {/* Enhanced responsive info */}
      {dimensions.width < 500 && (
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.75rem',
          color: 'rgba(220, 225, 235, 0.7)',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.3px'
        }}>
          Press &rsquo;R&rsquo; for light rays • Space to reset
        </div>
      )}
    </div>
  );
}

export default CameraObscuraSketch; 