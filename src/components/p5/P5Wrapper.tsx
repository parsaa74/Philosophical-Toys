import React, { useRef, useEffect, useState, useCallback } from 'react';

// Define specific types for p5 constants
export type P5RectMode = 'corner' | 'corners' | 'center' | 'radius';
export type P5TextAlignHorizontal = 'left' | 'center' | 'right';
export type P5TextAlignVertical = 'top' | 'bottom' | 'center' | 'baseline';
export type P5TextStyle = 'normal' | 'italic' | 'bold' | 'bolditalic';

// Define p5 types specific to this wrapper
export interface P5 {
  // Constants
  CENTER: 'center';
  HALF_PI: number;
  PI: number;
  TWO_PI: number;
  NORMAL: P5TextStyle;

  // Core properties
  width: number;
  height: number;
  frameCount: number;
  canvas?: HTMLCanvasElement; // Add the canvas property (might be undefined initially)
  mouseX: number;
  mouseY: number;
  key: string;

  // Core functions (ensure all used ones are listed)
  loadSound: (path: string, successCallback?: () => void) => SoundFile;
  loadFont: (path: string) => FontFace | string;
  createCanvas: (width: number, height: number, renderer?: 'p2d' | 'webgl') => { parent: (parent: Element | string) => void }; // p5.Renderer, simplified
  createSlider: (min: number, max: number, value?: number, step?: number) => P5Element;
  createButton: (label: string, value?: string) => P5Element;
  rectMode: (mode: P5RectMode) => void;
  textAlign: (horizontalAlign: P5TextAlignHorizontal, verticalAlign?: P5TextAlignVertical) => void;
  frameRate: (rate?: number) => number | void;
  getFrameRate?: () => number;
  background: (...args: number[] | [string]) => void; // Allow color string too
  translate: (x: number, y: number, z?: number) => void;
  noise: (x: number, y?: number, z?: number) => number;
  // p5.random can take 1 arg (max), 2 args (min, max), or an array
  random: ((max?: number) => number) & ((min: number, max: number) => number) & (<T>(choices: T[]) => T);
  floor: (n: number) => number;
  fill: (...args: number[] | [string] | [number[], number?] | [string, number?]) => void; // Various fill overloads
  noStroke: () => void;
  push: () => void;
  rotate: (angle: number, axis?: any) => void; // Allow 'any' for axis (p5.Vector or array)
  ellipse: (x: number, y: number, w: number, h?: number) => void;
  pop: () => void;
  strokeWeight: (weight: number) => void;
  rect: (x: number, y: number, w: number, h?: number, tl?: number, tr?: number, br?: number, bl?: number) => void;
  stroke: (...args: number[] | [string] | [number[], number?] | [string, number?]) => void; // Various stroke overloads
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  triangle: (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => void;
  noFill: () => void;
  textSize: (size: number) => void;
  text: (str: string | number | boolean | object, x: number, y: number, x2?: number, y2?: number) => void; // `str` can be various types
  textFont: (font: FontFace | string | object) => void;
  arc: (x: number, y: number, w: number, h: number, start: number, stop: number, mode?: 'open' | 'chord' | 'pie') => void;
  textStyle: (style: P5TextStyle) => void;
  save: (filename?: string, extension?: string) => void;
  month: () => number;
  day: () => number;
  hour: () => number;
  minute: () => number;
  second: () => number;
  saveCanvas: (canvas: HTMLCanvasElement | any, filename?: string, extension?: string) => void; // Add saveCanvas method
  resizeCanvas: (width: number, height: number) => void; // Add resizeCanvas method
  constrain: (n: number, low: number, high: number) => number;
  dist: (x1: number, y1: number, x2: number, y2: number) => number;
  scale: (x: number, y?: number) => void;

  // Optional lifecycle methods
  preload?: () => void;
  setup?: () => void;
  draw?: () => void;
  mousePressed?: () => void | boolean;
  mouseDragged?: () => void | boolean;
  mouseReleased?: () => void | boolean;
  keyPressed?: () => void | boolean;
  windowResized?: () => void; // Add windowResized for responsive handling
}

// Define sound file interface
export interface SoundFile {
  play: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  isPlaying: () => boolean;
}

// Define P5 element interface
export interface P5Element {
  position: (x: number, y: number) => P5Element;
  style: (property: string, value: string) => P5Element;
  value: () => number | string;
  input: (callback: () => void) => P5Element;
  mousePressed: (callback: () => void) => P5Element;
}

interface P5WrapperProps {
  sketch: (p: P5) => void; // Use our local P5 interface
  className?: string; // Add className prop for custom styling
  aspectRatio?: number; // Add aspect ratio for responsive sizing
}

// Manually create audio elements to bypass p5.sound issues
const createAudio = (path: string): HTMLAudioElement => {
  const audio = new Audio(path);
  audio.preload = 'auto';
  audio.load();
  return audio;
};

// Cache audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

// Cache font objects
const fontCache: Record<string, FontFace | string> = {};
const FONT_FAMILY_NAME = 'ArchitectsDaughter';

// Preload all sound files used in the animation
const preloadAudioFiles = (): Promise<void> => {
  const soundFiles = [
    '/sounds/film.mp3',
    '/sounds/twopop.mp3',
    '/sounds/crackle.mp3'
  ];

  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalSounds = soundFiles.length;
    if (totalSounds === 0) {
      resolve();
      return;
    }

    soundFiles.forEach(path => {
      if (!audioCache[path]) {
        const audio = createAudio(path);

        // Set up load handlers
        audio.addEventListener('canplaythrough', () => {
          loadedCount++;
          if (loadedCount >= totalSounds) {
            resolve();
          }
        }, { once: true });

        // Handle error case (consider it loaded to avoid hanging)
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to preload audio: ${path}`, e);
          loadedCount++;
          if (loadedCount >= totalSounds) {
            resolve();
          }
        }, { once: true });

        // Start loading
        try {
          audio.load();
        } catch (err) {
           console.warn(`Error calling load() on audio ${path}`, err);
           loadedCount++;
           if (loadedCount >= totalSounds) {
             resolve();
           }
        }
        audioCache[path] = audio;
      } else {
        // Already loaded
        loadedCount++;
        if (loadedCount >= totalSounds) {
          resolve();
        }
      }
    });

    // Fallback resolve after 5 seconds to prevent hanging if audio loading fails
    setTimeout(() => {
      if (loadedCount < totalSounds) {
          console.warn('Audio preload timed out.');
          resolve(); // Resolve anyway to avoid blocking
      }
    }, 5000);
  });
};

// Preload the font file
const preloadFontFile = (fontPath: string, fontFamily: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!fontCache[fontPath]) {
      const fontFace = new FontFace(fontFamily, `url(${fontPath})`);
      fontCache[fontPath] = fontFace; // Store FontFace object

      fontFace.load()
        .then((loadedFont) => {
          document.fonts.add(loadedFont);
          console.log(`Font ${fontFamily} loaded from ${fontPath}`);
          resolve();
        })
        .catch((error) => {
          console.warn(`Failed to load font: ${fontPath}`, error);
          fontCache[fontPath] = 'sans-serif'; // Fallback font family
          resolve(); // Resolve even on error
        });
    } else {
      resolve(); // Already loaded or loading
    }

    // Fallback resolve after 5 seconds
    setTimeout(() => {
       if (!(fontCache[fontPath] instanceof FontFace && fontCache[fontPath].status === 'loaded')) {
         console.warn('Font preload timed out.');
         fontCache[fontPath] = 'sans-serif'; // Fallback
         resolve();
       }
    }, 5000);
  });
};

const P5Wrapper: React.FC<P5WrapperProps> = ({ sketch, className = '', aspectRatio }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const p5InstanceRef = useRef<any>(null); // Store p5 instance for resizing

  // Update dimensions based on container size and aspect ratio
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let width = rect.width || 800;
    let height = rect.height || 600;
    
    // Apply aspect ratio if provided
    if (aspectRatio && aspectRatio > 0) {
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }
    
    setDimensions({ width: Math.max(200, width), height: Math.max(150, height) });
  }, [aspectRatio]);

  // Set up ResizeObserver for responsive behavior
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [updateDimensions]);

  // Initial dimension calculation
  useEffect(() => {
    updateDimensions();
  }, [updateDimensions]);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('P5Wrapper: useEffect started.');
    let instance: any = null;

    const initializeP5 = () => {
      console.log('P5Wrapper: ---> initializeP5 START');
      const p5Constructor = (window as any).p5;
      if (!p5Constructor) {
        console.error('P5Wrapper: ERROR - window.p5 constructor is not defined!');
        setLoading(false);
        return;
      }
      if (!containerRef.current) {
         console.error('P5Wrapper: ERROR - containerRef.current is null in initializeP5!');
         setLoading(false);
         return;
      }

      try {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          console.log(`P5Wrapper: containerRef dimensions before p5 init: W=${rect.width}, H=${rect.height}`);
        } else {
          console.warn('P5Wrapper: containerRef.current is null just before p5 init attempt inside try block.');
        }
        console.log('P5Wrapper: Creating p5 instance...');
        instance = new p5Constructor((p: P5) => {
          console.log('P5Wrapper: ---> p5 instance sketch callback START');

          // Store instance reference for resizing
          p5InstanceRef.current = instance;

          // Add responsive resize capability
          p.windowResized = function() {
            updateDimensions();
            if (p.resizeCanvas && dimensions.width && dimensions.height) {
              p.resizeCanvas(dimensions.width, dimensions.height);
            }
          };

          // Add custom loadSound implementation
          p.loadSound = function(path: string, successCallback?: () => void): SoundFile {
            if (!audioCache[path]) {
              console.warn(`Audio ${path} accessed before preload complete. Creating on demand.`);
              audioCache[path] = createAudio(path);
            }
            const audio = audioCache[path];
            const soundFile: SoundFile = {
              play: () => {
                audio.currentTime = 0;
                audio.play().catch(err => console.warn(`Failed to play sound: ${path}`, err));
              },
              stop: () => {
                audio.pause();
                audio.currentTime = 0;
              },
              setVolume: (vol: number) => {
                audio.volume = Math.max(0, Math.min(1, vol));
              },
              isPlaying: () => !audio.paused && audio.currentTime > 0 && !audio.ended
            };
            if (successCallback) {
              setTimeout(successCallback, 0);
            }
            return soundFile;
          };

          // Custom loadFont implementation
          p.loadFont = function(path: string): FontFace | string {
             if (!fontCache[path]) {
               console.warn(`Font ${path} accessed before preload complete. Using fallback.`);
               return 'sans-serif';
             }
             return fontCache[path];
          };

          // Add getFrameRate implementation manually if p5 instance doesn't have it
          if (typeof (p as any).getFrameRate !== 'function') {
              let currentFrameRate = 60; // Default
              const p5Instance = p as any;

              const originalFrameRate = p5Instance.frameRate;
              p5Instance.frameRate = function(fps?: number) {
                if (typeof fps === 'number') {
                    currentFrameRate = fps;
                    return originalFrameRate?.call(p5Instance, fps);
                }
                return currentFrameRate;
              };

              p5Instance.getFrameRate = function() {
                  return currentFrameRate ?? originalFrameRate?.call(p5Instance);
              };
          }

          console.log('P5Wrapper: Executing provided sketch function...');
          sketch(p);
          console.log('P5Wrapper: ---> p5 instance sketch callback END');
        }, containerRef.current);

        console.log('P5Wrapper: ---> initializeP5 END - Instance created. Setting loading to false.');
        setLoading(false);
        console.log('P5Wrapper: setLoading(false) CALLED after instance creation.');
      } catch (err) {
         console.error('P5Wrapper: ERROR creating p5 instance or running sketch callback:', err);
         setLoading(false);
         console.log('P5Wrapper: setLoading(false) CALLED due to error in instance creation.');
      }
    };

    // Load p5.js script and assets
    if (!scriptLoadedRef.current && typeof window !== 'undefined') {
      console.log('P5Wrapper: Initial load path (script not loaded)');
      scriptLoadedRef.current = true;
      setLoading(true);

      const loadScript = (src: string): Promise<void> => {
        console.log(`P5Wrapper: Loading script: ${src}`);
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => {
             console.log(`P5Wrapper: Script loaded successfully: ${src}`);
             resolve();
          };
          script.onerror = (err) => {
             console.error(`P5Wrapper: FAILED to load script: ${src}`, err);
             reject(err);
          };
          document.head.appendChild(script);
        });
      };

      console.log('P5Wrapper: Starting resource preloading...');
      const p5Src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.js';
      const fontPath = '/fonts/architect.ttf';

      console.log('P5Wrapper: Calling Promise.all for preload...');
      Promise.all([
        preloadAudioFiles().then(() => console.log('P5Wrapper: preloadAudioFiles RESOLVED')),
        preloadFontFile(fontPath, FONT_FAMILY_NAME).then(() => console.log('P5Wrapper: preloadFontFile RESOLVED'))
      ])
        .then(() => {
          console.log('P5Wrapper: ---> Promise.all RESOLVED. Loading p5 script...');
          return loadScript(p5Src);
        })
        .then(() => {
          console.log('P5Wrapper: ---> p5 script loaded. Scheduling initializeP5...');
          setTimeout(initializeP5, 100); // Short delay to ensure p5 is globally available
        })
        .catch(err => {
          console.error('P5Wrapper: ERROR in Promise chain (preload/script load):', err);
          setLoading(false);
          console.log('P5Wrapper: setLoading(false) CALLED due to error in promise chain.');
        });
    } else if ((window as any).p5) { // Use 'any' for subsequent load check
      console.log('P5Wrapper: Subsequent load path (p5 already loaded)');
      // If p5 is already loaded (e.g., HMR or StrictMode double render)
      console.log('P5Wrapper: Calling Promise.all for preload (direct)...');
      Promise.all([
        preloadAudioFiles().then(() => console.log('P5Wrapper: preloadAudioFiles RESOLVED (direct)')),
        preloadFontFile('/fonts/architect.ttf', FONT_FAMILY_NAME).then(() => console.log('P5Wrapper: preloadFontFile RESOLVED (direct)'))
      ]).then(() => {
        console.log('P5Wrapper: ---> Preloading finished (direct). Calling initializeP5...');
        // Need to ensure we don't create duplicate instances if cleanup didn't run fully
        if (!instance) {
           initializeP5();
        } else {
           console.log('P5Wrapper: Instance already exists, skipping direct initialization.');
        }
      }).catch(err => {
        console.error('P5Wrapper: ERROR during direct initialization preloading:', err);
        setLoading(false);
        console.log('P5Wrapper: setLoading(false) CALLED due to error in direct init preloading.');
      });
    } else {
       console.log('P5Wrapper: Condition not met for loading/initialization (window.p5 check failed?).');
    }

    // Cleanup function on unmount
    return () => {
      console.log('P5Wrapper: ---> useEffect cleanup START');
      const inst = instance as any; // Accept 'any' for cleanup instance check
      if (inst && typeof inst.remove === 'function') {
        console.log('P5Wrapper: Removing p5 instance.');
        inst.remove();
        instance = null;
      } else {
         console.log('P5Wrapper: No p5 instance to remove or remove function missing.');
      }

      console.log('P5Wrapper: Stopping audio playback.');
      Object.values(audioCache).forEach(audio => {
        if (audio && typeof audio.pause === 'function') {
           audio.pause();
           audio.currentTime = 0;
        }
      });
      console.log('P5Wrapper: ---> useEffect cleanup END');
    };
  }, [sketch]); // Dependency array includes sketch

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        width: '100%', 
        height: '100%',
        minWidth: dimensions.width,
        minHeight: dimensions.height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Show loading overlay while loading state is true */}
      {loading && (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#000', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '300px'
        }}>
          <span style={{ color: '#555' }}>Loading...</span>
        </div>
      )}
      {/* The div referenced by containerRef is where p5 canvas will be attached */}
    </div>
  );
};

export default P5Wrapper;