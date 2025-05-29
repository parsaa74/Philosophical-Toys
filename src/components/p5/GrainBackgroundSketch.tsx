import React, { useCallback, useState, useEffect } from 'react';
import type p5Types from 'p5';
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { motion } from 'framer-motion';
import p5CleanupHelper from '../../lib/utils/p5CleanupHelper';

type NonFullscreenSize = 'small' | 'medium' | 'large';

interface GrainBackgroundSketchProps {
  size?: NonFullscreenSize | 'fullscreen';
  enableSound?: boolean;
  isExpanded?: boolean;
}

interface Dimensions {
  width: number;
  height: number;
}

const sizeMap: Record<NonFullscreenSize, Dimensions> = {
  small: { width: 300, height: 100 },
  medium: { width: 600, height: 200 },
  large: { width: 900, height: 300 }
};

export function GrainBackgroundSketch({
  size = 'medium',
  enableSound = false,
  isExpanded = false
}: GrainBackgroundSketchProps) {
  console.log('GrainBackgroundSketch component rendering with size:', size);
  const [error, setError] = useState<Error | null>(null);
  const [soundLoaded, setSoundLoaded] = useState<boolean>(false);
  const [currentDimensions, setCurrentDimensions] = useState<Dimensions>({ width: 600, height: 200 });

  // Update dimensions based on size prop and window size
  useEffect(() => {
    // Debounce resize events for performance
    let resizeTimeout: number | null = null;
    const updateDimensions = () => {
      if (size === 'fullscreen' || isExpanded) {
        setCurrentDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      } else {
        setCurrentDimensions(sizeMap[size as NonFullscreenSize]);
      }
    };

    updateDimensions();
    const debouncedUpdate = () => {
      if (resizeTimeout !== null) clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(updateDimensions, 100);
    };
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      if (resizeTimeout !== null) clearTimeout(resizeTimeout);
    };
  }, [size, isExpanded]);

  // Sound cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any audio when component unmounts
      const audio = document.getElementById('projector-sound') as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.remove();
      }
    };
  }, []);

  const sketch = useCallback((p5: p5Types) => {
    console.log('Sketch callback executing');
    let isDestroyed = false;
    let filmGrainShader: p5Types.Shader | null = null;
    let buffer: p5Types.Graphics | null = null;
    let projectorSound: HTMLAudioElement | null = null;

    // Sound setup
    const setupSound = () => {
      if (!enableSound || soundLoaded) return;

      try {
        // Create audio element for projector sound
        projectorSound = document.createElement('audio');
        projectorSound.id = 'projector-sound';
        projectorSound.src = '/sounds/film-projector.mp3';
        projectorSound.loop = true;
        projectorSound.volume = 0.15; // Low volume

        // Add to DOM and play when ready
        projectorSound.addEventListener('canplaythrough', () => {
          if (enableSound && projectorSound && !isDestroyed) {
            projectorSound.play().catch(e => {
              console.log('Audio autoplay prevented:', e);
            });
            setSoundLoaded(true);
          }
        });

        document.body.appendChild(projectorSound);
      } catch (error) {
        console.error('Sound setup error:', error);
      }
    };

    // Vintage film grain shader with 19th-early 20th century aesthetics
    const filmGrainFragShader = `
      precision mediump float;

      varying vec2 vTexCoord;
      uniform sampler2D tex0;
      uniform float time;
      uniform float grainIntensity;
      uniform float grainSize;
      uniform float jitterAmount;
      uniform float burnIntensity;
      uniform float flickerSpeed;
      uniform float flickerIntensity;
      uniform float timeDependentIntensity;

      // New uniforms for enhanced control
      uniform float halationIntensity;
      uniform float flickerVariation;
      uniform float frameDrift;
      uniform float isoSensitivity;

      // Constants defined at the top for easy tuning
      #define DUST_SPECK_COUNT 3
      #define SCRATCH_COUNT 2
      #define EMULSION_DEFECT_COUNT 2
      #define NOISE_TEXTURE_SIZE 128.0

      // Hash function for noise
      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      // Improved organic noise function
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));

        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Unified film artifact function for dust, scratches, and defects
      float filmArtifacts(vec2 uv, float time, float typeSelector) {
        float artifact = 0.0;
        
        // Dust specks
        if (typeSelector < 0.33) {
          for(int i = 0; i < DUST_SPECK_COUNT; i++) {
            float t = time * (0.1 + float(i) * 0.05);
            vec2 pos = vec2(
              noise(vec2(t * 0.3, float(i))),
              noise(vec2(t * 0.3, float(i) + 10.0))
            );
            float size = 0.001 + 0.002 * noise(vec2(t, float(i) * 2.0));
            float d = distance(uv, pos);
            artifact += smoothstep(size, 0.0, d) * 0.5;
          }
        }
        // Scratches
        else if (typeSelector < 0.66) {
          for(int i = 0; i < SCRATCH_COUNT; i++) {
            float y = noise(vec2(float(i) * 2.5, time * 0.01)) * 0.8 + 0.1;
            float thickness = 0.0005 + 0.001 * noise(vec2(time * 0.01, float(i)));
            float intensity = 0.3 + 0.5 * noise(vec2(time * 0.2, float(i)));
            artifact += (1.0 - smoothstep(thickness, thickness * 2.0, abs(uv.y - y))) * intensity;
            float breakNoise = noise(vec2(uv.x * 30.0, time * 0.2 + float(i)));
            if(breakNoise < 0.3) {
              artifact *= breakNoise * 3.0;
            }
          }
          if(noise(vec2(time * 0.01, 5.0)) > 0.85) {
            float x = noise(vec2(time * 0.05, 10.0)) * 0.8 + 0.1;
            float thickness = 0.0003 + 0.0005 * noise(vec2(time * 0.01, 20.0));
            artifact += (1.0 - smoothstep(thickness, thickness * 2.0, abs(uv.x - x))) * 0.2;
          }
        }
        // Emulsion defects
        else {
          for(int i = 0; i < EMULSION_DEFECT_COUNT; i++) {
            float scale = 3.0 + float(i) * 2.0;
            vec2 center = vec2(
              0.5 + 0.6 * (noise(vec2(time * 0.01, float(i))) - 0.5),
              0.5 + 0.6 * (noise(vec2(time * 0.01, float(i) + 10.0)) - 0.5)
            );
            float dist = distance(uv, center) * scale;
            float pattern = noise(vec2(dist * 3.0, time * 0.05 + float(i)));
            float fade = sin(time * 0.03 + float(i) * 1.5) * 0.5 + 0.5;
            if (noise(vec2(time * 0.01 + float(i), 0.0)) > 0.65) {
              artifact += smoothstep(0.9, 0.2, dist) * pattern * fade * 0.15;
            }
          }
        }
        return artifact;
      }

      // Light leak effect (more subtle and period-appropriate)
      vec3 lightLeak(vec2 uv, float time) {
        float leak = 0.0;
        float edgeLeak = smoothstep(0.7, 0.9, max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0);
        edgeLeak *= noise(vec2(time * 0.05, uv.y * 2.0)) * 0.5;
        float flare = 0.0;
        if(noise(vec2(time * 0.02, 0.5)) > 0.92) {
          vec2 flareCenter = vec2(
            0.8 + 0.3 * noise(vec2(time * 0.01, 0.2)),
            0.2 + 0.6 * noise(vec2(time * 0.01, 0.3))
          );
          float flareSize = 0.2 + 0.1 * noise(vec2(time * 0.01, 0.4));
          flare = smoothstep(flareSize, 0.0, distance(uv, flareCenter)) * 0.15;
        }
        leak = max(edgeLeak, flare);
        vec3 leakColor = vec3(1.0, 0.9, 0.7);
        return leak * leakColor;
      }

      // Frame burn effect (chemical deterioration of film edge)
      float frameBurn(vec2 uv, float time) {
        float burn = 0.0;
        float edge = smoothstep(0.7, 1.0, max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0);
        burn += edge * noise(uv * 15.0 + time * 0.05) * burnIntensity * 1.5;
        vec2 burnUV = uv * 3.0 + time * 0.1;
        float spots = smoothstep(0.75, 0.85, noise(burnUV)) * noise(uv * 5.0);
        burn += spots * burnIntensity * 0.7;
        return burn;
      }

      // Vignette effect with time variation
      float vignette(vec2 uv, float intensity, float time) {
        vec2 center = vec2(0.5, 0.5);
        float dist = length(uv - center);
        float noiseScale = 3.0;
        float noiseAmount = 0.15;
        float edgeNoise = noise(vec2(atan(uv.y - 0.5, uv.x - 0.5) * noiseScale, time * 0.1)) * noiseAmount;
        float cornerIntensity = pow(dist, 1.5) * 1.6;
        float pulse = 1.0 + 0.05 * sin(time * 0.2);
        return smoothstep(0.6 - edgeNoise, 0.1, dist * intensity * pulse) * cornerIntensity;
      }

      // Enhanced Film flicker effect with non-uniform rates
      float flicker(float time, float speed, float intensity) {
        float flickerVal = noise(vec2(time * (speed + flickerVariation * sin(time * 0.1)), 0.0));
        flickerVal = mix(1.0, 1.0 + intensity, flickerVal);
        return flickerVal;
      }

      // Film gate weave (frame displacement over time)
      vec2 gateWeave(vec2 uv, float time) {
        float xOffset = sin(time * 0.3) * 0.004 + sin(time * 0.7) * 0.002;
        float yOffset = sin(time * 0.2) * 0.004 + cos(time * 0.5) * 0.002;
        return uv + vec2(xOffset, yOffset) * frameDrift;
      }

      // Film splice mark effect
      float spliceMark(vec2 uv, float time) {
        if (noise(vec2(floor(time * 0.05), 0.0)) > 0.97) {
          float y = 0.5 + 0.4 * (noise(vec2(floor(time * 0.05), 1.0)) - 0.5);
          float thickness = 0.005 + 0.003 * noise(vec2(floor(time * 0.05), 2.0));
          float rough = 0.001 * noise(vec2(uv.x * 50.0, floor(time * 0.05)));
          if (abs(uv.y - y) < thickness + rough) {
            return 1.0;
          }
        }
        return 0.0;
      }

      // Severe frame jump (film misalignment)
      float frameJump(float time) {
        if (noise(vec2(floor(time * 10.0), 123.456)) > 0.995) {
          return 1.0;
        }
        return 0.0;
      }

      void main() {
        // Apply gate weave (frame displacement)
        vec2 weaveUV = gateWeave(vTexCoord, time);
        // Apply frame jitter (uneven film advance)
        float jx = hash(vec2(time * 2.5, weaveUV.y * 10.0)) - 0.5;
        float jy = hash(vec2(time * 3.0, weaveUV.x * 10.0)) - 0.5;
        vec2 jitterUV = weaveUV + vec2(jx, jy) * jitterAmount;
        // Sample texture once and reuse
        vec4 color = texture2D(tex0, jitterUV);
        // Global flicker with non-uniform rates
        float flickerAmount = flicker(time, flickerSpeed, flickerIntensity);
        // Simplified film grain calculation with ISO sensitivity
        float timePhase1 = time * 0.5;
        float timePhase2 = time * 0.3;
        float dynamicScale1 = 800.0 + 50.0 * sin(time * 0.2);
        float dynamicScale2 = 200.0 + 30.0 * cos(time * 0.3);
        vec2 grainUV = jitterUV * (dynamicScale1 * grainSize);
        grainUV.x *= 1.1;
        float basicNoise = noise(grainUV + timePhase1) * 0.5;
        float largeNoise = hash(jitterUV * (dynamicScale2 * grainSize) + timePhase2) * 0.3;
        float pulsatingIntensity = grainIntensity * (0.8 + 0.2 * sin(time * 0.5)) * isoSensitivity;
        float grain = mix(basicNoise, largeNoise, 0.6) * pulsatingIntensity * timeDependentIntensity * 1.5;
        // Vintage color grading with non-linear response
        vec3 baseTint = vec3(1.0, 0.98, 0.9);
        vec3 sepia = vec3(1.0, 0.89, 0.75);
        // Apply effects
        color.rgb *= baseTint;
        color.rgb *= flickerAmount * 0.95;
        color.rgb += grain * 0.3 - 0.15;
        float vig = vignette(jitterUV, 2.2, time);
        color.rgb = mix(color.rgb, color.rgb * 0.6, 1.0 - vig);
        color.rgb = mix(color.rgb, color.rgb * sepia, 0.9);
        color.rgb = mix(vec3(0.2), color.rgb, 0.75);
        // Non-linear sepia grading for highlights
        float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        float highlightBurn = smoothstep(0.5, 0.9, luminance) * 0.2;
        color.rgb -= vec3(highlightBurn);
        gl_FragColor = color;
      }
    `;

    const vertShader = `
      precision mediump float;

      attribute vec3 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;

      void main() {
        vTexCoord = aTexCoord;
        vec4 positionVec4 = vec4(aPosition, 1.0);
        positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
        gl_Position = positionVec4;
      }
    `;

    // Enhanced dust and film artifact particle system
    interface FilmParticle {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      angle: number;
      type: 'dust' | 'scratch' | 'hair';
      lifespan: number;
      age: number;
    }

    const particles: FilmParticle[] = [];
    const NUM_PARTICLES = 120; // Even more particles for authentic film look

    const initParticles = () => {
      for (let i = 0; i < NUM_PARTICLES; i++) {
        createParticle();
      }
    };

    const createParticle = () => {
      // Random particle type distribution
      const typeRand = p5.random(1);
      // Distribute particle types with more subtle scratches
      const type = typeRand < 0.7 ? 'dust' : (typeRand < 0.85 ? 'scratch' : 'hair');

      const lifespan = type === 'dust' ? p5.random(30, 90) :
                       type === 'scratch' ? p5.random(5, 15) :
                       p5.random(60, 180);

      particles.push({
        x: p5.random(currentDimensions.width),
        y: p5.random(currentDimensions.height),
        size: type === 'dust' ? p5.random(0.7, 3.0) :
              type === 'scratch' ? p5.random(0.6, 1.2) :
              p5.random(0.4, 0.8),
        speed: type === 'dust' ? p5.random(0.2, 1.0) :
              type === 'scratch' ? 0 :
              p5.random(0.06, 0.25),
        opacity: type === 'dust' ? p5.random(50, 140) :
              type === 'scratch' ? p5.random(120, 220) :
              p5.random(70, 170),
        angle: p5.random(p5.TWO_PI),
        type,
        lifespan,
        age: 0
      });
    };

    const updateParticles = () => {
      // First, update and remove old particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.age++;

        if (particle.age >= particle.lifespan) {
          particles.splice(i, 1);
          continue;
        }

        // Motion based on particle type
        if (particle.type === 'dust') {
          particle.x += Math.cos(particle.angle) * particle.speed;
          particle.y += Math.sin(particle.angle) * particle.speed;

          // Slight drift in motion
          if (p5.random(1) < 0.03) {
            particle.angle += p5.random(-0.2, 0.2);
          }
        } else if (particle.type === 'hair') {
          // Hair moves slowly in one direction
          particle.y += particle.speed;
        }

        // Wrap around screen
        if (particle.x < 0) particle.x = currentDimensions.width;
        if (particle.x > currentDimensions.width) particle.x = 0;
        if (particle.y < 0) particle.y = currentDimensions.height;
        if (particle.y > currentDimensions.height) particle.y = 0;
      }

      // Add new particles to maintain density
      while (particles.length < NUM_PARTICLES) {
        createParticle();
      }
    };

    const drawParticles = () => {
      if (!buffer) return;
      buffer.push();
      buffer.translate(-currentDimensions.width/2, -currentDimensions.height/2);
      buffer.noStroke();

      for (const particle of particles) {
        // Particles fade in and out
        const lifecycle = Math.min(particle.age, particle.lifespan - particle.age) / (particle.lifespan * 0.25);
        const alpha = particle.opacity * Math.min(1, lifecycle);

        // Add flicker effect to dust
        const flickerAmount = p5.map(
          p5.noise(particle.x * 0.01, particle.y * 0.01, p5.frameCount * 0.01),
          0, 1, 0.6, 1
        );

        buffer.fill(255, alpha * flickerAmount);

        if (particle.type === 'dust') {
          buffer.ellipse(particle.x, particle.y, particle.size, particle.size);
        } else if (particle.type === 'scratch') {
          // Scratches are lines
          buffer.push();
          buffer.stroke(255, alpha * 0.6); // Subtler scratches
          buffer.strokeWeight(particle.size * 0.7); // Thinner scratches
          const scratchLength = p5.random(5, 15); // Shorter scratches
          const angle = p5.random(p5.TWO_PI);
          buffer.line( // Draw scratches with reduced intensity
            particle.x,
            particle.y,
            particle.x + Math.cos(angle) * scratchLength,
            particle.y + Math.sin(angle) * scratchLength
          );
          buffer.pop();
        } else if (particle.type === 'hair') {
          // Hair is curved line
          buffer.push();
          buffer.stroke(255, alpha * 0.7);
          buffer.strokeWeight(particle.size * 0.5);
          buffer.noFill();
          buffer.beginShape();
          const hairLength = p5.random(10, 40);
          const curveAmount = p5.random(-5, 5);
          for (let i = 0; i < hairLength; i += 3) {
            const curveFactor = Math.sin(i / hairLength * p5.PI) * curveAmount;
            buffer.curveVertex(
              particle.x + curveFactor,
              particle.y + i
            );
          }
          buffer.endShape();
          buffer.pop();
        }
      }
      buffer.pop();
    };

    // Film reel sprocket holes effect
    const drawSprocketHoles = () => {
      if (!buffer) return;
      buffer.push();

      // Calculate sprocket hole positions - increase size for bolder appearance
      const holeSize = currentDimensions.height * 0.15; // Increased from 0.12
      const holeSpacing = holeSize * 1.6; // Reduced spacing slightly
      const leftEdge = -currentDimensions.width/2 + holeSize/2;
      const rightEdge = currentDimensions.width/2 - holeSize/2;

      // Slow vertical movement to simulate film advancement
      const verticalOffset = (p5.frameCount * 0.5) % holeSpacing;

      // Draw borders around holes for more definition
      buffer.stroke(40); // Dark gray stroke
      buffer.strokeWeight(2); // Thicker border
      buffer.fill(0); // Black holes

      // Draw left side sprocket holes
      for (let y = -currentDimensions.height/2 + verticalOffset; y < currentDimensions.height/2; y += holeSpacing) {
        // Occasional missing or partially damaged hole
        const holeDamage = p5.noise(y * 0.01, p5.frameCount * 0.01);
        if (holeDamage > 0.15) { // 85% of holes are visible
          const holeWidth = holeSize * p5.map(holeDamage, 0.15, 1, 0.7, 1);
          const holeHeight = holeSize * p5.map(holeDamage, 0.15, 1, 0.7, 1);

          // Add highlight for depth
          buffer.push();
          buffer.stroke(50);
          buffer.fill(5);
          buffer.rect(leftEdge, y, holeWidth, holeHeight, 3);

          // Add inner dark area
          buffer.noStroke();
          buffer.fill(0);
          buffer.rect(leftEdge, y, holeWidth * 0.85, holeHeight * 0.85, 2);
          buffer.pop();
        }
      }

      // Draw right side sprocket holes
      for (let y = -currentDimensions.height/2 + verticalOffset; y < currentDimensions.height/2; y += holeSpacing) {
        const holeDamage = p5.noise(y * 0.01 + 100, p5.frameCount * 0.01);
        if (holeDamage > 0.15) {
          const holeWidth = holeSize * p5.map(holeDamage, 0.15, 1, 0.7, 1);
          const holeHeight = holeSize * p5.map(holeDamage, 0.15, 1, 0.7, 1);

          // Add highlight for depth
          buffer.push();
          buffer.stroke(50);
          buffer.fill(5);
          buffer.rect(rightEdge, y, holeWidth, holeHeight, 3);

          // Add inner dark area
          buffer.noStroke();
          buffer.fill(0);
          buffer.rect(rightEdge, y, holeWidth * 0.85, holeHeight * 0.85, 2);
          buffer.pop();
        }
      }

      buffer.pop();
    };

    // Draw frame counter numbers (like film frames)
    const drawFrameCounter = () => {
      if (!buffer) return;
      buffer.push();

      // Position in bottom corner
      const counterX = currentDimensions.width/2 - 40;
      const counterY = currentDimensions.height/2 - 25;

      // Frame number (cycles through 0-999)
      const frameNumber = Math.floor(p5.frameCount / 2) % 1000;
      const frameString = frameNumber.toString().padStart(3, '0');

      // Draw background for the counter
      buffer.noStroke();
      buffer.fill(10);
      buffer.rect(counterX, counterY, 30, 16, 2);

      // Draw the frame number
      buffer.textSize(12);
      buffer.textAlign(buffer.CENTER, buffer.CENTER);
      buffer.fill(200, 190, 160); // Yellowish aged text
      buffer.text(frameString, counterX, counterY);

      buffer.pop();
    };

    p5.setup = () => {
      try {
        p5.createCanvas(currentDimensions.width, currentDimensions.height, p5.WEBGL);

        // Create buffer first
        buffer = p5.createGraphics(currentDimensions.width, currentDimensions.height, p5.WEBGL);

        // Create shader after buffer
        try {
          filmGrainShader = p5.createShader(vertShader, filmGrainFragShader);
        } catch (shaderError) {
          console.error('Shader creation error:', shaderError);
          // Create a simple fallback shader if the main one fails
          const fallbackFragShader = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform sampler2D tex0;

            void main() {
              vec4 color = texture2D(tex0, vTexCoord);
              gl_FragColor = color;
            }
          `;
          filmGrainShader = p5.createShader(vertShader, fallbackFragShader);
        }

        initParticles();

        // Random frame starting point for the vintage feel
        p5.frameCount = Math.floor(p5.random(1000));

        p5.frameRate(24);

        // Setup projector sound if enabled
        if (enableSound) {
          setupSound();
        }

      } catch (error) {
        console.error('Setup error:', error);
        setError(error instanceof Error ? error : new Error('Setup failed'));
      }
    };

    p5.draw = () => {
      if (isDestroyed) return;

      try {
        if (!buffer || !filmGrainShader) return;

        // Create base texture in buffer
        buffer.background(15); // Very dark base

        // Draw sprocket holes on edges (authentic film strip effect)
        drawSprocketHoles();

        // Draw frame counter
        drawFrameCounter();

        // Update and draw particles
        updateParticles();
        drawParticles();

        // Apply shader
        p5.shader(filmGrainShader);

        // Set shader uniforms with refined values
        filmGrainShader.setUniform('tex0', buffer);
        filmGrainShader.setUniform('time', p5.frameCount * 0.012);
        filmGrainShader.setUniform('grainIntensity', 0.35);
        filmGrainShader.setUniform('grainSize', 1.2);
        filmGrainShader.setUniform('jitterAmount', 0.005);
        filmGrainShader.setUniform('burnIntensity', 0.32);
        filmGrainShader.setUniform('flickerSpeed', 3.0);
        filmGrainShader.setUniform('flickerIntensity', 0.15);
        filmGrainShader.setUniform('timeDependentIntensity', 0.9 + 0.3 * Math.sin(p5.frameCount * 0.025));

        // Set new uniforms
        filmGrainShader.setUniform('halationIntensity', 0.25);
        filmGrainShader.setUniform('flickerVariation', 0.3);
        filmGrainShader.setUniform('frameDrift', 1.0);
        filmGrainShader.setUniform('isoSensitivity', 1.0);

        // Draw the final result
        p5.rect(0, 0, currentDimensions.width, currentDimensions.height);

        // Occasional film flash flicker (more intense)
        if (p5.random() < 0.015) {
          p5.push();
          p5.resetShader();
          p5.noStroke();
          p5.fill(255, p5.random(20, 80)); // Brighter flashes
          p5.rect(-currentDimensions.width/2, -currentDimensions.height/2, currentDimensions.width, currentDimensions.height);
          p5.pop();
        }

      } catch (error) {
        console.error('Draw error:', error);
        setError(error instanceof Error ? error : new Error('Draw failed'));
      }
    };

    return () => {
      isDestroyed = true;

      // Clean up audio
      if (projectorSound) {
        projectorSound.pause();
        if (projectorSound.parentNode) {
          projectorSound.parentNode.removeChild(projectorSound);
        }
      }

      // Clean up WebGL resources using helper
      if (buffer) {
        p5CleanupHelper.cleanupGraphics(buffer);
        buffer = null;
      }
      
      // Clean up shader
      if (filmGrainShader) {
        // No direct way to dispose shaders in p5.js, but we can remove references
        filmGrainShader = null;
      }
      
      // Stop the loop
      p5.noLoop();
      
      // Remove canvas from DOM
      p5CleanupHelper.removeCanvasFromDOM(document.body);
    };
  }, [currentDimensions, enableSound, soundLoaded]);

  if (error) {
    return (
      <div style={{
        color: 'red',
        padding: '10px',
        textAlign: 'center',
        backgroundColor: 'black',
        width: currentDimensions.width,
        height: currentDimensions.height,
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
    <motion.div
      initial={false}
      animate={{
        width: currentDimensions.width,
        height: currentDimensions.height,
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.8
      }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        transformOrigin: 'center'
      }}
    >
      <NextReactP5Wrapper sketch={sketch} />
    </motion.div>
  );
}

export default GrainBackgroundSketch;
