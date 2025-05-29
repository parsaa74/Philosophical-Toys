import React, { useCallback, useState, useEffect, useRef } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import GrainBackgroundSketch from './GrainBackgroundSketch';

interface FilmLeaderSketchProps {
  onAnimationComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fontStyle?: 'intertitle' | 'classic' | 'ornate';
  paused?: boolean;
}

export function FilmLeaderSketch({ 
  onAnimationComplete,
  size = 'medium',
  text = 'philosophical toys',
  fontStyle = 'intertitle',
  paused = false
}: FilmLeaderSketchProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isFilmLeaderComplete, setIsFilmLeaderComplete] = useState(false);
  const [showGrainBackground, setShowGrainBackground] = useState(false);
  const [displayText, setDisplayText] = useState(false);
  const [isBackgroundExpanded, setIsBackgroundExpanded] = useState(false);
  
  const sizeMap = {
    small: { width: 300, height: 300 },
    medium: { width: 400, height: 400 },
    large: { width: 600, height: 600 }
  };

  const dimensions = sizeMap[size];

  // Track paused state in a ref for use in sketches
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // Set up the transition sequence after film leader completes
  useEffect(() => {
    if (isFilmLeaderComplete) {
      // Show grain background immediately
      setShowGrainBackground(true);
      
      // Show text after a small delay (only once)
      const textTimer = setTimeout(() => {
        setDisplayText(true);
      }, 300);
      
      return () => clearTimeout(textTimer);
    }
  }, [isFilmLeaderComplete]);

  // Handle background expansion separately (will be triggered by text animation)
  useEffect(() => {
    if (isBackgroundExpanded && onAnimationComplete) {
      const completeTimer = setTimeout(() => {
        onAnimationComplete();
      }, 800);
      return () => clearTimeout(completeTimer);
    }
  }, [isBackgroundExpanded, onAnimationComplete]);

  // --- Add paused effect to destroy all activity when paused ---
  useEffect(() => {
    if (!paused) return;
    // If paused, set isDestroyed for all sketches and clear timeouts
    setIsFilmLeaderComplete(true); // Hide main sketch
    setDisplayText(false); // Hide text animation
    setShowGrainBackground(false); // Hide grain background
    setIsBackgroundExpanded(false);
    // No need to call onAnimationComplete, just stop everything
  }, [paused]);

  const sketch = useCallback((p5: p5Types) => {
    let font: p5Types.Font | null = null;
    let stage = -1;
    let counter = 3;
    let base = 40;
    let flicker = 130;
    let angle = -p5.HALF_PI;
    let shift = 25;
    let fw = 0, fh = 0;
    let drift = 0;
    let audioshift = 0;
    let hasCompleted = false;
    const timeoutIds: number[] = [];
    let isDestroyed = false;

    const schedule = (callback: () => void, delay: number) => {
      if (isDestroyed || pausedRef.current) return;
      const id = window.setTimeout(callback, delay);
      timeoutIds.push(id);
    };

    const startProjector = () => {
      // Projector started
    };
    const startFilm = () => {
      stage = 0;
    };
    const startSound = () => {
      stage = 1;
    };
    const hideSound = () => {
      stage = 1.5;
    };
    const startPicture = () => {
      stage = 2;
    };
    const hidePicture = () => {
      stage = 2.5;
    };
    const startLeader = () => {
      stage = 3;
    };
    const endFilm = () => {
      stage = 5;
    };

    const startEverything = () => {
      p5.rectMode(p5.CENTER);
      p5.textAlign(p5.CENTER, p5.CENTER);
      schedule(startProjector, 100);
      schedule(startFilm, 200);
      schedule(startSound, 300);
      schedule(hideSound, 400);
      schedule(startPicture, 500);
      schedule(hidePicture, 600);
      schedule(startLeader, 700);
      p5.frameRate(48);
    };

    p5.preload = () => {
      try {
        font = p5.loadFont('/fonts/architect.ttf');
      } catch (error) {
        console.error('Font load error:', error);
        setError(new Error('Failed to load font'));
      }
    };

    p5.setup = () => {
      if (pausedRef.current) return;
      try {
        p5.createCanvas(dimensions.width, dimensions.height);
        fh = dimensions.height * 0.66;
        fw = 1.375 * fh;
        audioshift = fw / 20;
        startEverything();
      } catch (error) {
        console.error('Setup error:', error);
        setError(error instanceof Error ? error : new Error('Setup failed'));
      }
    };

    p5.draw = () => {
      if (isDestroyed || pausedRef.current) {
        isDestroyed = true;
        timeoutIds.forEach(window.clearTimeout);
        timeoutIds.length = 0;
        if (p5) p5.remove();
        return;
      }

      try {
        if (p5.frameCount % 3 === 0 && stage > 0) {
          flicker = p5.random(50, 150);
        }
        
        if (stage < 6) {
          drift = (fh / 20) * (0.5 - p5.noise(p5.frameCount / 100));
          p5.translate(p5.width / 2, drift + p5.height / 2 + p5.random(-fh / 200, fh / 200));
          if (p5.floor(p5.random(72)) === 0) p5.translate(0, -p5.height / 4);
          p5.background(flicker / 5);
          
          for (let i = 0; i < 4; i++) {
            p5.fill(p5.random(0, 150));
            p5.noStroke();
            p5.push();
            p5.translate(p5.random(-fw / 2, fw / 2), p5.random(-fh / 4, fh / 4));
            p5.rotate(p5.random(p5.TWO_PI));
            p5.ellipse(0, 0, p5.random(fw / 40), p5.random(fh / 60));
            p5.pop();
          }
        } else {
          p5.background(0);
          if (stage >= 6 && !hasCompleted) {
            setIsFilmLeaderComplete(true);
            hasCompleted = true;
          }
        }

        switch (stage) {
          case 0:
            p5.push();
            p5.strokeWeight(2);
            p5.fill(0, 70);
            p5.noStroke();
            p5.rect(0, 0, 1.59 * fw, p5.height);
            p5.translate(audioshift, 0);
            p5.fill(base, flicker);
            p5.rect(0, 0, fw, fh, fh / 16);
            p5.pop();
            break;

          case 1:
            p5.push();
            base = 55;
            p5.strokeWeight(2);
            p5.fill(0, 70);
            p5.noStroke();
            p5.rect(0, 0, 1.59 * fw, p5.height);
            p5.translate(audioshift, 0);
            p5.fill(base, flicker);
            p5.rect(0, 0, fw, fh, fh / 16);
            p5.stroke(200, p5.random(50, 240));
            p5.strokeWeight(fh / 60);
            p5.line(-fw / 2, 0, -7 * fw / 16, 0);
            p5.line(-5 * fw / 16, 0, -3 * fw / 16, 0);
            p5.line(3 * fw / 16, 0, fw / 2, 0);
            p5.noFill();
            p5.ellipse(-6 * fw / 16, 0, fw / 8, fw / 8);
            p5.strokeWeight(fh / 80);
            p5.ellipse(0, 0, 0.6 * fh, 0.6 * fh);
            p5.ellipse(0, 0, 0.5 * fh, 0.5 * fh);
            p5.noStroke();
            p5.fill(255, flicker);
            p5.push();
            p5.rotate(p5.HALF_PI);
            p5.textSize(fh / 10);
            if (font) p5.textFont(font);
            p5.text('SOUND', 0, -fh / 20);
            p5.text('START', 0, fh / 10);
            p5.pop();
            p5.pop();
            break;

          case 1.5:
            p5.push();
            base = 55;
            p5.strokeWeight(2);
            p5.fill(0, 70);
            p5.noStroke();
            p5.rect(0, 0, 1.59 * fw, p5.height);
            p5.translate(audioshift, 0);
            p5.fill(base, flicker);
            p5.rect(0, 0, fw, fh, fh / 16);
            p5.pop();
            break;

          case 2:
            p5.push();
            base = 255;
            p5.strokeWeight(2);
            p5.fill(0, 70);
            p5.noStroke();
            p5.rect(0, 0, 1.59 * fw, p5.height);
            p5.fill(base, flicker);
            p5.rect(0, 0, fw, fh, fh / 16);
            p5.fill(0, p5.random(50, 200));
            p5.noStroke();
            if (font) p5.textFont(font);
            p5.textSize(fh / 4);
            p5.text('PICTURE', 0, -fh / 5);
            p5.textSize(fh / 2.7);
            p5.text('START', 0, fh / 5);
            p5.pop();
            break;

          case 2.5:
            p5.push();
            base = 255;
            p5.strokeWeight(2);
            p5.fill(0, 70);
            p5.noStroke();
            p5.rect(0, 0, 1.59 * fw, p5.height);
            p5.fill(base, flicker);
            p5.rect(0, 0, fw, fh, fh / 16);
            p5.pop();
            break;

          case 3:
            p5.push();
            base = 255;
            p5.fill(0, 70);
            p5.noStroke();
            p5.rect(0, 0, 1.59 * fw, p5.height);
            p5.fill(base, flicker - shift);
            p5.rect(0, 0, fw, fh, fh / 16);
            angle += p5.TWO_PI / p5.frameRate();
            if (angle > 3 * p5.HALF_PI) {
              angle = -p5.HALF_PI;
              shift = p5.random(40);
              counter -= 1;
              if (counter < 2) {
                counter = 2;
                stage = 4;
                schedule(endFilm, 1000);
              }
            }

            p5.fill(0, p5.random(30, 90));
            p5.arc(0, 0, fw, fh, -p5.HALF_PI, angle);
            p5.stroke(40, p5.random(50, 200));
            p5.strokeWeight(fh / 150);
            p5.line(-fw / 2, 0, fw / 2, 0);
            p5.line(0, -fh / 2, 0, fh / 2);
            p5.noFill();
            p5.stroke(255, p5.random(50, 200));
            p5.strokeWeight(fh / 60);
            p5.ellipse(0, 0, 0.8 * fh, 0.8 * fh);
            p5.ellipse(0, 0, 0.9 * fh, 0.9 * fh);
            p5.fill(0, p5.random(100, 200));
            p5.noStroke();
            if (font) p5.textFont(font);
            p5.textSize(fh * 0.9);
            p5.text(counter.toString(), 0, fh * 0.075);

            if (counter === 7 && angle < 0) {
              p5.noStroke();
              p5.fill(200, p5.random(50, 140));
              p5.textSize(fh / 4);
              p5.text('M', -fw / 2.5, -fh / 3);
              p5.text('M', fw / 2.5, -fh / 3);
              p5.text('35', -fw / 2.5, fh / 3);
              p5.text('35', fw / 2.5, fh / 3);
            }

            if (counter === 4 && angle < p5.PI) {
              p5.noStroke();
              p5.fill(200, p5.random(50, 240));
              p5.textSize(fh / 4);
              p5.text('C', -fw / 2.5, -fh / 3);
              p5.text('C', fw / 2.5, -fh / 3);
              p5.text('F', -fw / 2.5, fh / 3);
              p5.text('F', fw / 2.5, fh / 3);
            }

            for (let i = 0; i < 4; i++) {
              p5.fill(p5.random(0, 150));
              p5.noStroke();
              p5.push();
              p5.rotate(p5.random(p5.TWO_PI));
              p5.ellipse(p5.random(-fw / 2, fw / 2), p5.random(-fh / 2, fh / 2), p5.random(fw / 40), p5.random(fh / 60));
              p5.pop();
            }
            p5.pop();
            break;

          case 4:
            p5.push();
            base = 255;
            p5.strokeWeight(2);
            p5.fill(0, 70);
            p5.noStroke();
            p5.rect(0, 0, 1.59 * fw, p5.height);
            p5.fill(base, flicker);
            p5.rect(0, 0, fw, fh, fh / 16);
            p5.pop();
            break;

          case 5:
            p5.push();
            base = 55;
            p5.strokeWeight(2);
            p5.fill(15);
            p5.noStroke();
            p5.rect(0, 0, 1.59 * fw, p5.height);
            p5.fill(base, flicker);
            p5.rect(0, 0, fw, fh, fh / 16);
            if (font) p5.textFont(font);
            p5.textSize(fh / 2);
            p5.push();
            p5.translate(fh / 12, fh);
            p5.fill(255, flicker);
            p5.rotate(p5.HALF_PI);
            p5.text('<- HAPPY NEW YEAR! ->', 0, 0);
            fh -= fh / 6;
            p5.pop();
            p5.fill(15);
            p5.rect(0, -p5.height / 2, fw, p5.height * 0.3);
            p5.rect(0, p5.height / 2, fw, p5.height * 0.3);
            
            if (p5.frameCount % 60 === 0) {
              stage = 6;
            }
            p5.pop();
            break;

          case 6:
            base = 75;
            if (!hasCompleted) {
              setIsFilmLeaderComplete(true);
              hasCompleted = true;
            }
            break;

          case 7:
            break;
        }

        if (stage < 6) {
          for (let y = -p5.height / 2; y <= p5.height / 2; y += p5.height / 5) {
            p5.fill(250, p5.random(100, 150));
            p5.noStroke();
            p5.rect(-p5.width / 2 - p5.width / 7, y, p5.width / 8, fh / 10, fh / 40);
            p5.rect(p5.width / 2 + p5.width / 7, y, p5.width / 8, fh / 10, fh / 40);
          }

          p5.push();
          p5.translate(audioshift, -fh * 1.2);
          p5.fill(base, flicker - shift);
          p5.rect(0, 0, fw, fh, fh / 16);
          p5.pop();
          
          p5.push();
          p5.translate(audioshift, fh * 1.2);
          p5.fill(base, flicker - shift);
          p5.rect(0, 0, fw, fh, fh / 16);
          p5.pop();
          
          p5.push();
          p5.stroke(50, 100);
          p5.strokeWeight(1);
          p5.translate((-p5.width / 2) - p5.width / 60, 0);
          let aw = fw / 20;
          for (let y = -p5.height / 2; y < p5.height / 2; y += 1) {
            aw = (fw / 10) * (0.5 - p5.noise(y / 10 + p5.frameCount * 4));
            p5.line(-aw, y, aw, y);
          }
          p5.pop();
        }
      } catch (error) {
        console.error('Draw error:', error);
        setError(error instanceof Error ? error : new Error('Draw failed'));
      }
    };

    p5.windowResized = () => {
      // No need to resize - we're using fixed dimensions
    };

    return () => {
      console.log('Sketch cleanup');
      isDestroyed = true;
      timeoutIds.forEach(window.clearTimeout);
      timeoutIds.length = 0;
      if (p5) {
        p5.remove();
      }
    };
  }, [onAnimationComplete, dimensions]);

  // TextAnimation sketch based on TextOnlySketch
  const TextAnimation = useCallback((p5: p5Types) => {
    let primaryFont: p5Types.Font | null = null;
    let fallbackFont: p5Types.Font | null = null;
    let letters: Array<{
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
    }> = [];
    let isComplete = false;
    let isDisappearing = false;
    let disappearTimer = 0;
    let settledFrameCount = 0;
    const startDisappearingAt = 120;
    let forceDisappear = false;
    let canvas: p5Types.Renderer;
    let isDestroyed = false;
    let hasSignaledCompletion = false;
    let isInitialized = false;

    // Font paths based on style
    const fontPaths = {
      intertitle: {
        primary: 'Cormorant Garamond, serif',
        fallback: '/fonts/silent-movie.ttf'
      },
      classic: {
        primary: 'Cormorant Garamond, serif',
        fallback: '/fonts/chapbook.ttf'
      },
      ornate: {
        primary: 'Cormorant Garamond, serif',
        fallback: '/fonts/victorian.ttf'
      }
    };

    // Force disappear after 5 seconds
    setTimeout(() => {
      if (!isDisappearing && !isComplete && !isDestroyed) {
        forceDisappear = true;
      }
    }, 5000);

    p5.preload = () => {
      try {
        // Load primary font based on selected style
        const selectedFonts = fontPaths[fontStyle];
        
        // For web fonts, we don't need to load them
        if (!selectedFonts.primary.includes('/')) {
          console.log(`Using web font: ${selectedFonts.primary}`);
          primaryFont = null; // Will use the font directly
        } else {
          console.log(`Attempting to load primary font: ${selectedFonts.primary}`);
          try {
            primaryFont = p5.loadFont(selectedFonts.primary);
          } catch (primaryError) {
            console.warn(`Failed to load primary font: ${selectedFonts.primary}`, primaryError);
            primaryFont = null;
          }
        }
        
        // Try fallback if primary is a file and fails
        if (!primaryFont && selectedFonts.primary.includes('/')) {
          console.log(`Attempting to load fallback font: ${selectedFonts.fallback}`);
          try {
            fallbackFont = p5.loadFont(selectedFonts.fallback);
          } catch (fallbackError) {
            console.warn(`Failed to load fallback font: ${selectedFonts.fallback}`, fallbackError);
            fallbackFont = null;
          }
        }
      } catch (error) {
        console.error('Font load error:', error);
      }
    };

    p5.setup = () => {
      if (pausedRef.current) return;
      if (isInitialized) return; // Prevent multiple initialization
      isInitialized = true;
      
      try {
        canvas = p5.createCanvas(dimensions.width, dimensions.height, p5.P2D);
        p5.frameRate(48);
        p5.textAlign(p5.CENTER, p5.CENTER);

        // Set font if available
        const selectedFonts = fontPaths[fontStyle];
        if (!selectedFonts.primary.includes('/')) {
          p5.textFont(selectedFonts.primary); // Web font directly
        } else if (primaryFont) {
          p5.textFont(primaryFont);
        } else if (fallbackFont) {
          p5.textFont(fallbackFont);
        } else {
          p5.textFont('Georgia, serif'); // System font fallback
        }

        // Split text into parts
        const words = text.split(' ');
        const philosophical = words[0].split('');
        const toys = words.length > 1 ? words[1].split('') : [];

        const totalChars = philosophical.length + toys.length + (toys.length > 0 ? 1 : 0);
        
        // Calculate appropriate spacing based on filmLeaderSketch dimensions
        // Use slightly narrower spacing to fit text properly
        const spacing = (dimensions.width * 0.7) / (totalChars + 1);
        const baseY = dimensions.height / 2;
        
        // Adjust sizes based on font style and FilmLeaderSketch dimensions
        // Ensure text remains proportional to the container
        const baseSize = Math.min(dimensions.width, dimensions.height) / 8;
        let philosophicalSize, toysSize;
        
        if (fontStyle === 'intertitle') {
          philosophicalSize = baseSize * 0.8;
          toysSize = baseSize * 0.9;
        } else if (fontStyle === 'ornate') {
          philosophicalSize = baseSize * 0.7;
          toysSize = baseSize * 0.8;
        } else { // classic
          philosophicalSize = baseSize * 0.9;
          toysSize = baseSize;
        }

        const philosophicalWidth = philosophical.length * spacing;
        const toysWidth = toys.length * spacing;
        const spaceWidth = toys.length > 0 ? spacing * 0.8 : 0;
        const totalWidth = philosophicalWidth + spaceWidth + toysWidth;
        const startX = (dimensions.width - totalWidth) / 2;

        let currentX = startX;
        letters = philosophical.map((char, i) => ({
          char,
          x: p5.random(0, dimensions.width),
          y: p5.random(0, dimensions.height),
          targetX: currentX + (i * spacing),
          targetY: baseY - baseSize/4, // Slightly above center
          opacity: 0,
          targetOpacity: 255,
          rotation: p5.random(-p5.PI/4, p5.PI/4),
          targetRotation: p5.random(-0.02, 0.02), // Less rotation
          size: philosophicalSize * p5.random(0.5, 1.5),
          targetSize: philosophicalSize,
          spinAngle: p5.random(p5.TWO_PI),
          spinSpeed: p5.random(0.01, 0.02),
          isPhilosophical: true,
          disappearAngle: p5.random(p5.TWO_PI),
          disappearRadius: 0,
          disappearSpeed: p5.random(0.02, 0.04)
        }));

        if (toys.length > 0) {
          currentX += philosophicalWidth + spaceWidth;

          const toysLetters = toys.map((char, i) => ({
            char,
            x: p5.random(0, dimensions.width),
            y: p5.random(0, dimensions.height),
            targetX: currentX + (i * spacing),
            targetY: baseY + baseSize/8, // Slightly below center
            opacity: 0,
            targetOpacity: 255,
            rotation: p5.random(-p5.PI/4, p5.PI/4),
            targetRotation: 0,
            size: toysSize * p5.random(0.5, 1.5),
            targetSize: toysSize,
            spinAngle: p5.random(p5.TWO_PI),
            spinSpeed: p5.random(0.01, 0.02),
            isPhilosophical: false,
            disappearAngle: p5.random(p5.TWO_PI),
            disappearRadius: 0,
            disappearSpeed: p5.random(0.02, 0.04)
          }));

          letters = [...letters, ...toysLetters];
        }
      } catch (error) {
        console.error('Text setup error:', error);
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
      if (isComplete || isDestroyed || pausedRef.current) {
        isDestroyed = true;
        if (canvas) canvas.remove();
        letters = [];
        return;
      }

      try {
        p5.clear(0, 0, 0, 0);

        // Set the font for rendering
        const selectedFonts = fontPaths[fontStyle];
        if (!selectedFonts.primary.includes('/')) {
          p5.textFont(selectedFonts.primary);
        } else if (primaryFont) {
          p5.textFont(primaryFont);
        } else if (fallbackFont) {
          p5.textFont(fallbackFont);
        } else {
          p5.textFont('Georgia, serif');
        }

        if (!isDisappearing && !isComplete) {
          let allSettled = true;
          letters.forEach(letter => {
            const tolerance = 3; // Lower tolerance for more precise positioning
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
        // Reduce jitter for more stability
        const globalJitterX = p5.random(-0.3, 0.3);
        const globalJitterY = p5.random(-0.3, 0.3);

        // Draw letters in order so they layer correctly
        letters.forEach(letter => {
          if (!isDisappearing) {
            // Use slower lerp for smoother animation (0.07 instead of 0.1)
            letter.x = p5.lerp(letter.x, letter.targetX, 0.07);
            letter.y = p5.lerp(letter.y, letter.targetY, 0.07);
            letter.opacity = p5.lerp(letter.opacity, letter.targetOpacity, 0.07);
            letter.rotation = p5.lerp(letter.rotation, letter.targetRotation, 0.05);
            letter.size = p5.lerp(letter.size, letter.targetSize, 0.07);
          } else {
            // Disappearing animation (slower movement)
            letter.disappearRadius += letter.disappearSpeed * 7;
            letter.x = letter.targetX + Math.cos(letter.disappearAngle) * letter.disappearRadius;
            letter.y = letter.targetY + Math.sin(letter.disappearAngle) * letter.disappearRadius;
            letter.opacity = p5.lerp(letter.opacity, letter.targetOpacity, 0.07);
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

          // Signal completion either when all letters have disappeared
          // or after a timeout to ensure the animation doesn't hang
          if (allDisappeared || disappearTimer > 60) {
            isComplete = true;
            setDisplayText(false);
            
            // Signal for background expansion
            if (!hasSignaledCompletion) {
              hasSignaledCompletion = true;
              setIsBackgroundExpanded(true);
            }
          }
        }
      } catch (error) {
        console.error('Text draw error:', error);
      }
    };

    return () => {
      isDestroyed = true;
      if (canvas) {
        canvas.remove();
      }
      letters = [];
    };
  }, [dimensions, text, fontStyle]);

  if (error) {
    return (
      <div style={{ 
        color: 'red',
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#000',
        width: dimensions.width,
        height: dimensions.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px'
      }}>
        Error: {error.message}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: dimensions.width,
      height: dimensions.height,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#000',
      borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Film Leader Sketch */}
      {!isFilmLeaderComplete && (
        <NextReactP5Wrapper sketch={sketch} />
      )}

      {/* Grain Background after Film Leader completes */}
      {showGrainBackground && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0
        }}>
          <GrainBackgroundSketch
            size={size}
            isExpanded={true}
            enableSound={false}
          />
        </div>
      )}

      {/* Text Animation Overlay */}
      {displayText && (
        <div
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <NextReactP5Wrapper sketch={TextAnimation} />
        </div>
      )}
    </div>
  );
}

export default FilmLeaderSketch; 