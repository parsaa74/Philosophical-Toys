import React, { useCallback, useState } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";

interface TypographySketchProps {
  onAnimationComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  text?: string;
  startVisible?: boolean;
}

export function TypographySketch({
  onAnimationComplete,
  size = 'medium',
  text = 'philosophical toys',
  startVisible = true
}: TypographySketchProps) {
  const [error, setError] = useState<Error | null>(null);

  const sizeMap = {
    small: { width: 300, height: 100 },
    medium: { width: 600, height: 200 },
    large: { width: 900, height: 300 }
  };

  const dimensions = sizeMap[size];

  const sketch = useCallback((p5: p5Types) => {
    let mainFont: p5Types.Font | null = null;
    let letters: Letter[] = [];
    let isComplete = false;
    let isDisappearing = false;
    let disappearTimer = 0;
    // Removed grainExpansion as it's no longer needed
    let flicker = 130;
    let zoetrope: ZoetropeEffect;
    let phenakistoscope: PhenakistoscopeEffect;
    let noiseOffset = 0;
    let sepia = false;
    const grainParticles: GrainParticle[] = [];
    let settledFrameCount = 0;
    const startDisappearingAt = 120; // Reduced wait time to 2 seconds
    let forceDisappear = false; // Add force disappear flag
    let hasStartedAnimation = false; // Track if we've started the animation

    // If startVisible is false, immediately set isComplete to true
    // to prevent the text from appearing at all
    if (!startVisible) {
      isComplete = true;
    }

    // Force disappear after 5 seconds regardless of settling
    setTimeout(() => {
      if (!isDisappearing && !isComplete && hasStartedAnimation) {
        console.log('Forcing disappear animation');
        forceDisappear = true;
      }
    }, 5000);

    interface Letter {
      char: string;
      x: number; // Current x, used for drift then target
      y: number; // Current y, used for drift then target
      targetX: number;
      targetY: number;
      opacity: number;
      targetOpacity: number;
      rotation: number;
      targetRotation: number;
      size: number;
      targetSize: number;
      spinAngle: number; // For subtle spinning effect when settled
      spinSpeed: number; // For subtle spinning effect when settled
      isPhilosophical: boolean;
      disappearAngle: number;
      disappearRadius: number;
      disappearSpeed: number;

      // New properties for persistence of vision / fragmentation
      initialDriftSpeedX: number; // Speed for initial random drift
      initialDriftSpeedY: number; // Speed for initial random drift
      driftPhaseDuration: number; // How long to drift before coalescing
      framesDrawn: number; // Counter for overall letter lifetime / phases
      trail: { x: number; y: number; opacity: number; size: number; rotation: number }[];
    }

    interface GrainParticle {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      angle: number;
    }

    class ZoetropeEffect {
      slits: number[];
      rotation: number;
      speed: number;

      constructor() {
        this.slits = [];
        for (let i = 0; i < 12; i++) {
          this.slits.push(i * (p5.TWO_PI / 12));
        }
        this.rotation = 0;
        this.speed = 0.1;
      }

      update() {
        this.rotation += this.speed;
      }

      draw() {
        p5.push();
        p5.translate(dimensions.width / 2, dimensions.height / 2);
        p5.rotate(this.rotation);

        // Draw slits
        for (const angle of this.slits) {
          p5.push();
          p5.rotate(angle);
          p5.stroke(255, 50);
          p5.line(0, -dimensions.height/2, 0, dimensions.height/2);
          p5.pop();
        }
        p5.pop();
      }
    }

    class PhenakistoscopeEffect {
      particles: Particle[];
      rotation: number;

      constructor() {
        this.particles = [];
        this.rotation = 0;
        for (let i = 0; i < 20; i++) {
          this.particles.push({
            angle: p5.random(p5.TWO_PI),
            radius: p5.random(50, 100),
            speed: p5.random(0.02, 0.05),
            size: p5.random(2, 5)
          });
        }
      }

      update() {
        this.rotation += 0.01;
        for (const particle of this.particles) {
          particle.angle += particle.speed;
        }
      }

      draw() {
        p5.push();
        p5.translate(dimensions.width / 2, dimensions.height / 2);
        p5.rotate(this.rotation);

        for (const particle of this.particles) {
          const x = p5.cos(particle.angle) * particle.radius;
          const y = p5.sin(particle.angle) * particle.radius;
          p5.fill(255, p5.random(50, 150));
          p5.noStroke();
          p5.ellipse(x, y, particle.size);
        }
        p5.pop();
      }
    }

    interface Particle {
      angle: number;
      radius: number;
      speed: number;
      size: number;
    }

    p5.preload = () => {
      try {
        mainFont = p5.loadFont('/fonts/architect.ttf');
      } catch (error) {
        console.error('Font load error:', error);
        setError(new Error('Failed to load font'));
      }
    };

    p5.setup = () => {
      try {
        p5.createCanvas(dimensions.width, dimensions.height);
        p5.frameRate(48);

        // Initialize grain particles
        for (let i = 0; i < 100; i++) {
          grainParticles.push({
            x: p5.random(dimensions.width),
            y: p5.random(dimensions.height),
            size: p5.random(1, 3),
            opacity: p5.random(50, 150),
            speed: p5.random(0.5, 2),
            angle: p5.random(p5.TWO_PI)
          });
        }

        // Split text into two parts
        const words = text.split(' ');
        const philosophical = words[0].split('');
        const toys = words[1].split('');

        const totalChars = philosophical.length + toys.length + 1; // +1 for space
        const spacing = dimensions.width / (totalChars + 2);
        const baseY = dimensions.height / 2;
        const philosophicalSize = dimensions.height / 2.5;
        const toysSize = dimensions.height / 2;

        // Initialize "philosophical" letters
        let currentX = spacing;
        letters = philosophical.map((char, i) => ({
          char,
          x: p5.random(-dimensions.width/2, dimensions.width*1.5),
          y: p5.random(-dimensions.height/2, dimensions.height*1.5),
          targetX: currentX + (i * spacing),
          targetY: baseY + p5.random(-15, 15),
          opacity: 0, // Start fully transparent
          targetOpacity: 255,
          rotation: p5.random(-p5.PI / 2, p5.PI / 2),
          targetRotation: p5.random(-0.05, 0.05),
          size: philosophicalSize * p5.random(0.2, 0.5), // Start smaller
          targetSize: philosophicalSize,
          spinAngle: p5.random(p5.TWO_PI),
          spinSpeed: p5.random(0.01, 0.03),
          isPhilosophical: true,
          disappearAngle: p5.random(p5.TWO_PI),
          disappearRadius: 0,
          disappearSpeed: p5.random(0.02, 0.05),
          // New properties
          initialDriftSpeedX: p5.random(-0.5, 0.5) * (dimensions.width / 600),
          initialDriftSpeedY: p5.random(-0.5, 0.5) * (dimensions.height / 200),
          driftPhaseDuration: p5.random(70, 130), // Drift for ~1-2 seconds
          framesDrawn: 0,
          trail: [],
        }));

        // Add space
        currentX += philosophical.length * spacing + spacing/2;

        // Add "toys" letters
        const toysLetters = toys.map((char, i) => ({
          char,
          x: p5.random(-dimensions.width/2, dimensions.width*1.5),
          y: p5.random(-dimensions.height/2, dimensions.height*1.5),
          targetX: currentX + (i * spacing * 1.2),
          targetY: baseY + p5.random(-5, 5),
          opacity: 0, // Start fully transparent
          targetOpacity: 255,
          rotation: p5.random(-p5.PI / 2, p5.PI / 2),
          targetRotation: 0,
          size: toysSize * p5.random(0.2, 0.5), // Start smaller
          targetSize: toysSize,
          spinAngle: p5.random(p5.TWO_PI),
          spinSpeed: p5.random(0.02, 0.05),
          isPhilosophical: false,
          disappearAngle: p5.random(p5.TWO_PI),
          disappearRadius: 0,
          disappearSpeed: p5.random(0.02, 0.05),
          // New properties
          initialDriftSpeedX: p5.random(-0.5, 0.5) * (dimensions.width / 600),
          initialDriftSpeedY: p5.random(-0.5, 0.5) * (dimensions.height / 200),
          driftPhaseDuration: p5.random(70, 130), // Drift for ~1-2 seconds
          framesDrawn: 0,
          trail: [],
        }));

        letters = [...letters, ...toysLetters];
        zoetrope = new ZoetropeEffect();
        phenakistoscope = new PhenakistoscopeEffect();

      } catch (error) {
        console.error('Setup error:', error);
        setError(error instanceof Error ? error : new Error('Setup failed'));
      }
    };

    const addGrain = () => {
      p5.loadPixels();
      for (let i = 0; i < p5.pixels.length; i += 4) {
        const grainAmount = p5.random(-20, 20);
        // Add sepia toning
        if (sepia) {
          const r = p5.pixels[i] + grainAmount;
          const g = p5.pixels[i + 1] + grainAmount;
          const b = p5.pixels[i + 2] + grainAmount;

          p5.pixels[i] = p5.constrain(r * 1.07, 0, 255);  // More red
          p5.pixels[i + 1] = p5.constrain(g * 0.74, 0, 255);  // Less green
          p5.pixels[i + 2] = p5.constrain(b * 0.43, 0, 255);  // Much less blue
        } else {
          p5.pixels[i] = p5.constrain(p5.pixels[i] + grainAmount, 0, 255);
          p5.pixels[i + 1] = p5.constrain(p5.pixels[i + 1] + grainAmount, 0, 255);
          p5.pixels[i + 2] = p5.constrain(p5.pixels[i + 2] + grainAmount, 0, 255);
        }
      }
      p5.updatePixels();
    };

    const createVignette = () => {
      const gradient = p5.drawingContext as CanvasRenderingContext2D;
      const radialGradient = gradient.createRadialGradient(
        dimensions.width/2, dimensions.height/2, dimensions.height/4,
        dimensions.width/2, dimensions.height/2, dimensions.height
      );
      radialGradient.addColorStop(0, 'rgba(0,0,0,0)');
      radialGradient.addColorStop(1, 'rgba(0,0,0,0.7)');
      gradient.fillStyle = radialGradient;
      gradient.fillRect(0, 0, dimensions.width, dimensions.height);
    };

    const updateGrainParticles = () => {
      for (const particle of grainParticles) {
        // Update particle position with normal speed (no expansion)
        const speed = particle.speed;
        particle.x += Math.cos(particle.angle) * speed;
        particle.y += Math.sin(particle.angle) * speed;

        // Wrap particles around the screen
        particle.x = (particle.x + dimensions.width) % dimensions.width;
        particle.y = (particle.y + dimensions.height) % dimensions.height;

        // Keep opacity consistent
        particle.opacity = p5.random(50, 150);
      }
    };

    const drawGrainParticles = () => {
      for (const particle of grainParticles) {
        p5.fill(255, particle.opacity);
        p5.noStroke();
        p5.ellipse(particle.x, particle.y,
          particle.size,
          particle.size
        );
      }
    };

    const startDisappearingAnimation = () => {
      isDisappearing = true;
      disappearTimer = 0;

      // Initialize disappearing animation properties for each letter
      letters.forEach(letter => {
        letter.disappearRadius = 0;
        letter.disappearAngle = p5.random(p5.TWO_PI);
        letter.disappearSpeed = p5.random(0.05, 0.1); // Increased speed range
        letter.targetOpacity = 0;
      });
    };

    p5.draw = () => {
      try {
        // Toggle sepia effect occasionally
        if (p5.frameCount % 180 === 0) {
          sepia = !sepia;
        }

        // Flicker effect
        if (p5.frameCount % 3 === 0) {
          flicker = p5.random(50, 150);
        }

        // Background with noise
        p5.background(flicker / 5);

        // Update effects
        zoetrope.update();
        phenakistoscope.update();

        // Draw base effects
        phenakistoscope.draw();

        noiseOffset += 0.01;

        if (mainFont) p5.textFont(mainFont);
        p5.textAlign(p5.CENTER, p5.CENTER);

        // Update grain particles
        updateGrainParticles();

        // Check if we should start the animation
        if (startVisible && !hasStartedAnimation) {
          hasStartedAnimation = true;
          console.log('Starting animation because startVisible is true');
        }

        // Check if letters have settled and start disappearing animation
        if (!isDisappearing && !isComplete && hasStartedAnimation) {
          let allSettled = true;
          letters.forEach(letter => {
            const tolerance = 8; // Increased tolerance further due to drift/trail
            // Only check for settling after drift phase
            if (letter.framesDrawn > letter.driftPhaseDuration) {
              if (
                Math.abs(letter.x - letter.targetX) > tolerance ||
                Math.abs(letter.y - letter.targetY) > tolerance ||
                // Math.abs(letter.opacity - letter.targetOpacity) > tolerance || // Opacity can be tricky
                Math.abs(letter.rotation - letter.targetRotation) > tolerance ||
                Math.abs(letter.size - letter.targetSize) > tolerance
              ) {
                allSettled = false;
                settledFrameCount = 0; // Reset if any letter is not settled post-drift
              }
            } else {
              allSettled = false; // Not settled if still drifting
              settledFrameCount = 0; // Keep resetting while drifting
            }
          });

          if (allSettled || forceDisappear) {
            settledFrameCount++;
            console.log('Settled frames:', settledFrameCount);
            if (settledFrameCount >= startDisappearingAt || forceDisappear) {
              console.log('Starting disappearing animation');
              startDisappearingAnimation();
            }
          }
        }

        // Only process and draw letters if we haven't completed the animation
        if (!isComplete) {
          letters.forEach((letter, index) => {
            letter.framesDrawn++;
            const noiseVal = p5.noise(index + noiseOffset);
            const wobble = p5.map(noiseVal, 0, 1, -5, 5);

            // Phase 1: Drifting in the void
            if (letter.framesDrawn <= letter.driftPhaseDuration && !isDisappearing) {
              letter.x += letter.initialDriftSpeedX;
              letter.y += letter.initialDriftSpeedY;
              // Keep letters within a slightly larger area than canvas during drift, or let them go off-screen
              // letter.x = p5.constrain(letter.x, -dimensions.width * 0.5, dimensions.width * 1.5);
              // letter.y = p5.constrain(letter.y, -dimensions.height * 0.5, dimensions.height * 1.5);

              letter.rotation += letter.initialDriftSpeedX * 0.03; // Slower rotation based on drift
              letter.opacity = p5.lerp(letter.opacity, letter.targetOpacity * 0.85, 0.035); // Gradually appear
              letter.size = p5.lerp(letter.size, letter.targetSize * 0.75, 0.025); // Grow slightly

            // Phase 2: Coalescing
            } else if (!isDisappearing) {
              const easeFactor = 0.07;
              letter.x = p5.lerp(letter.x, letter.targetX, easeFactor);
              letter.y = p5.lerp(letter.y, letter.targetY + wobble, easeFactor);
              letter.opacity = p5.lerp(letter.opacity, letter.targetOpacity, 0.12);
              letter.rotation = p5.lerp(letter.rotation, letter.targetRotation, 0.1);
              letter.size = p5.lerp(letter.size, letter.targetSize, 0.1);

            // Phase 3: Disappearing
            } else {
              const spiralX = letter.targetX + Math.cos(letter.disappearAngle) * letter.disappearRadius;
              const spiralY = letter.targetY + Math.sin(letter.disappearAngle) * letter.disappearRadius;

              letter.x = p5.lerp(letter.x, spiralX, 0.18);
              letter.y = p5.lerp(letter.y, spiralY, 0.18);
              letter.opacity = p5.lerp(letter.opacity, 0, 0.07); // Slower fade to see shrink
              letter.size = p5.lerp(letter.size, 0, 0.08); // Shrink to nothing
              letter.disappearRadius += letter.disappearSpeed * 7; // Enhanced spiral speed
              letter.disappearAngle += letter.disappearSpeed * 4; // Enhanced rotation speed
            }

            letter.spinAngle += letter.spinSpeed;

            // Update Trail
            if (letter.opacity > 5) {
              letter.trail.unshift({
                x: letter.x, y: letter.y, opacity: letter.opacity,
                size: letter.size, rotation: letter.rotation
              });
              if (letter.trail.length > 5) { // Max trail length
                letter.trail.pop();
              }
            } else if (letter.trail.length > 0) {
              letter.trail.pop(); // Clear trail if letter is not visible
            }

            // Draw Trails (if any) - draw before main letter
            if (letter.trail.length > 0) {
              for (let i = 0; i < letter.trail.length; i++) {
                const trailPart = letter.trail[i];
                const ageFactor = (i + 1) / (letter.trail.length + 1);
                const trailDisplayOpacity = trailPart.opacity * (1 - ageFactor) * 0.25; // Trail opacity

                if (trailDisplayOpacity > 1) {
                  p5.push();
                  p5.translate(trailPart.x, trailPart.y);
                  p5.rotate(trailPart.rotation);
                  p5.textSize(trailPart.size * 0.9); // Trail slightly smaller
                  p5.fill(255, trailDisplayOpacity);
                  p5.text(letter.char, 0, 0);
                  p5.pop();
                }
              }
            }

            // Only draw main letter if opacity is greater than a threshold
            if (letter.opacity > 1) {
              p5.push();
              p5.translate(letter.x, letter.y);
              p5.rotate(letter.rotation);

              const spinRadius = letter.isPhilosophical ? 1 : 3;
              const offsetX = Math.cos(letter.spinAngle) * spinRadius;
              const offsetY = Math.sin(letter.spinAngle) * spinRadius;
              p5.translate(offsetX, offsetY);

              if (letter.isPhilosophical) {
                p5.drawingContext.shadowBlur = 15;
                p5.drawingContext.shadowColor = `rgba(255, 255, 255, ${letter.opacity / 255 * 0.7})`;
                p5.textSize(letter.size * 0.9);
                for (let i = 0; i < 3; i++) {
                  p5.fill(255, letter.opacity * 0.3);
                  p5.text(letter.char, p5.random(-1, 1), p5.random(-1, 1));
                }
              } else {
                const bounce = Math.sin(p5.frameCount * 0.05 + index) * 3;
                p5.drawingContext.shadowBlur = 10;
                p5.drawingContext.shadowColor = `rgba(255, 220, 180, ${letter.opacity / 255 * 0.6})`;
                p5.textSize(letter.size * 1.1);
                p5.translate(0, bounce);
                // p5.fill(255, letter.opacity); // This fill is redundant due to main letter fill
              }

              p5.fill(255, letter.opacity);
              p5.text(letter.char, 0, 0);
              p5.drawingContext.shadowBlur = 0;
              p5.pop();
            }
          });
        }

        // Draw overlay effects
        zoetrope.draw();
        createVignette();

        // Draw grain particles with consistent intensity
        const grainIntensity = 1; // Keep consistent intensity
        for (let i = 0; i < 50 * grainIntensity; i++) {
          p5.fill(p5.random(0, 150));
          p5.noStroke();
          p5.ellipse(
            p5.random(dimensions.width),
            p5.random(dimensions.height),
            p5.random(1, 3),
            p5.random(1, 3)
          );
        }
        drawGrainParticles();
        addGrain();

        // Draw sprocket holes
        const holeSize = dimensions.height / 10;
        for (let y = holeSize; y < dimensions.height; y += holeSize * 2) {
          p5.fill(0);
          p5.rect(holeSize/2, y, holeSize, holeSize/2, 2);
          p5.rect(dimensions.width - holeSize*1.5, y, holeSize, holeSize/2, 2);
        }

        // Update disappearing animation
        if (isDisappearing && !isComplete) {
          disappearTimer++;
          // Remove grain expansion to keep the background intact
          // grainExpansion = p5.map(disappearTimer, 0, 60, 0, 1, true);

          // Check if animation is complete
          if (disappearTimer >= 60) { // Reduced time to complete
            if (onAnimationComplete) {
              console.log("Typography animation complete, calling callback");
              onAnimationComplete();
              isComplete = true;

              // Set all letter opacities to 0 to ensure they don't reappear
              letters.forEach(letter => {
                letter.opacity = 0;
              });
            }
          }
        }

      } catch (error) {
        console.error('Draw error:', error);
        setError(error instanceof Error ? error : new Error('Draw failed'));
      }
    };

    return () => {
      // Cleanup
    };
  }, [onAnimationComplete, dimensions, text, startVisible]);

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
      backgroundColor: '#000'
    }}>
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );
}

export default TypographySketch;