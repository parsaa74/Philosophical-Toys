import p5Types from 'p5';

export function generatePraxinoscopeFrames(p5: p5Types, frameCount: number = 12): Promise<p5Types.Image[]> {
  const frames: Promise<p5Types.Image>[] = [];
  const size = 100;

  for (let i = 0; i < frameCount; i++) {
    // Create a new graphics buffer for each frame
    const buffer = p5.createGraphics(size, size);
    buffer.background(255);
    
    // Calculate animation parameters
    const angle = (i / frameCount) * p5.TWO_PI;
    const x = size/2 + p5.cos(angle) * 20;
    const y = size/2 + p5.sin(angle) * 20;
    
    // Draw a simple bouncing ball animation
    buffer.noStroke();
    buffer.fill(50);
    buffer.circle(x, y, 30);
    
    // Add frame number for reference
    buffer.textSize(12);
    buffer.textAlign(p5.CENTER, p5.CENTER);
    buffer.text(i + 1, size/2, size - 15);
    
    // Convert graphics to image
    const frame = new Promise<p5Types.Image>((resolve) => {
      const img = p5.createImage(size, size);
      img.copy(buffer, 0, 0, size, size, 0, 0, size, size);
      resolve(img);
    });
    
    frames.push(frame);
    buffer.remove();
  }

  return Promise.all(frames);
}

export default generatePraxinoscopeFrames; 