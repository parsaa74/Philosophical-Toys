/**
 * p5CleanupHelper.ts
 * Utility functions to properly clean up p5.js resources and prevent WebGL context leaks
 */

import type p5Types from 'p5';

/**
 * Safely removes a p5 instance and cleans up associated resources
 */
const removeP5Instance = (p5Instance: p5Types | null): void => {
  if (!p5Instance) return;
  
  try {
    // Stop the animation loop
    p5Instance.noLoop();
    
    // Remove the canvas from the DOM
    const canvas = (p5Instance as any).canvas as HTMLCanvasElement;
    if (canvas && canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
    
    // Call p5's built-in remove() method
    if (typeof p5Instance.remove === 'function') {
      p5Instance.remove();
    }
  } catch (err) {
    console.error('Error cleaning up p5 instance:', err);
  }
};

/**
 * Safely removes a canvas element from its parent
 */
const removeCanvasFromDOM = (parent: HTMLElement | null): void => {
  if (!parent) return;
  
  // Find all canvas elements inside the parent
  const canvases = parent.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    if (canvas && canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
  });
};

/**
 * Cleans up a p5.Graphics object and releases WebGL resources
 */
const cleanupGraphics = (graphics: p5Types.Graphics | null): void => {
  if (!graphics) return;
  
  try {
    // Remove any event listeners that might be attached
    const canvas = (graphics as any).canvas as HTMLCanvasElement;
    if (canvas) {
      const events = [
        'click', 'dblclick', 'mousedown', 'mousemove', 'mouseup',
        'mouseenter', 'mouseleave', 'touchstart', 'touchmove', 'touchend'
      ];
      
      events.forEach(event => {
        canvas.removeEventListener(event, () => {});
      });
    }
    
    // Check if graphics has a WebGL context
    const gl = (graphics as any)._renderer?.GL as WebGLRenderingContext | null;
    
    if (gl) {
      // Get all textures and buffers from the WebGL context
      const textures = gl.getParameter(gl.TEXTURE_BINDING_2D);
      if (textures) {
        gl.deleteTexture(textures);
      }
      
      // Attempt to lose the context (this helps release resources)
      const extension = gl.getExtension('WEBGL_lose_context');
      if (extension) {
        extension.loseContext();
      }
    }
    
    // Remove the graphics object
    (graphics as any).remove?.();
    
    // Explicitly set to null to aid garbage collection
    if ((graphics as any)._renderer) {
      (graphics as any)._renderer = null;
    }
  } catch (err) {
    console.error('Error cleaning up graphics:', err);
  }
};

/**
 * Advanced cleanup for WebGL-specific resources
 */
const cleanupWebGL = (p5Instance: p5Types): void => {
  try {
    // Access the renderer
    const renderer = (p5Instance as any)._renderer;
    if (!renderer || !renderer.GL) return;
    
    const gl = renderer.GL as WebGLRenderingContext;
    
    // Delete all textures
    const textures = gl.getParameter(gl.TEXTURE_BINDING_2D);
    if (textures) {
      gl.deleteTexture(textures);
    }
    
    // Delete all buffers
    const buffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    if (buffer) {
      gl.deleteBuffer(buffer);
    }
    
    // Delete all shaders and programs
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    if (program) {
      gl.deleteProgram(program);
    }
    
    // Lose the WebGL context explicitly
    const extension = gl.getExtension('WEBGL_lose_context');
    if (extension) {
      extension.loseContext();
    }
    
    // Clear any references to the renderer
    (p5Instance as any)._renderer = null;
  } catch (err) {
    console.error('Error cleaning up WebGL resources:', err);
  }
};

const p5CleanupHelper = {
  removeP5Instance,
  removeCanvasFromDOM,
  cleanupGraphics,
  cleanupWebGL
};

export default p5CleanupHelper; 