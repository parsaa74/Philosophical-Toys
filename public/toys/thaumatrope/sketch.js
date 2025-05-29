// Constants
const BLUR_AMOUNT = 12; // Increased for better persistence of vision
const DISC_RADIUS = 150;
const DISC_THICKNESS = 0.15;
const INITIAL_SPIN_SPEED = 0.8; // Reduced for more natural starting speed
const MAX_SPIN_SPEED = 15; // Target speed for optimal persistence of vision
const SPIN_ACCELERATION = 0.3; // How quickly it reaches max speed
const PARTICLE_COUNT = 50;

// String-related constants
const STRING_LENGTH = 200;
const STRING_SEGMENTS = 20; // Increased for smoother curves
const STRING_HOLE_RADIUS = 4;
const PULL_DISTANCE = 150;
const STRING_COLOR = [190, 200, 210];     // Lighter steel base
const STRING_HIGHLIGHT = [220, 225, 235];  // Brighter metallic highlight
const STRING_SHADOW = [140, 145, 155];     // Lighter shadow for contrast
const STRING_BASE_THICKNESS = 3;
const STRING_TEXTURE_AMPLITUDE = 0.8;   // How much the thickness varies
const STRING_TEXTURE_FREQUENCY = 0.8;   // How often the thickness varies
const STRING_DROOP = 40;               // How much the string droops
const STRING_TENSION_FACTOR = 0.6;     // How much the string straightens when pulled

// Color palette - Modern cool tones with optimized background
const COLORS = {
  background: [8, 10, 15],         // Much darker blue-slate for maximum depth
  disc: [180, 185, 195],          // Lighter metallic silver
  bird: [15, 17, 22],             // Keep bird dark for contrast
  cage: [65, 55, 45],             // Deep, dark bronze
  accent: [220, 225, 235],        // Brighter pearl
  gold: [95, 75, 55],             // Dark bronze highlight
  highlight: [245, 248, 255]      // Pure cool white
};

// State management
const state = {
  angle: 0,
  spinning: false,
  spinSpeed: INITIAL_SPIN_SPEED,
  lastAngle: 0,
  ease: 0,
  isResetting: false,
  particles: [],
  spring: { position: 0, velocity: 0, target: 0 },
  strings: {
    left: {
      pullAmount: 0,
      targetPull: 0,
      velocity: 0,
      points: Array(STRING_SEGMENTS).fill().map(() => ({ x: 0, y: 0 }))
    },
    right: {
      pullAmount: 0,
      targetPull: 0,
      velocity: 0,
      points: Array(STRING_SEGMENTS).fill().map(() => ({ x: 0, y: 0 }))
    }
  }
};

// Motion blur and effect buffers
let blurFrames = [];
let canvas;
let bloomShader;
let effectBuffer;
let shaderBuffer;

// Shader code
const bloomVertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}`;

const bloomFragShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;
uniform float bloomStrength;
uniform float discRadius;
uniform float time;

// Enhanced noise functions for better visual mixing
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vTexCoord;
  vec4 color = texture2D(tex0, uv);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 pos = (uv - center) * resolution;
  float dist = length(pos) / discRadius;
  
  if (dist <= 1.0) {
    // Enhanced persistence of vision effect
    vec4 accumulator = vec4(0.0);
    float phaseOffset = time * 0.5;
    
    // Increased sampling for smoother blending
    for(float i = 0.0; i < 6.0; i++) {
      vec2 offset = vec2(
        sin(phaseOffset * i + time) * 0.008 * (1.0 - dist),
        cos(phaseOffset * i + time) * 0.008 * (1.0 - dist)
      );
      vec4 historical = texture2D(tex0, uv + offset);
      accumulator += historical * (0.7 / (i + 1.0));
    }
    
    // Enhanced bloom effect with directional blur
    vec4 bloom = vec4(0.0);
    float total = 0.0;
    
    for(float i = -4.0; i <= 4.0; i++) {
      for(float j = -4.0; j <= 4.0; j++) {
        // Directional blur based on rotation
        vec2 dir = normalize(vec2(cos(time), sin(time)));
        vec2 offset = (vec2(i, j) + dir * 2.0) * (1.0 / resolution);
        float weight = 1.0 / (1.0 + length(offset) * 6.0);
        bloom += texture2D(tex0, uv + offset) * weight;
        total += weight;
      }
    }
    
    bloom /= total;
    float fadeEdge = smoothstep(0.8, 1.0, dist);
    
    // Enhanced visual mixing
    vec4 mixedColor = mix(color, accumulator, 0.4);
    mixedColor = mix(mixedColor, bloom, bloomStrength * 1.2);
    
    // Add subtle radial blur for better blending
    vec2 radialBlur = normalize(pos) * 0.001;
    vec4 radial = texture2D(tex0, uv + radialBlur);
    mixedColor = mix(mixedColor, radial, 0.2);
    
    // Add subtle chromatic aberration
    float aberrationStrength = 0.002 * (1.0 - dist);
    vec4 r = texture2D(tex0, uv + radialBlur * aberrationStrength);
    vec4 b = texture2D(tex0, uv - radialBlur * aberrationStrength);
    mixedColor.r = mix(mixedColor.r, r.r, 0.3);
    mixedColor.b = mix(mixedColor.b, b.b, 0.3);
    
    gl_FragColor = mix(mixedColor, color, fadeEdge);
  } else {
    gl_FragColor = color;
  }
}`;

const chromaticAberrationFrag = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;
uniform float bloomStrength;
uniform float discRadius;

void main() {
  // Correct UV coordinates for WEBGL coordinate system
  vec2 uv = vTexCoord;
  vec4 color = texture2D(tex0, uv);
  
  // Adjust center calculation for WEBGL coordinates
  vec2 center = vec2(0.5, 0.5);
  vec2 pos = (uv - center) * resolution;
  float dist = length(pos) / discRadius;
  
  if (dist <= 1.0) {
    vec4 bloom = vec4(0.0);
    float total = 0.0;
    
    for(float i = -4.0; i <= 4.0; i++) {
      for(float j = -4.0; j <= 4.0; j++) {
        vec2 offset = vec2(i, j) * (1.0 / resolution);
        float weight = 1.0 / (1.0 + length(offset) * 8.0);
        bloom += texture2D(tex0, uv + offset) * weight;
        total += weight;
      }
    }
    
    bloom /= total;
    float fadeEdge = smoothstep(0.8, 1.0, dist);
    gl_FragColor = mix(mix(color, bloom, bloomStrength), color, fadeEdge);
  } else {
    gl_FragColor = color;
  }
  
  // Add chromatic aberration
  vec2 direction = normalize(uv - center);
  float aberrationStrength = 0.003 * smoothstep(0.0, 0.8, dist);
  
  vec4 r = texture2D(tex0, uv + direction * aberrationStrength);
  vec4 g = texture2D(tex0, uv);
  vec4 b = texture2D(tex0, uv - direction * aberrationStrength);
  
  color = vec4(r.r, g.g, b.b, color.a);
}`;

// Particle class
class Particle {
  constructor() {
    this.reset();
  }
  
  reset() {
    const angle = random(TWO_PI);
    const radius = random(DISC_RADIUS * 0.8, DISC_RADIUS * 1.2);
    this.pos = createVector(cos(angle) * radius, sin(angle) * radius, random(-10, 10));
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5), random(-0.2, 0.2));
    this.life = random(50, 150);
    this.maxLife = this.life;
    this.size = random(2, 4);
    // Add gear rotation
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.05, 0.05);
    this.isGear = random() > 0.7; // 30% chance to be a gear
  }
  
  update() {
    this.pos.add(this.vel);
    this.life--;
    if (this.life < 0) this.reset();
  }
  
  draw(pg) {
    const alpha = map(this.life, 0, this.maxLife, 0, 255);
    pg.push();
    pg.translate(this.pos.x, this.pos.y, this.pos.z);
    pg.rotateZ(this.rotation);
    
    if (this.isGear) {
      // Draw mini gear
      pg.fill(...COLORS.cage, alpha * 0.7);
      this.drawGear(pg, this.size * 2);
      this.rotation += this.rotationSpeed;
    } else {
      // Draw spark
      pg.fill(...COLORS.gold, alpha * 0.5);
      pg.sphere(this.size);
    }
    pg.pop();
  }
  
  drawGear(pg, size) {
    const teeth = 8;
    pg.beginShape();
    for (let i = 0; i < teeth * 2; i++) {
      const angle = (TWO_PI * i) / (teeth * 2);
      const radius = i % 2 === 0 ? size : size * 0.7;
      const x = cos(angle) * radius;
      const y = sin(angle) * radius;
      pg.vertex(x, y);
    }
    pg.endShape(CLOSE);
  }
}

function windowResized() {
  resizeCanvas(min(windowWidth - 40, 800), min(windowHeight - 100, 800));
}

function setup() {
  // Create canvas and ensure it's visible
  canvas = createCanvas(min(windowWidth - 40, 800), min(windowHeight - 100, 800), WEBGL);
  canvas.style('display', 'block');
  
  // Initialize WebGL settings
  setAttributes('antialias', true);
  angleMode(RADIANS);
  
  // Create shader buffer first
  shaderBuffer = createGraphics(width, height, WEBGL);
  
  // Create shader in the shader buffer's context
  try {
    bloomShader = shaderBuffer.createShader(bloomVertShader, bloomFragShader);
    if (!bloomShader) {
      console.error('Failed to create shader');
      noLoop();
      return;
    }
  } catch (e) {
    console.error('Shader creation failed:', e);
    noLoop();
    return;
  }
  
  effectBuffer = createGraphics(width, height, WEBGL);
  
  // Initialize particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    state.particles.push(new Particle());
  }

  // Initialize blur frames
  blurFrames = Array.from({ length: BLUR_AMOUNT }, () => 
    createGraphics(width, height, WEBGL)
  );
  
  // Initialize all blur frames
  blurFrames.forEach(frame => drawDisc(frame));

  // Event listeners
  const spinButton = document.getElementById('spinButton');
  const resetButton = document.getElementById('resetButton');
  
  if (spinButton) spinButton.addEventListener('click', toggleSpin);
  if (resetButton) resetButton.addEventListener('click', resetRotation);
}

function draw() {
  background(...COLORS.background);
  
  // Add realistic spin physics
  if (state.spinning) {
    state.ease = lerp(state.ease, 1, 0.1);
    // Gradually increase speed with realistic acceleration
    state.spinSpeed = lerp(state.spinSpeed, MAX_SPIN_SPEED, SPIN_ACCELERATION * state.ease);
  } else {
    // Natural deceleration
    state.spinSpeed *= 0.95;
    state.ease = lerp(state.ease, 0, 0.15);
  }

  // Film speed fluctuation for more organic motion
  const filmSpeed = map(noise(frameCount * 0.1), 0, 1, 0.95, 1.05);
  const currentSpeed = state.spinSpeed * filmSpeed;
  
  // Update string physics
  updateStrings();
  
  // Update rotation state with improved physics
  if (!state.isResetting) {
    state.angle += currentSpeed * state.ease;
  } else {
    state.angle = lerp(state.angle, 0, 0.2);
    if (abs(state.angle) < 0.01) {
      state.angle = 0;
      state.isResetting = false;
    }
  }

  // Manage motion blur frames
  manageBlurFrames();

  // Render the scene
  push();
  if (state.spinning) {
    renderMotionBlur();
  } else {
    // Clear blending mode and render single frame
    image(blurFrames[0], -width/2, -height/2);
  }
  pop();
  
  // Always draw strings on top
  push();
  translate(0, 0, 1); // Ensure strings are drawn above the disc
  drawStrings(window);
  pop();
}

function manageBlurFrames() {
  if (state.spinning || state.spinSpeed > 0.1) {
    // Enhanced frame management for smoother transitions
    const oldestFrame = blurFrames.pop();
    oldestFrame.clear();
    oldestFrame.push();
    
    // Add slight offset based on rotation speed for better motion blur
    const rotationOffset = (state.spinSpeed / MAX_SPIN_SPEED) * 0.1;
    oldestFrame.translate(
      cos(state.angle) * rotationOffset,
      sin(state.angle) * rotationOffset
    );
    
    drawDisc(oldestFrame);
    oldestFrame.pop();
    blurFrames.unshift(oldestFrame);
  } else if (state.angle !== state.lastAngle) {
    blurFrames[0].clear();
    blurFrames[0].push();
    drawDisc(blurFrames[0]);
    blurFrames[0].pop();
    state.lastAngle = state.angle;
  }
}

function updateStrings() {
  const springK = 0.3;
  const damping = 0.85;
  
  ['left', 'right'].forEach(side => {
    const string = state.strings[side];
    
    // Update spring physics with improved tension
    const force = (string.targetPull - string.pullAmount) * springK;
    string.velocity += force;
    string.velocity *= damping;
    string.pullAmount += string.velocity;
    
    // Calculate anchor points (at canvas edges)
    const anchorX = side === 'left' ? -width/2 : width/2;
    const discX = side === 'left' ? -DISC_RADIUS : DISC_RADIUS;
    
    // Calculate rotation matrix for disk attachment point
    const cosA = cos(state.angle);
    const sinA = sin(state.angle);
    
    // Calculate centrifugal force effect when spinning
    const spinningTension = state.spinning ? 
      min(1, state.spinSpeed * state.ease * 2) : 0; // Increased tension factor
    
    // Combined tension from pulling and spinning
    const pullRatio = string.pullAmount / PULL_DISTANCE;
    const tensionFactor = max(
      1 - (pullRatio * STRING_TENSION_FACTOR),
      spinningTension
    );
    
    // Update string segment positions with improved physics
    string.points.forEach((point, i) => {
      const t = i / (STRING_SEGMENTS - 1);
      
      // Calculate base position
      const baseX = lerp(anchorX, discX + (side === 'left' ? -string.pullAmount : string.pullAmount), t);
      
      // Calculate disk attachment point with rotation
      let attachX = discX;
      let attachY = 0;
      let attachZ = 0;
      
      if (t > 0.8) {
        // Affect points near the disc when spinning
        const rotationT = (t - 0.8) / 0.2;
        attachZ = -DISC_THICKNESS/2 * cosA * rotationT;
        attachY = -DISC_THICKNESS/2 * sinA * rotationT;
      }
      
      // Add natural droop that reduces with tension
      const droopAmount = sin(t * PI) * STRING_DROOP * 
        (1 - spinningTension) * tensionFactor;
      
      // Add slight wave motion that reduces with tension
      const waveAmount = sin(t * 10 + frameCount * 0.05) * 
        2 * (1 - max(pullRatio, spinningTension));
      
      // Final position calculation
      point.x = lerp(baseX, attachX, t);
      point.y = lerp(droopAmount + waveAmount, attachY, t);
      point.z = lerp(0, attachZ, t);
    });
  });
}

function drawStrings(pg) {
  pg.push();
  
  // Draw strings with texture
  ['left', 'right'].forEach(side => {
    const string = state.strings[side];
    const pullRatio = string.pullAmount / PULL_DISTANCE;
    
    // Draw string holes in disk first
    pg.push();
    pg.translate(side === 'left' ? -DISC_RADIUS : DISC_RADIUS, 0, 0);
    pg.rotateX(state.angle);
    
    // Draw hole
    pg.fill(...COLORS.background);
    pg.noStroke();
    pg.push();
    pg.translate(0, 0, -DISC_THICKNESS/2);
    pg.cylinder(STRING_HOLE_RADIUS, DISC_THICKNESS, 16);
    pg.pop();
    
    // Draw back knot
    pg.push();
    pg.translate(0, 0, -DISC_THICKNESS/2 - 1);
    drawKnot(pg, side, -1);
    pg.pop();
    
    // Draw front knot
    pg.push();
    pg.translate(0, 0, DISC_THICKNESS/2 + 1);
    drawKnot(pg, side, 1);
    pg.pop();
    
    pg.pop();
    
    // Draw string shadow
    pg.push();
    pg.translate(0, 2, -0.1);
    pg.stroke(0, 0, 0, 30);
    pg.strokeWeight(STRING_BASE_THICKNESS + 1);
    pg.noFill();
    pg.beginShape();
    string.points.forEach(point => pg.vertex(point.x, point.y, point.z));
    pg.endShape();
    pg.pop();
    
    // Draw main string with texture
    for (let layer = 0; layer < 3; layer++) {
      pg.push();
      
      // Layer properties
      const offset = (layer - 1) * 0.5;
      const color = layer === 0 ? STRING_SHADOW : 
                   layer === 1 ? STRING_COLOR : 
                   STRING_HIGHLIGHT;
      
      pg.translate(0, offset, layer * 0.1);
      pg.stroke(...color, layer === 1 ? 255 : 180);
      
      // Varying thickness based on tension and texture
      for (let i = 0; i < string.points.length - 1; i++) {
        const t = i / (string.points.length - 1);
        const nextT = (i + 1) / (string.points.length - 1);
        
        // Calculate texture variation
        const thickness = STRING_BASE_THICKNESS * 
          (1 + sin(t * 50 + frameCount * 0.1) * STRING_TEXTURE_AMPLITUDE * (1 - pullRatio));
        
        pg.strokeWeight(thickness * (layer === 1 ? 1 : 0.5));
        
        // Draw segment with slight texture variation and proper Z-depth
        pg.line(
          string.points[i].x + noise(t * 10 + frameCount * 0.05) * (1 - pullRatio),
          string.points[i].y,
          string.points[i].z,
          string.points[i + 1].x + noise(nextT * 10 + frameCount * 0.05) * (1 - pullRatio),
          string.points[i + 1].y,
          string.points[i + 1].z
        );
      }
      pg.pop();
    }
  });
  
  pg.pop();
}

function drawKnot(pg, side, depth) {
  const knotSize = STRING_HOLE_RADIUS * 1.5;
  
  // Draw knot shadow
  pg.push();
  pg.translate(1, 1, -0.1);
  pg.fill(0, 0, 0, 50);
  pg.noStroke();
  pg.sphere(knotSize);
  pg.pop();
  
  // Draw main knot
  pg.push();
  pg.fill(...STRING_COLOR);
  pg.noStroke();
  pg.sphere(knotSize * 0.8);
  
  // Draw knot details
  pg.push();
  pg.rotateZ(side === 'left' ? PI/4 : -PI/4);
  pg.translate(0, 0, knotSize * 0.3);
  pg.stroke(...STRING_COLOR);
  pg.strokeWeight(STRING_BASE_THICKNESS);
  pg.line(-knotSize/2, 0, knotSize/2, 0);
  pg.line(0, -knotSize/2, 0, knotSize/2);
  pg.pop();
  
  pg.pop();
}

function drawDisc(targetGraphics) {
  targetGraphics.clear();
  targetGraphics.background(...COLORS.background);
  
  // Enhanced atmospheric lighting
  targetGraphics.ambientLight(40);  // Reduced ambient light for more drama
  
  // Primary cool light (main illumination)
  targetGraphics.pointLight(
    220, 225, 255,  // Cool white light
    200, -200, 300
  );
  
  // Secondary atmospheric light (depth enhancer)
  targetGraphics.pointLight(
    160, 180, 200,  // Soft blue atmospheric light
    -250, 150, -150
  );
  
  // Rim light for separation from background
  targetGraphics.pointLight(
    140, 160, 180,  // Cool rim light
    0, -250, -200
  );
  
  // Subtle ground reflection
  targetGraphics.pointLight(
    20, 25, 35,    // Very subtle background colored bounce
    0, 300, -100
  );
  
  // Add patina effect to the disc material with enhanced contrast
  const patinaNoiseScale = 0.01;
  const patinaTimeScale = 5;
  const discColor = [...COLORS.disc];
  
  targetGraphics.push();
  targetGraphics.rotateX(state.angle);

  // Back face (bird)
  targetGraphics.push();
  targetGraphics.translate(0, 0, -DISC_THICKNESS/2 - 0.1);
  targetGraphics.rotateX(PI);
  drawFace(targetGraphics, 0, 'bird');
  targetGraphics.pop();

  // Enhanced disc edge with richer patina
  targetGraphics.push();
  const patina = sin(state.angle * patinaTimeScale) * 0.15 + 
                 noise(frameCount * patinaNoiseScale) * 0.4;
  const patinaColor = [
    discColor[0] * (1 + patina * 0.5),
    discColor[1] * (0.95 + patina * 0.3),
    discColor[2] * (0.9 + patina * 0.2),
    220
  ];
  
  targetGraphics.fill(...patinaColor);
  targetGraphics.specularMaterial(70);
  targetGraphics.shininess(100);
  targetGraphics.cylinder(DISC_RADIUS, DISC_THICKNESS, 64, 1, false, false);
  targetGraphics.pop();

  // Front face (cage)
  drawFace(targetGraphics, DISC_THICKNESS/2 + 0.1, 'cage');
  targetGraphics.pop();
}

function drawFace(pg, zOffset, side) {
  pg.push();
  pg.translate(0, 0, zOffset);
  
  const scaleEffect = map(sin(frameCount * 0.05), -1, 1, 0.98, 1.02);
  pg.scale(scaleEffect);
  
  // Enhanced gradient background with brighter accent
  pg.push();
  pg.noStroke();
  const steps = 30;
  for (let i = steps; i > 0; i--) {
    const r = DISC_RADIUS * (i / steps);
    const inter = i / steps;
    const c = lerpColor(
      color(...COLORS.disc, 230),
      color(...COLORS.accent, 180),
      inter * 0.4
    );
    pg.fill(c);
    pg.circle(0, 0, r * 2);
  }
  pg.pop();
  
  // Draw appropriate symbol based on side
  pg.push();
  pg.translate(0, 0, 1.5);
  if (side === 'bird') {
    // Bird on back face - no rotation needed
    drawBird(pg);
  } else if (side === 'cage') {
    // Cage on front face - rotate 180 degrees
    pg.rotate(PI);
    drawCage(pg);
  }
  pg.pop();
  
  pg.pop();
}

function drawBird(pg) {
  pg.push();
  pg.noStroke();
  
  // Add subtle shadow for depth
  pg.push();
  pg.translate(2, 2, -0.1);
  pg.fill(0, 0, 0, 30);
  drawBirdShape(pg);
  pg.pop();
  
  // Main bird with enhanced color
  pg.fill(...COLORS.bird, 255);
  drawBirdShape(pg);
  
  pg.pop();
}

// New helper function to avoid code duplication
function drawBirdShape(pg) {
  // Body
  pg.beginShape();
  pg.vertex(-20, 0);
  pg.bezierVertex(-10, 25, 35, 25, 40, 0);  // Flipped Y from -25 to 25
  pg.bezierVertex(45, -15, 35, -25, 20, -25);  // Flipped Y coordinates
  pg.bezierVertex(0, -25, -25, -15, -20, 0);  // Flipped Y coordinates
  pg.endShape(CLOSE);
  
  // Head
  pg.ellipse(-25, 15, 30, 25);  // Flipped Y from -15 to 15
  
  // Eye
  pg.fill(...COLORS.background);
  pg.ellipse(-30, 17, 8, 8);  // Flipped Y from -17 to 17
  pg.fill(...COLORS.bird);
  pg.ellipse(-30, 17, 4, 4);  // Flipped Y from -17 to 17
  
  // Beak
  pg.push();
  pg.translate(-40, 15);  // Flipped Y from -15 to 15
  pg.rotate(0.2);  // Changed rotation from -0.2 to 0.2 to maintain proper beak angle
  pg.fill(...COLORS.bird);
  pg.triangle(0, 0, -15, 3, 0, -5);  // Flipped Y coordinates
  pg.pop();
  
  // Wing animation
  pg.push();
  const wingFlap = sin(frameCount * 0.08) * 0.15;
  pg.translate(5, 5);  // Flipped Y from -5 to 5
  pg.rotate(-wingFlap);  // Inverted wingFlap rotation
  pg.beginShape();
  pg.vertex(0, 0);
  pg.bezierVertex(15, 30, 40, 20, 20, 0);  // Flipped Y coordinates from -30/-20 to 30/20
  pg.endShape(CLOSE);
  pg.pop();
}

function drawCage(pg) {
  pg.push();
  
  // Enhanced cage parameters
  const cageWidth = 120;
  const cageHeight = 160;
  const baseHeight = cageHeight * 0.9; // Slightly shorter than dome top
  const verticalBars = 9;
  const horizontalRings = 6;
  
  // Main structure
  pg.push();
  pg.stroke(...COLORS.cage);
  pg.strokeWeight(2);
  pg.noFill();
  
  // Draw curved vertical bars
  for (let i = 0; i < verticalBars; i++) {
    const angle = map(i, 0, verticalBars - 1, -PI/3, PI/3);
    pg.beginShape();
    for (let y = -baseHeight/2; y <= baseHeight/2; y += 5) {
      // Add gentle curve to bars
      const curveAmount = sin(map(y, -baseHeight/2, baseHeight/2, 0, PI)) * 8;
      const x = map(i, 0, verticalBars - 1, -cageWidth/2, cageWidth/2);
      const curvedX = x + curveAmount * sin(angle);
      pg.vertex(curvedX, y);
    }
    pg.endShape();
  }
  
  // Draw horizontal rings with varying spacing
  for (let i = 0; i < horizontalRings; i++) {
    // Non-linear spacing for rings
    const t = i / (horizontalRings - 1);
    const y = map(pow(t, 1.2), 0, 1, -baseHeight/2, baseHeight/2);
    const ringWidth = cageWidth * (1 - abs(y) / baseHeight * 0.15); // Slight taper
    const squash = 0.3 - abs(y) / baseHeight * 0.1; // Varying perspective
    pg.ellipse(0, y, ringWidth, ringWidth * squash);
  }
  
  // Draw ornate domed top
  pg.push();
  pg.translate(0, -baseHeight/2);
  // Main dome curve
  pg.beginShape();
  for (let angle = -PI; angle <= 0; angle += 0.1) {
    const x = cos(angle) * cageWidth/2;
    const y = sin(angle) * cageHeight/4;
    pg.vertex(x, y);
  }
  pg.endShape();
  
  // Decorative top finial
  pg.push();
  pg.translate(0, -cageHeight/4);
  pg.line(0, 0, 0, -20);
  // Ornate loop
  pg.beginShape();
  for (let angle = 0; angle <= TWO_PI; angle += 0.1) {
    const x = cos(angle) * 8;
    const y = sin(angle) * 12 - 25;
    pg.vertex(x, y);
  }
  pg.endShape(CLOSE);
  pg.pop();
  pg.pop();
  
  // Draw stable base
  pg.push();
  pg.translate(0, baseHeight/2);
  const baseWidth = cageWidth * 1.1;
  // Main base ring
  pg.ellipse(0, 0, baseWidth, baseWidth * 0.3);
  // Decorative foot
  pg.ellipse(0, 8, baseWidth * 0.8, baseWidth * 0.25);
  pg.ellipse(0, 12, baseWidth * 0.6, baseWidth * 0.2);
  pg.pop();
  
  // Draw door with frame
  pg.push();
  const doorWidth = cageWidth/4;
  const doorHeight = baseHeight/3;
  pg.translate(-cageWidth/4, 0);
  
  // Door frame
  pg.beginShape();
  pg.vertex(-doorWidth/2, -doorHeight/2);
  pg.vertex(doorWidth/2, -doorHeight/2);
  pg.vertex(doorWidth/2, doorHeight/2);
  pg.vertex(-doorWidth/2, doorHeight/2);
  pg.endShape(CLOSE);
  
  // Door details
  pg.strokeWeight(1.5);
  // Vertical bars in door
  for (let i = 0; i < 3; i++) {
    const x = map(i, 0, 2, -doorWidth/2 + 5, doorWidth/2 - 5);
    pg.line(x, -doorHeight/2 + 5, x, doorHeight/2 - 5);
  }
  // Horizontal bars in door
  for (let i = 0; i < 3; i++) {
    const y = map(i, 0, 2, -doorHeight/2 + 5, doorHeight/2 - 5);
    pg.line(-doorWidth/2 + 5, y, doorWidth/2 - 5, y);
  }
  
  // Door hinges
  pg.strokeWeight(2);
  const hingeSize = 4;
  for (let y of [-doorHeight/3, doorHeight/3]) {
    pg.push();
    pg.translate(-doorWidth/2, y);
    pg.ellipse(0, 0, hingeSize);
    pg.pop();
  }
  
  // Door latch
  pg.push();
  pg.translate(doorWidth/2, 0);
  pg.line(0, -hingeSize, 0, hingeSize);
  pg.ellipse(0, 0, hingeSize);
  pg.pop();
  pg.pop();
  
  // Add perch
  pg.push();
  pg.translate(0, baseHeight/4);
  pg.strokeWeight(2.5);
  pg.line(-cageWidth/4, 0, cageWidth/4, 0);
  // Perch supports
  pg.strokeWeight(1.5);
  const supportAngle = PI/6;
  pg.line(-cageWidth/4, 0, -cageWidth/4 + cos(supportAngle) * 15, sin(supportAngle) * 15);
  pg.line(cageWidth/4, 0, cageWidth/4 - cos(supportAngle) * 15, sin(supportAngle) * 15);
  pg.pop();
  
  pg.pop();
}

function renderMotionBlur() {
  // Clear buffers
  shaderBuffer.clear();
  effectBuffer.clear();
  
  // Enhanced motion blur with better frame blending
  effectBuffer.push();
  blurFrames.forEach((frame, i) => {
    const progress = i / (blurFrames.length - 1);
    // Enhanced alpha curve for better persistence
    let alpha = map(
      pow(1 - progress, 1.5), // Adjusted power curve for longer trails
      0, 1,
      100, 255
    );
    // Increase opacity when spinning fast
    alpha *= map(state.spinSpeed, 0, MAX_SPIN_SPEED, 0.5, 1.2);
    effectBuffer.tint(255, alpha);
    effectBuffer.image(frame, -width/2, -height/2);
  });
  effectBuffer.pop();
  
  // Apply enhanced bloom shader
  shaderBuffer.push();
  shaderBuffer.shader(bloomShader);
  
  // Enhanced shader uniforms for better visual mixing
  bloomShader.setUniform('tex0', effectBuffer);
  bloomShader.setUniform('resolution', [width, height]);
  // Dynamic bloom strength based on speed
  const bloomAmount = map(
    state.spinSpeed,
    0, MAX_SPIN_SPEED,
    0.15, 0.4
  );
  bloomShader.setUniform('bloomStrength', state.spinning ? bloomAmount : 0.15);
  bloomShader.setUniform('discRadius', DISC_RADIUS * 2.0);
  bloomShader.setUniform('time', frameCount * 0.01);
  
  // Draw shader effect
  shaderBuffer.rect(-width/2, -height/2, width, height);
  shaderBuffer.resetShader();
  shaderBuffer.pop();
  
  // Apply final composite to main canvas
  push();
  blendMode(BLEND);
  image(shaderBuffer, -width/2, -height/2);
  // Add extra motion trails when spinning fast
  if (state.spinSpeed > MAX_SPIN_SPEED * 0.7) {
    blendMode(SCREEN);
    tint(255, 40);
    image(effectBuffer, -width/2, -height/2);
  }
  pop();
}

function toggleSpin() {
  state.spinning = !state.spinning;
}

function resetRotation() {
  state.isResetting = true;
  state.spinning = false;
  state.ease = 0;
  // Reset strings
  state.strings.left.targetPull = 0;
  state.strings.right.targetPull = 0;
  state.strings.left.pullAmount = 0;
  state.strings.right.pullAmount = 0;
  state.strings.left.velocity = 0;
  state.strings.right.velocity = 0;
  // Clear motion blur frames
  blurFrames.forEach(frame => {
    frame.clear();
    drawDisc(frame);
  });
}

function keyPressed() {
  if (key === 'r' || key === 'R') resetRotation();
}

function updateSpring() {
  const k = 0.3; // spring constant
  const d = 0.85; // damping
  const force = (state.spring.target - state.spring.position) * k;
  state.spring.velocity += force;
  state.spring.velocity *= d;
  state.spring.position += state.spring.velocity;
  return state.spring.position;
}

function mouseDragged() {
  if (state.spinning) return;
  
  const mouseXRelative = mouseX - width/2;
  const mouseYRelative = mouseY - height/2;
  
  // Define interaction zones near canvas edges
  const edgeZone = 100; // Width of the interaction zone from edges
  const leftEdge = -width/2;
  const rightEdge = width/2;
  
  // Check if mouse is in either edge zone
  const inLeftZone = mouseXRelative < leftEdge + edgeZone;
  const inRightZone = mouseXRelative > rightEdge - edgeZone;
  
  if (inLeftZone) {
    // Calculate pull amount based on distance from edge
    const pullAmount = map(
      mouseXRelative,
      leftEdge,
      leftEdge + edgeZone,
      PULL_DISTANCE,
      0
    );
    state.strings.left.targetPull = constrain(pullAmount, 0, PULL_DISTANCE);
  }
  
  if (inRightZone) {
    // Calculate pull amount based on distance from edge
    const pullAmount = map(
      mouseXRelative,
      rightEdge - edgeZone,
      rightEdge,
      0,
      PULL_DISTANCE
    );
    state.strings.right.targetPull = constrain(pullAmount, 0, PULL_DISTANCE);
  }
  
  // Add slight vertical movement based on mouse Y position
  const verticalInfluence = map(mouseYRelative, -height/2, height/2, -20, 20);
  if (inLeftZone) {
    state.strings.left.points.forEach(point => {
      point.y += verticalInfluence * 0.1 * (1 - state.strings.left.pullAmount/PULL_DISTANCE);
    });
  }
  if (inRightZone) {
    state.strings.right.points.forEach(point => {
      point.y += verticalInfluence * 0.1 * (1 - state.strings.right.pullAmount/PULL_DISTANCE);
    });
  }
}

function mouseReleased() {
  // Release strings when mouse is released
  state.strings.left.targetPull = 0;
  state.strings.right.targetPull = 0;
}