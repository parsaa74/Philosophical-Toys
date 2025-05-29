"use client";
import React, { useMemo, memo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, PerformanceMonitor } from '@react-three/drei';

// Adaptive stars component that adjusts count based on device performance
const AdaptiveStars = () => {
  const [starCount, setStarCount] = useState(5000);
  const [isMobile, setIsMobile] = useState(false);

  // Check device on mount
  useEffect(() => {
    // Check if it's a mobile device
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(mobile);

    // Reduce star count on mobile devices by default
    if (mobile) {
      setStarCount(2000);
    }
  }, []);

  return (
    <PerformanceMonitor
      onDecline={() => {
        // Further reduce stars on performance issues
        setStarCount(prev => Math.max(1000, Math.floor(prev * 0.8)));
      }}
    >
      <Stars
        radius={100}
        depth={50}
        count={starCount}
        factor={4}
        saturation={0}
        fade
        speed={isMobile ? 0.5 : 1} // Reduce animation speed on mobile
      />
    </PerformanceMonitor>
  );
};

// Memoized background component for better performance
const Background = () => {
  // Memoize Canvas props
  const canvasProps = useMemo(() => ({
    gl: {
      alpha: true,
      antialias: false, // Disable antialiasing for background (not noticeable)
      powerPreference: 'default' as WebGLPowerPreference, // Use default power mode for background
      stencil: false,
      depth: false // Disable depth for simple background
    },
    camera: { position: [0, 0, 15] as [number, number, number] },
    frameloop: 'demand' as const, // Use on-demand rendering, type-safe
    dpr: [0.8, 1.5] as [number, number], // Lower resolution for background is fine
    className: "absolute inset-0 pointer-events-none"
  }), []);

  return (
    <Canvas {...canvasProps}>
      <ambientLight intensity={0.5} />
      <AdaptiveStars />
    </Canvas>
  );
};

export default memo(Background);