import React, { useEffect, useRef } from 'react';

// Utility to generate random scratches
function randomScratches(width: number, height: number, count: number) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = x1 + (Math.random() - 0.5) * width * 0.2;
    const y2 = y1 + (Math.random() - 0.5) * height * 0.2;
    lines.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#fff"
        strokeWidth={Math.random() * 0.7 + 0.2}
        opacity={Math.random() * 0.18 + 0.05}
        strokeLinecap="round"
      />
    );
  }
  return lines;
}

// Utility to generate an irregular edge path
function edgeWearPath(width: number, height: number) {
  // Top edge
  let path = `M0,0 `;
  for (let x = 0; x <= width; x += width / 16) {
    const y = Math.random() * 4;
    path += `L${x},${y} `;
  }
  // Right edge
  for (let y = 0; y <= height; y += height / 8) {
    const x = width - Math.random() * 4;
    path += `L${x},${y} `;
  }
  // Bottom edge
  for (let x = width; x >= 0; x -= width / 16) {
    const y = height - Math.random() * 4;
    path += `L${x},${y} `;
  }
  // Left edge
  for (let y = height; y >= 0; y -= height / 8) {
    const x = Math.random() * 4;
    path += `L${x},${y} `;
  }
  path += 'Z';
  return path;
}

const FilmstripOverlaySVG: React.FC<{ width?: number; height?: number }> = ({ width = 800, height = 400 }) => {
  const grainRef = useRef<SVGRectElement>(null);

  // Animate grain by shifting the filter seed
  useEffect(() => {
    let frame = 0;
    let running = true;
    function animate() {
      if (grainRef.current) {
        grainRef.current.setAttribute('filter', `url(#grain${frame % 3})`);
      }
      frame++;
      if (running) requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, []);

  // Generate new scratches and edge wear on each mount
  const scratches = randomScratches(width, height, 12);
  const edgeWear = edgeWearPath(width, height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000,
        mixBlendMode: 'screen',
      }}
    >
      {/* Animated grain using multiple filters */}
      <defs>
        <filter id="grain0">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="0"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.13"/>
          </feComponentTransfer>
        </filter>
        <filter id="grain1">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="1"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.13"/>
          </feComponentTransfer>
        </filter>
        <filter id="grain2">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="2"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.13"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <rect
        ref={grainRef}
        x={0}
        y={0}
        width={width}
        height={height}
        filter="url(#grain0)"
        opacity="0.18"
        style={{ transition: 'filter 0.2s' }}
      />
      {/* Scratches */}
      {scratches}
      {/* Edge wear */}
      <path
        d={edgeWear}
        fill="none"
        stroke="#fff"
        strokeWidth={2.2}
        opacity={0.09}
        style={{ mixBlendMode: 'screen' }}
      />
    </svg>
  );
};

export default FilmstripOverlaySVG; 