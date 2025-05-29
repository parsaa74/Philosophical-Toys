"use client";
import React, { useCallback, useState, useEffect, useRef } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";

interface FlipbookSketchProps {
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
  className?: string;
}

export function FlipbookSketch({
  size = 'medium',
  onClose,
  className = ''
}: FlipbookSketchProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 500, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Map sizes to responsive multipliers instead of fixed dimensions
  const sizeMultipliers = {
    small: 0.7,
    medium: 1.0,
    large: 1.4
  };

  const baseWidth = 400;
  const baseHeight = 500;
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
      
      // Maintain aspect ratio based on original proportions
      const aspectRatio = baseWidth / baseHeight;
      let finalWidth = targetWidth;
      let finalHeight = targetHeight;
      
      if (finalWidth / finalHeight > aspectRatio) {
        finalWidth = finalHeight * aspectRatio;
      } else {
        finalHeight = finalWidth / aspectRatio;
      }
      
      setDimensions({ 
        width: Math.max(300, finalWidth), 
        height: Math.max(375, finalHeight) 
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
    const pageCount = 20;
    const animationFrames: p5Types.Graphics[] = [];
    let flipSpeed = 0;
    const maxFlipSpeed = 0.8;
    let pageFlipProgress = 0;
    let targetPage = 0;

    p5.setup = () => {
      const canvas = p5.createCanvas(dimensions.width, dimensions.height);
      canvas.parent('flipbook-container');
      createAnimationFrames();
    };

    p5.windowResized = () => {
      p5.resizeCanvas(dimensions.width, dimensions.height);
      createAnimationFrames(); // Recreate frames with new dimensions
    };

    function createAnimationFrames() {
      // Create a simple bouncing ball animation
      const pageWidth = dimensions.width * 0.7;
      const pageHeight = dimensions.height * 0.8;
      
      for (let i = 0; i < pageCount; i++) {
        const frame = p5.createGraphics(pageWidth, pageHeight);
        frame.background(248, 245, 240); // Off-white paper
        
        // Add page number
        frame.fill(100);
        frame.textAlign(p5.CENTER);
        frame.textSize(12);
        frame.text(`${i + 1}`, pageWidth - 20, 20);
        
        // Draw page edge lines
        frame.stroke(220, 220, 220);
        frame.strokeWeight(1);
        frame.line(0, 0, 0, pageHeight);
        frame.line(pageWidth - 1, 0, pageWidth - 1, pageHeight);
        frame.line(0, pageHeight - 1, pageWidth, pageHeight - 1);
        
        const progress = i / (pageCount - 1);
        
        // Bouncing ball animation
        const ballX = 50 + progress * (pageWidth - 100);
        const ballY = pageHeight/2 + Math.sin(progress * p5.PI * 4) * 100;
        
        // Draw ball trail
        frame.noFill();
        frame.stroke(200, 100, 100, 100);
        frame.strokeWeight(2);
        frame.beginShape();
        for (let j = 0; j <= progress; j += 0.05) {
          const trailX = 50 + j * (pageWidth - 100);
          const trailY = pageHeight/2 + Math.sin(j * p5.PI * 4) * 100;
          frame.vertex(trailX, trailY);
        }
        frame.endShape();
        
        // Draw the ball
        frame.fill(200, 80, 80);
        frame.noStroke();
        frame.circle(ballX, ballY, 20);
        
        // Add motion blur for faster movement
        if (i > 0) {
          const prevProgress = (i - 1) / (pageCount - 1);
          const prevBallX = 50 + prevProgress * (pageWidth - 100);
          const prevBallY = pageHeight/2 + Math.sin(prevProgress * p5.PI * 4) * 100;
          
          frame.fill(200, 80, 80, 100);
          frame.circle(prevBallX, prevBallY, 15);
        }
        
        // Draw ground line
        frame.stroke(150);
        frame.strokeWeight(2);
        frame.line(30, pageHeight/2 + 120, pageWidth - 30, pageHeight/2 + 120);
        
        // Add some texture lines for paper effect
        frame.stroke(240, 240, 240);
        frame.strokeWeight(0.5);
        for (let y = 30; y < pageHeight - 30; y += 25) {
          frame.line(30, y, pageWidth - 30, y);
        }
        
        animationFrames[i] = frame;
      }
    }

    function drawFlipbook() {
      p5.push();
      p5.translate(dimensions.width/2, dimensions.height/2);
      
      // Draw book spine (left side)
      p5.fill(120, 100, 80);
      p5.noStroke();
      p5.rect(-dimensions.width * 0.38, -dimensions.height * 0.42, 15, dimensions.height * 0.84);
      
      // Draw all pages (stack effect)
      const pageWidth = dimensions.width * 0.7;
      const pageHeight = dimensions.height * 0.8;
      
      // Draw back pages (unopened)
      for (let i = currentPage + 1; i < pageCount; i++) {
        const offset = (i - currentPage) * 0.5;
        p5.push();
        p5.translate(offset, -offset);
        p5.fill(255);
        p5.stroke(200);
        p5.strokeWeight(1);
        p5.rect(-pageWidth/2, -pageHeight/2, pageWidth, pageHeight, 2);
        p5.pop();
      }
      
      // Draw current page
      if (animationFrames[currentPage]) {
        p5.push();
        
        // Apply page flip transformation if flipping
        if (isFlipping && pageFlipProgress > 0) {
          p5.translate(pageWidth/2 * (1 - pageFlipProgress), 0);
          p5.scale(1 - pageFlipProgress, 1);
          p5.rotateY(pageFlipProgress * p5.PI);
        }
        
        p5.fill(255);
        p5.stroke(200);
        p5.strokeWeight(1);
        p5.rect(-pageWidth/2, -pageHeight/2, pageWidth, pageHeight, 2);
        
        // Draw the animation frame
        p5.image(animationFrames[currentPage], -pageWidth/2, -pageHeight/2);
        p5.pop();
      }
      
      // Draw flipped pages (already viewed)
      for (let i = 0; i < currentPage; i++) {
        const offset = (currentPage - i) * 0.3;
        p5.push();
        p5.translate(-pageWidth/2 - offset, -offset);
        p5.fill(250);
        p5.stroke(180);
        p5.strokeWeight(1);
        p5.rect(0, -pageHeight/2, pageWidth, pageHeight, 2);
        p5.pop();
      }
      
      p5.pop();
    }

    p5.draw = () => {
      p5.background(60, 55, 50);
      
      // Update flip animation
      if (isFlipping) {
        pageFlipProgress += flipSpeed;
        if (pageFlipProgress >= 1) {
          pageFlipProgress = 0;
          setCurrentPage(targetPage);
          setIsFlipping(false);
        }
      }
      
      drawFlipbook();
      
      // Draw instructions
      if (showInstructions) {
        p5.fill(255, 255, 255, 200);
        p5.noStroke();
        p5.textAlign(p5.CENTER);
        p5.textSize(16);
        p5.text("Click to flip pages", dimensions.width/2, dimensions.height - 60);
        p5.textSize(12);
        p5.text("Watch the ball bounce as you flip!", dimensions.width/2, dimensions.height - 40);
      }
      
      // Draw page counter
      p5.fill(255, 255, 255, 180);
      p5.textAlign(p5.CENTER);
      p5.textSize(14);
      p5.text(`Page ${currentPage + 1} of ${pageCount}`, dimensions.width/2, 30);
    };

    p5.mousePressed = () => {
      if (!isFlipping) {
        if (p5.mouseX > dimensions.width/2) {
          // Click on right side - go to next page
          if (currentPage < pageCount - 1) {
            setIsFlipping(true);
            targetPage = currentPage + 1;
            flipSpeed = maxFlipSpeed;
            pageFlipProgress = 0;
            setShowInstructions(false);
          }
        } else {
          // Click on left side - go to previous page
          if (currentPage > 0) {
            setIsFlipping(true);
            targetPage = currentPage - 1;
            flipSpeed = maxFlipSpeed;
            pageFlipProgress = 0;
            setShowInstructions(false);
          }
        }
      }
      return false;
    };

    p5.touchStarted = () => {
      if (!isFlipping) {
        if (p5.mouseX > dimensions.width/2) {
          if (currentPage < pageCount - 1) {
            setIsFlipping(true);
            targetPage = currentPage + 1;
            flipSpeed = maxFlipSpeed;
            pageFlipProgress = 0;
            setShowInstructions(false);
          }
        } else {
          if (currentPage > 0) {
            setIsFlipping(true);
            targetPage = currentPage - 1;
            flipSpeed = maxFlipSpeed;
            pageFlipProgress = 0;
            setShowInstructions(false);
          }
        }
      }
      return false;
    };

    p5.keyPressed = () => {
      if (p5.key === ' ' || p5.keyCode === p5.RIGHT_ARROW) {
        // Space or right arrow - next page
        if (!isFlipping && currentPage < pageCount - 1) {
          setIsFlipping(true);
          targetPage = currentPage + 1;
          flipSpeed = maxFlipSpeed;
          pageFlipProgress = 0;
          setShowInstructions(false);
        }
      } else if (p5.keyCode === p5.LEFT_ARROW) {
        // Left arrow - previous page
        if (!isFlipping && currentPage > 0) {
          setIsFlipping(true);
          targetPage = currentPage - 1;
          flipSpeed = maxFlipSpeed;
          pageFlipProgress = 0;
          setShowInstructions(false);
        }
      }
    };
  }, [dimensions, isFlipping, currentPage, showInstructions]);

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
      
      <div id="flipbook-container" style={{ 
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
        <p><em>John Barnes Linnett&apos;s Kineograph (1868)</em></p>
        <p>The first flip book - democratizing animation for everyone</p>
      </div>
    </div>
  );
}

export default FlipbookSketch; 