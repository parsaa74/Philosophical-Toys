'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";

/**
 * ModernTitleSketch - Minimal cinematic animated title component
 * 
 * This component displays "philosophical toys" as an animated title with 
 * minimal film aesthetic including:
 * - Single film strip animation
 * - Typewriter text animation
 * - Subtle film grain
 * - Clean cinematic presentation
 * 
 * The title "philosophical toys" is displayed prominently
 */

interface ModernTitleSketchProps {
  onAnimationComplete?: () => void;
  text?: string;
  paused?: boolean;
  style?: 'rodenbroeker' | 'geometric' | 'minimal';
}

interface TextElement {
  char: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  targetSize: number;
  opacity: number;
  targetOpacity: number;
  formationProgress: number;
  departureProgress: number;
  isPhilosophical: boolean;
  index: number;
  typewriterDelay: number;
}

interface FilmStrip {
  x: number;
  y: number;
  width: number;
  height: number;
  frames: number;
  currentFrame: number;
  opacity: number;
  scrollSpeed: number;
  isVertical: boolean;
}

interface ProjectorBeam {
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  opacity: number;
  dustParticles: DustParticle[];
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  drift: number;
  opacity: number;
}

export function ModernTitleSketch({
  onAnimationComplete,
  text = 'philosophical toys',
  paused = false,
  style = 'minimal'
}: ModernTitleSketchProps) {
  const [error, setError] = useState<Error | null>(null);
  const pausedRef = useRef(paused);
  
  useEffect(() => { 
    pausedRef.current = paused; 
  }, [paused]);

  const dimensions = {
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  };

  const sketch = useCallback((p5: p5Types) => {
    const elements: TextElement[] = [];
    const filmStrips: FilmStrip[] = [];
    let beam: ProjectorBeam;
    let isComplete = false;
    let phase = 'projection';
    let phaseTimer = 0;
    let frameCount = 0;
    let canvas: p5Types.Renderer;
    let isDestroyed = false;
    let filmFlicker = 1;

    p5.setup = () => {
      if (pausedRef.current) return;
      
      try {
        canvas = p5.createCanvas(dimensions.width, dimensions.height);
        p5.frameRate(60);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textFont('Georgia, "Times New Roman", serif');
        
        setupElements();
        
      } catch (error) {
        console.error('Setup error:', error);
        setError(error instanceof Error ? error : new Error('Setup failed'));
      }
    };
    
    const setupElements = () => {
      // Film strip
      filmStrips.push({
        x: dimensions.width * 0.35,
        y: -dimensions.height * 2,
        width: 240,
        height: dimensions.height * 15,
        frames: 40,
        currentFrame: 0,
        opacity: 0,
        scrollSpeed: 10.0,
        isVertical: true
      });

      // Projector beam
      beam = {
        x: -dimensions.width/2 - 100,
        y: -dimensions.height * 0.05,
        angle: 0.02,
        length: dimensions.width + 300,
        width: 180,
        opacity: 0,
        dustParticles: []
      };
      
      for (let i = 0; i < 15; i++) {
        beam.dustParticles.push({
          x: p5.random(0, beam.length),
          y: p5.random(-beam.width/2, beam.width/2),
          size: p5.random(0.8, 2.0),
          drift: p5.random(-0.1, 0.1),
          opacity: p5.random(30, 70)
        });
      }

      // Text setup
      const words = text.split(' ');
      const philosophical = words[0] || '';
      const toys = words[1] || '';
      
      const baseSize = Math.min(dimensions.width, dimensions.height) * 0.10;
      const lineSpacing = baseSize * 0.8;
      const philosophicalY = -lineSpacing/2;
      const toysY = lineSpacing/2;
      
      // Setup philosophical text
      const philosophicalSpacing = baseSize * 0.75;
      const philosophicalWidth = philosophical.length * philosophicalSpacing;
      const philosophicalStartX = -philosophicalWidth / 2;
      
      philosophical.split('').forEach((char, i) => {
        elements.push({
          char,
          x: philosophicalStartX + (i * philosophicalSpacing),
          y: philosophicalY - 150,
          targetX: philosophicalStartX + (i * philosophicalSpacing),
          targetY: philosophicalY,
          size: baseSize * 0.2,
          targetSize: baseSize,
          opacity: 0,
          targetOpacity: 200,
          formationProgress: 0,
          departureProgress: 0,
          isPhilosophical: true,
          index: i,
          typewriterDelay: i * 8
        });
      });
      
      // Setup toys text
      const toysSpacing = baseSize * 0.75;
      const toysWidth = toys.length * toysSpacing;
      const toysStartX = -toysWidth / 2;
      
      toys.split('').forEach((char, i) => {
        elements.push({
          char,
          x: toysStartX + (i * toysSpacing),
          y: toysY + 150,
          targetX: toysStartX + (i * toysSpacing),
          targetY: toysY,
          size: baseSize * 0.2,
          targetSize: baseSize,
          opacity: 0,
          targetOpacity: 200,
          formationProgress: 0,
          departureProgress: 0,
          isPhilosophical: false,
          index: i,
          typewriterDelay: (philosophical.length * 8) + (i * 8)
        });
      });
    };
    
    const updateElements = () => {
      filmFlicker = 1 + (Math.sin(frameCount * 0.3) * 0.03);
      
      elements.forEach((element) => {
        if (phase === 'projection') {
          if (frameCount > element.typewriterDelay) {
            element.formationProgress = p5.lerp(element.formationProgress, 1, 0.06);
            const easeProgress = 1 - Math.pow(1 - element.formationProgress, 3);
            
            element.y = p5.lerp(element.y, element.targetY, 0.08 * easeProgress);
            element.size = p5.lerp(element.size, element.targetSize, 0.06 * easeProgress);
            
            let targetOpacity = element.targetOpacity;
            if (beam && beam.opacity > 5) {
              const beamCenterY = beam.y + (beam.length * Math.sin(beam.angle));
              const distanceFromBeamCenter = Math.abs(element.targetY - beamCenterY);
              
              if (distanceFromBeamCenter < beam.width/3) {
                const illumination = 1 - (distanceFromBeamCenter / (beam.width/3));
                targetOpacity = element.targetOpacity + (illumination * 80);
              }
            }
            
            element.opacity = p5.lerp(element.opacity, targetOpacity, 0.08);
          }
          
        } else if (phase === 'display') {
          const float = Math.sin(frameCount * 0.02 + element.index * 0.5) * 1;
          element.y = element.targetY + float;
          
          let baseOpacity = element.targetOpacity * filmFlicker;
          
          if (beam && beam.opacity > 5) {
            const beamCenterY = beam.y + (beam.length * Math.sin(beam.angle));
            const distanceFromBeamCenter = Math.abs(element.y - beamCenterY);
            
            if (distanceFromBeamCenter < beam.width/3) {
              const illumination = 1 - (distanceFromBeamCenter / (beam.width/3));
              baseOpacity += illumination * 60;
            }
          }
          
          element.opacity = baseOpacity;
          
        } else if (phase === 'fadeout') {
          element.departureProgress = p5.lerp(element.departureProgress, 1, 0.03);
          element.opacity = p5.lerp(element.opacity, 0, 0.04);
        }
      });
      
      // Update film strip
      if (filmStrips.length > 0) {
        const strip = filmStrips[0];
        strip.opacity = (phase === 'projection' || phase === 'display') ? 
          p5.lerp(strip.opacity, 80, 0.02) : p5.lerp(strip.opacity, 0, 0.04);
        
        strip.currentFrame += strip.scrollSpeed;
        if (strip.currentFrame >= strip.frames) strip.currentFrame = 0;
        
        strip.y += strip.scrollSpeed;
        const loopCycle = strip.height / 2;
        if (strip.y > loopCycle) {
          strip.y = strip.y - loopCycle;
        }
      }

      // Update projector beam
      if (beam) {
        beam.opacity = (phase === 'projection' || phase === 'display') ? 
          p5.lerp(beam.opacity, 18, 0.03) : p5.lerp(beam.opacity, 0, 0.04);
        
        beam.dustParticles.forEach(particle => {
          particle.x += particle.drift;
          particle.y += Math.sin(frameCount * 0.005 + particle.x * 0.002) * 0.25;
          
          if (particle.x > beam.length) particle.x = 0;
          if (particle.x < 0) particle.x = beam.length;
          if (particle.y > beam.width/2) particle.y = -beam.width/2;
          if (particle.y < -beam.width/2) particle.y = beam.width/2;
        });
      }
    };

    const drawFilmStrip = () => {
      if (filmStrips.length === 0 || filmStrips[0].opacity <= 2) return;
      
      const strip = filmStrips[0];
      p5.push();
      p5.translate(strip.x, 0);
      
      // Background
      p5.fill(120, 120, 120, strip.opacity);
      p5.noStroke();
      p5.rect(-strip.width/2, -dimensions.height * 3, strip.width, dimensions.height * 6);
      
      // Frames
      const frameHeight = 150;
      const perforationSpacing = frameHeight + 20;
      const animationOffset = (strip.y * 2.0) % perforationSpacing;
      const beamHitY = beam ? beam.y + (beam.length * Math.sin(beam.angle)) : 0;
      
      let closestFrameY = null;
      let closestDistance = Infinity;
      const framePositions = [];
      
      for (let y = -dimensions.height * 3; y <= dimensions.height * 3; y += perforationSpacing) {
        const frameY = y + animationOffset;
        framePositions.push(frameY);
        const distance = Math.abs(frameY - beamHitY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestFrameY = frameY;
        }
      }
      
      framePositions.forEach(frameY => {
        const isBeamHit = beam && closestFrameY !== null && 
                         Math.abs(frameY - closestFrameY) < 5 && 
                         closestDistance < frameHeight * 0.6;
        
        const finalFrameY = isBeamHit ? beamHitY : frameY;
        
        // Perforations
        p5.fill(0, strip.opacity * 2);
        [-25, -10, 15, 30].forEach(offset => {
          p5.rect(-strip.width/2 + 4, finalFrameY + offset, 8, 10);
          p5.rect(strip.width/2 - 12, finalFrameY + offset, 8, 10);
        });
        
        // Frame
        const frameOpacity = strip.opacity * (isBeamHit ? 1.5 : 0.8);
        const frameBrightness = isBeamHit ? 160 : 90;
        
        if (isBeamHit) {
          p5.fill(255, 255, 220, strip.opacity * 0.3);
          p5.rect(-strip.width/2 + 12, finalFrameY - frameHeight/2 - 4, strip.width - 24, frameHeight + 8);
        }
        
        p5.fill(frameBrightness, frameBrightness, frameBrightness, frameOpacity);
        p5.rect(-strip.width/2 + 16, finalFrameY - frameHeight/2, strip.width - 32, frameHeight);
        
        // Text in frame
        if (isBeamHit) {
          p5.push();
          p5.textAlign(p5.CENTER, p5.CENTER);
          p5.textFont('Georgia, "Times New Roman", serif');
          p5.textSize(Math.min(strip.width * 0.12, frameHeight * 0.18));
          
          // Add black stroke for better contrast
          p5.stroke(0, 0, 0, 255);
          p5.strokeWeight(1);
          p5.fill(0, 0, 0, 255); // Pure black text
          
          p5.text('philosophical', 0, finalFrameY - frameHeight * 0.1);
          p5.text('toys', 0, finalFrameY + frameHeight * 0.1);
          
          p5.noStroke(); // Reset stroke
          p5.pop();
        }
        
        // Frame border
        p5.noFill();
        p5.stroke(isBeamHit ? 120 : 60, isBeamHit ? 120 : 60, isBeamHit ? 120 : 60, 
                  isBeamHit ? strip.opacity * 2 : strip.opacity * 1.2);
        p5.strokeWeight(isBeamHit ? 2 : 1);
        p5.rect(-strip.width/2 + 16, finalFrameY - frameHeight/2, strip.width - 32, frameHeight);
        p5.noStroke();
      });
      
      p5.pop();
    };
    
    const drawProjectorBeam = () => {
      if (!beam || beam.opacity <= 2) return;
      
      p5.push();
      p5.translate(beam.x, beam.y);
      p5.rotate(beam.angle);
      
      // Beam cone
      for (let i = 0; i < 6; i++) {
        const layerProgress = i / 5;
        const alpha = beam.opacity * (1 - layerProgress * 0.7);
        const startWidth = beam.width * 0.3;
        const endWidth = beam.width * (1 + layerProgress * 0.3);
        
        p5.fill(255, 255, 255, alpha);
        p5.noStroke();
        p5.beginShape();
        p5.vertex(0, -startWidth/2);
        p5.vertex(beam.length, -endWidth/2);
        p5.vertex(beam.length, endWidth/2);
        p5.vertex(0, startWidth/2);
        p5.endShape(p5.CLOSE);
      }
      
      // Projector source
      p5.fill(255, 255, 255, beam.opacity * 1.5);
      p5.circle(-10, 0, 8);
      
      // Dust particles
      beam.dustParticles.forEach(particle => {
        if (particle.x > 0 && particle.x < beam.length) {
          const distanceProgress = particle.x / beam.length;
          const particleScale = 0.8 + (distanceProgress * 0.4);
          
          p5.fill(240, 240, 240, particle.opacity * filmFlicker * (1 - distanceProgress * 0.3));
          p5.circle(particle.x, particle.y, particle.size * particleScale);
        }
      });
      
      p5.pop();
    };
    
    p5.draw = () => {
      if (isDestroyed || pausedRef.current) {
        isDestroyed = true;
        if (canvas) canvas.remove();
        return;
      }
      
      frameCount++;
      phaseTimer++;
      
      try {
        p5.background(0);
        p5.translate(dimensions.width/2, dimensions.height/2);
        
        // Phase management - reduced timings by 3 seconds total
        if (phase === 'projection' && phaseTimer > 120) { // Reduced from 180 to 120 (-1 sec)
          const allFormed = elements.every(el => el.formationProgress > 0.9);
          if (allFormed) {
            phase = 'display';
            phaseTimer = 0;
          }
        } else if (phase === 'display' && phaseTimer > 180) { // Reduced from 300 to 180 (-2 sec)
          phase = 'fadeout';
          phaseTimer = 0;
        } else if (phase === 'fadeout' && phaseTimer > 120) {
          const allFaded = elements.every(el => el.opacity < 5);
          if (allFaded && !isComplete) {
            isComplete = true;
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }
        }
        
        updateElements();
        
        // Render
        drawFilmStrip();
        drawProjectorBeam();
        
        // Film grain
        for (let i = 0; i < 5; i++) {
          p5.fill(255, 255, 255, p5.random(2, 8) * filmFlicker);
          p5.noStroke();
          p5.circle(p5.random(0, dimensions.width), p5.random(0, dimensions.height), p5.random(0.5, 1));
        }
        
      } catch (error) {
        console.error('Draw error:', error);
        setError(error instanceof Error ? error : new Error('Draw failed'));
      }
    };
    
    return () => {
      isDestroyed = true;
      if (canvas) canvas.remove();
    };
  }, [onAnimationComplete, dimensions, text, style]);

  if (error) {
    return (
      <div style={{
        color: '#ff6b6b',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#000',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontFamily: 'monospace'
      }}>
        ERROR: {error.message}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      overflow: 'hidden',
      zIndex: 1000
    }}>
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );
}

export default ModernTitleSketch;