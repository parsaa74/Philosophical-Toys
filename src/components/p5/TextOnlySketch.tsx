import React, { useCallback, useState, useRef, useEffect } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";

interface TextOnlySketchProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  onAnimationComplete?: () => void;
  fontStyle?: 'intertitle' | 'classic' | 'ornate';
}

export function TextOnlySketch({
  size = 'medium',
  text = 'philosophical toys',
  onAnimationComplete,
  fontStyle = 'intertitle'
}: TextOnlySketchProps) {
  const [error, setError] = useState<Error | null>(null);
  const isCompletedRef = useRef(false);

  const sizeMap = {
    small: { width: 300, height: 100 },
    medium: { width: 600, height: 200 },
    large: { width: 900, height: 300 }
  };

  const dimensions = sizeMap[size];

  const sketch = useCallback((p5: p5Types) => {
    let primaryFont: p5Types.Font | null = null;
    let fallbackFont: p5Types.Font | null = null;
    let letters: Letter[] = [];
    let isComplete = false;
    let isDisappearing = false;
    let disappearTimer = 0;
    let settledFrameCount = 0;
    const startDisappearingAt = 120;
    let forceDisappear = false;
    let canvas: p5Types.Renderer;
    let isDestroyed = false;

    // Font paths based on style
    const fontPaths = {
      intertitle: {
        primary: 'Cormorant Garamond, serif',  // Using web font
        fallback: '/fonts/silent-movie.ttf'     // Fallback to existing font
      },
      classic: {
        primary: 'Cormorant Garamond, serif',   // Using web font
        fallback: '/fonts/chapbook.ttf'         // Existing fallback
      },
      ornate: {
        primary: 'Cormorant Garamond, serif',   // Using web font
        fallback: '/fonts/victorian.ttf'        // Existing fallback
      }
    };

    interface Letter {
      char: string;
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      opacity: number;
      targetOpacity: number;
      rotation: number;
      targetRotation: number;
      size: number;
      targetSize: number;
      spinAngle: number;
      spinSpeed: number;
      isPhilosophical: boolean;
      disappearAngle: number;
      disappearRadius: number;
      disappearSpeed: number;
    }

    // Force disappear after 5 seconds regardless of settling
    setTimeout(() => {
      if (!isDisappearing && !isComplete && !isDestroyed) {
        forceDisappear = true;
      }
    }, 5000);

    p5.preload = () => {
      try {
        // Load primary font based on selected style
        const selectedFonts = fontPaths[fontStyle];
        
        // For web fonts like Cormorant Garamond, we don't need to load them
        if (!selectedFonts.primary.includes('/')) {
          console.log(`Using web font: ${selectedFonts.primary}`);
          primaryFont = null; // Will use the font directly in p5.textFont()
        } else {
          console.log(`Attempting to load primary font: ${selectedFonts.primary}`);
          try {
            primaryFont = p5.loadFont(selectedFonts.primary);
            console.log(`Successfully loaded primary font: ${selectedFonts.primary}`);
          } catch (primaryError) {
            console.warn(`Failed to load primary font: ${selectedFonts.primary}`, primaryError);
            primaryFont = null;
          }
        }
        
        // Only try fallback if primary is a file and fails
        if (!primaryFont && selectedFonts.primary.includes('/')) {
          console.log(`Attempting to load fallback font: ${selectedFonts.fallback}`);
          try {
            fallbackFont = p5.loadFont(selectedFonts.fallback);
            console.log(`Successfully loaded fallback font: ${selectedFonts.fallback}`);
          } catch (fallbackError) {
            console.warn(`Failed to load fallback font: ${selectedFonts.fallback}`, fallbackError);
            fallbackFont = null;
          }
        }
        
        // If both fonts failed, try system font as last resort
        if (!primaryFont && !fallbackFont) {
          console.warn('Using web font or system default font');
        }
      } catch (error) {
        console.error('Font load error:', error);
        // Don't set error yet, as we can still render with system font
      }
    };

    p5.setup = () => {
      if (isCompletedRef.current) {
        return;
      }

      try {
        canvas = p5.createCanvas(dimensions.width, dimensions.height, p5.P2D);
        canvas.style('display', 'block');
        canvas.style('position', 'absolute');
        p5.frameRate(48);
        p5.textAlign(p5.CENTER, p5.CENTER);

        // Set font if available
        const selectedFonts = fontPaths[fontStyle];
        if (!selectedFonts.primary.includes('/')) {
          p5.textFont(selectedFonts.primary); // Use web font directly
        } else if (primaryFont) {
          p5.textFont(primaryFont);
        } else if (fallbackFont) {
          p5.textFont(fallbackFont);
        } else {
          // Fall back to system fonts if needed
          p5.textFont('Georgia, serif');
        }

        // Split text into two parts
        const words = text.split(' ');
        const philosophical = words[0].split('');
        const toys = words.length > 1 ? words[1].split('') : [];

        const totalChars = philosophical.length + toys.length + (toys.length > 0 ? 1 : 0);
        const spacing = dimensions.width / (totalChars + 2);
        const baseY = dimensions.height / 2;
        
        // Adjust sizes based on font style
        let philosophicalSize, toysSize;
        
        if (fontStyle === 'intertitle') {
          philosophicalSize = dimensions.height / 2.8;  // Slightly larger for Cormorant
          toysSize = dimensions.height / 2.4;          // Slightly larger for Cormorant
        } else if (fontStyle === 'ornate') {
          philosophicalSize = dimensions.height / 3.0;  // Adjusted for Cormorant
          toysSize = dimensions.height / 2.6;          // Adjusted for Cormorant
        } else { // classic
          philosophicalSize = dimensions.height / 2.2;  // Adjusted for Cormorant
          toysSize = dimensions.height / 1.8;          // Adjusted for Cormorant
        }

        const philosophicalWidth = philosophical.length * spacing;
        const toysWidth = toys.length * spacing;
        const spaceWidth = toys.length > 0 ? spacing : 0;
        const totalWidth = philosophicalWidth + spaceWidth + toysWidth;
        const startX = (dimensions.width - totalWidth) / 2;

        let currentX = startX;
        letters = philosophical.map((char, i) => ({
          char,
          x: p5.random(-dimensions.width/2, dimensions.width*1.5),
          y: p5.random(-dimensions.height/2, dimensions.height*1.5),
          targetX: currentX + (i * spacing),
          targetY: baseY + p5.random(-15, 15),
          opacity: 0,
          targetOpacity: 255,
          rotation: p5.random(-p5.PI/2, p5.PI/2),
          targetRotation: p5.random(-0.05, 0.05),
          size: philosophicalSize * p5.random(0.5, 2),
          targetSize: philosophicalSize,
          spinAngle: p5.random(p5.TWO_PI),
          spinSpeed: p5.random(0.01, 0.03),
          isPhilosophical: true,
          disappearAngle: p5.random(p5.TWO_PI),
          disappearRadius: 0,
          disappearSpeed: p5.random(0.02, 0.05)
        }));

        if (toys.length > 0) {
          currentX += philosophicalWidth + spaceWidth;

          const toysLetters = toys.map((char, i) => ({
            char,
            x: p5.random(-dimensions.width/2, dimensions.width*1.5),
            y: p5.random(-dimensions.height/2, dimensions.height*1.5),
            targetX: currentX + (i * spacing * 1.2),
            targetY: baseY + p5.random(-5, 5),
            opacity: 0,
            targetOpacity: 255,
            rotation: p5.random(-p5.PI/2, p5.PI/2),
            targetRotation: 0,
            size: toysSize * p5.random(0.5, 2),
            targetSize: toysSize,
            spinAngle: p5.random(p5.TWO_PI),
            spinSpeed: p5.random(0.02, 0.05),
            isPhilosophical: false,
            disappearAngle: p5.random(p5.TWO_PI),
            disappearRadius: 0,
            disappearSpeed: p5.random(0.02, 0.05)
          }));

          letters = [...letters, ...toysLetters];
        }
      } catch (error) {
        console.error('Setup error:', error);
        setError(error instanceof Error ? error : new Error('Setup failed'));
      }
    };

    const startDisappearingAnimation = () => {
      if (isDisappearing || isComplete) return;
      
      isDisappearing = true;
      disappearTimer = 0;

      letters.forEach(letter => {
        letter.disappearRadius = 0;
        letter.disappearAngle = p5.random(p5.TWO_PI);
        letter.disappearSpeed = p5.random(0.05, 0.1);
        letter.targetOpacity = 0;
      });
    };

    p5.draw = () => {
      if (isCompletedRef.current || isDestroyed) {
        return;
      }

      try {
        p5.clear(0, 0, 0, 0);

        // Set the font for rendering
        const selectedFonts = fontPaths[fontStyle];
        if (!selectedFonts.primary.includes('/')) {
          p5.textFont(selectedFonts.primary); // Use web font directly
        } else if (primaryFont) {
          p5.textFont(primaryFont);
        } else if (fallbackFont) {
          p5.textFont(fallbackFont);
        } else {
          // Fall back to system fonts if needed
          p5.textFont('Georgia, serif');
        }

        if (!isDisappearing && !isComplete) {
          let allSettled = true;
          letters.forEach(letter => {
            const tolerance = 5;
            if (
              Math.abs(letter.x - letter.targetX) > tolerance ||
              Math.abs(letter.y - letter.targetY) > tolerance ||
              Math.abs(letter.opacity - letter.targetOpacity) > tolerance ||
              Math.abs(letter.rotation - letter.targetRotation) > tolerance ||
              Math.abs(letter.size - letter.targetSize) > tolerance
            ) {
              allSettled = false;
              settledFrameCount = 0;
            }
          });

          if (allSettled || forceDisappear) {
            settledFrameCount++;
            if (settledFrameCount >= startDisappearingAt || forceDisappear) {
              startDisappearingAnimation();
            }
          }
        }

        // Add subtle film-like jitter to each letter
        const globalJitterX = p5.random(-0.5, 0.5);
        const globalJitterY = p5.random(-0.5, 0.5);

        letters.forEach(letter => {
          if (!isDisappearing) {
            // Animate to target position
            letter.x = p5.lerp(letter.x, letter.targetX, 0.1);
            letter.y = p5.lerp(letter.y, letter.targetY, 0.1);
            letter.opacity = p5.lerp(letter.opacity, letter.targetOpacity, 0.1);
            letter.rotation = p5.lerp(letter.rotation, letter.targetRotation, 0.1);
            letter.size = p5.lerp(letter.size, letter.targetSize, 0.1);
          } else {
            // Disappearing animation
            letter.disappearRadius += letter.disappearSpeed * 10;
            letter.x = letter.targetX + Math.cos(letter.disappearAngle) * letter.disappearRadius;
            letter.y = letter.targetY + Math.sin(letter.disappearAngle) * letter.disappearRadius;
            letter.opacity = p5.lerp(letter.opacity, letter.targetOpacity, 0.1);
            letter.rotation += letter.spinSpeed;
          }

          p5.push();
          // Add global jitter for film effect
          p5.translate(letter.x + globalJitterX, letter.y + globalJitterY);
          p5.rotate(letter.rotation);
          
          // Add slight shadow for depth
          if (letter.opacity > 50) {
            p5.fill(20, letter.opacity * 0.3);
            p5.text(letter.char, 1, 1);
          }
          
          // Main text with slight sepia tint
          p5.fill(255, 250, 240, letter.opacity);
          p5.noStroke();
          p5.textSize(letter.size);
          p5.text(letter.char, 0, 0);
          p5.pop();
        });

        // Check if all letters have disappeared
        if (isDisappearing && !isComplete) {
          disappearTimer++;
          let allDisappeared = true;
          letters.forEach(letter => {
            if (letter.opacity > 5) {
              allDisappeared = false;
            }
          });

          if (allDisappeared || disappearTimer > 60) {
            isComplete = true;
            isCompletedRef.current = true;
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }
        }

      } catch (error) {
        console.error('Draw error:', error);
        setError(error instanceof Error ? error : new Error('Draw failed'));
      }
    };

    return () => {
      isDestroyed = true;
      if (canvas) {
        canvas.remove();
      }
      p5.noLoop();
      letters = [];
    };
  }, [onAnimationComplete, dimensions, text, fontStyle]);

  // Add useEffect to ensure onAnimationComplete is called only once
  useEffect(() => {
    return () => {
      if (isCompletedRef.current && onAnimationComplete) {
        onAnimationComplete();
      }
    };
  }, [onAnimationComplete]);

  if (error) {
    return (
      <div style={{
        color: 'red',
        padding: '10px',
        textAlign: 'center',
        backgroundColor: 'transparent',
        width: dimensions.width,
        height: dimensions.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        Error: {error.message}
      </div>
    );
  }

  return (
    <div style={{
      width: dimensions.width,
      height: dimensions.height,
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      overflow: 'hidden',
      backgroundColor: 'transparent'
    }}>
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );
}

export default TextOnlySketch;
