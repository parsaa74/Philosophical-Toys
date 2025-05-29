import React, { useMemo, memo, useEffect, useState } from 'react';

// Memoized film strip perforation component for better performance
const FilmStripPerforations = memo(({ count = 20 }: { count?: number }) => {
  // Pre-compute perforation positions for better performance
  const perforations = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => (
      <rect
        key={i}
        x={20 + i * 48}
        y={8}
        width={16}
        height={24}
        rx={4}
        fill="#fff"
        fillOpacity="0.18"
      />
    ));
  }, [count]);

  return <>{perforations}</>;
});

FilmStripPerforations.displayName = 'FilmStripPerforations';

// Memoized film strip component
const FilmStrip = memo(({ position }: { position: 'top' | 'bottom' }) => {
  return (
    <svg
      width="100%"
      height="40"
      viewBox="0 0 1000 40"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        [position]: 0,
        left: 0,
        width: '100%',
        height: 40,
        willChange: 'transform', // Optimize for GPU acceleration
      }}
    >
      <rect x="0" y="0" width="1000" height="40" fill="#222" fillOpacity="0.85" />
      <FilmStripPerforations />
    </svg>
  );
});

FilmStrip.displayName = 'FilmStrip';

// Memoized dust particles component
const DustParticles = memo(() => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 800"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        willChange: 'transform', // Optimize for GPU acceleration
        pointerEvents: 'none',
      }}
    >
      {/* Enhanced Dust & Scratches */}
      <circle cx="120" cy="100" r="2.2" fill="#fff" opacity="0.18">
        <animate attributeName="cy" values="100;700;50;750;100" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="cx" values="120;100;140;110;120" dur="4s" repeatCount="indefinite" />
      </circle>
      {/* Thin scratch 1 */}
      <rect x="800" y="200" width="1" height="80" fill="#fff" opacity="0.15" transform="rotate(5 800 200)">
        <animate attributeName="y" values="150;650;100;700;150" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <circle cx="500" cy="400" r="1.8" fill="#fff" opacity="0.16">
        <animate attributeName="cy" values="400;750;350;800;400" dur="2.9s" repeatCount="indefinite" />
      </circle>
      {/* Additional dust particle */}
      <circle cx="300" cy="600" r="1.2" fill="#fff" opacity="0.14">
        <animate attributeName="cy" values="600;100;650;50;600" dur="4.2s" repeatCount="indefinite" />
      </circle>
      {/* Thin scratch 2 (more subtle) */}
      <rect x="250" y="50" width="0.8" height="120" fill="#fff" opacity="0.10" transform="rotate(-3 250 50)">
        <animate attributeName="y" values="50;750;80;700;50" dur="4.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.10;0.03;0.10" dur="2s" repeatCount="indefinite" />
      </rect>
      {/* Larger, more diffuse "blotch" or chemical deterioration mark */}
      <ellipse cx="650" cy="300" rx="15" ry="8" fill="#fff" opacity="0.06">
        <animate attributeName="opacity" values="0.06;0.02;0.07;0.03;0.06" dur="5s" repeatCount="indefinite" />
        <animate attributeName="cx" values="650;630;670;640;650" dur="7s" repeatCount="indefinite" />
      </ellipse>
      {/* Small, quick flicker particle */}
      <circle cx="900" cy="700" r="1" fill="#fff" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.05;0.25;0.1;0.2" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="cy" values="700;680;720;690;700" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
});

DustParticles.displayName = 'DustParticles';

// Adaptive film effect that reduces effects on low-end devices
const AdaptiveFilmEffect = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // Check device performance on mount
  useEffect(() => {
    // Simple performance detection based on device memory and processor count
    // @ts-expect-error - navigator.deviceMemory is not in the standard TS types
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Set low performance mode if any conditions are met
    setIsLowPerformance(lowMemory || lowCPU || isMobile);
  }, []);

  // Simplified effect for low-performance devices
  if (isLowPerformance) {
    return (
      <div
        className="film-flicker-light"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, rgba(200,200,200,0.03) 40%, rgba(0,0,0,0.12) 100%)',
          animation: 'filmFlickerLight 1.8s infinite steps(1)',
          opacity: 0.55,
        }}
      />
    );
  }

  // Full effect for high-performance devices
  return (
    <div
      className="film-flicker"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(255,255,220,0.15) 0%, rgba(255,200,150,0.08) 30%, rgba(50,30,20,0.1) 70%, rgba(0,0,0,0.22) 100%)',
        animation: 'filmFlicker 1.0s infinite steps(2)', // Slightly faster flicker
        opacity: 0.75, // Base opacity slightly increased
        willChange: 'opacity', // Optimize for GPU acceleration
      }}
    />
  );
};

// Main film effect overlay component
const FilmEffectOverlay = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        mixBlendMode: 'screen',
        overflow: 'hidden', // Prevent any potential layout issues
      }}
    >
      <FilmStrip position="top" />
      <FilmStrip position="bottom" />
      <AdaptiveFilmEffect />
      <DustParticles />

      {/* CSS animations */}
      <style>{`
        @keyframes filmFlicker {
          0% { opacity: 0.75; }
          10% { opacity: 1.0; }  /* More intense peak */
          20% { opacity: 0.65; }
          30% { opacity: 0.9; }
          40% { opacity: 0.7; }
          50% { opacity: 1.1; } /* Strongest peak for light leak feel */
          60% { opacity: 0.6; }
          70% { opacity: 0.95; }
          80% { opacity: 0.75; }
          90% { opacity: 0.9; }
          100% { opacity: 0.75; }
        }

        @keyframes filmFlickerLight {
          0% { opacity: 0.55; }
          50% { opacity: 0.65; } /* Slightly more variation */
          100% { opacity: 0.55; }
        }

        /* Optimize animations for reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .film-flicker, .film-flicker-light {
            animation-duration: 4s !important;
          }
        }
      `}</style>
    </div>
  );
};

// Export memoized component for better performance
export default memo(FilmEffectOverlay);