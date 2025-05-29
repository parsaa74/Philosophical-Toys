"use client";
import React, { Suspense, memo, useEffect, useState } from 'react';
import { Canvas, Props as CanvasProps, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import ErrorBoundary from '../ErrorBoundary';

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 text-white">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
      <p>Loading 3D scene...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 text-white p-4">
    <div className="text-center max-w-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 className="text-xl font-bold mb-2">3D Rendering Error</h3>
      <p>We encountered an issue rendering the 3D scene. This might be due to hardware limitations or browser compatibility.</p>
      <button
        className="mt-4 px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-200 transition-colors"
        onClick={() => window.location.reload()}
      >
        Reload Page
      </button>
    </div>
  </div>
);

// Detect if WebGL is supported
const isWebGLSupported = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR check

  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

// Detect if device is low-end
const isLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for low memory devices
  // @ts-ignore - navigator.deviceMemory is not in standard TS types
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;

  // Check for low CPU devices
  const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

  return lowMemory || lowCPU;
};

interface Canvas3DProps extends Omit<CanvasProps, 'children'> {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  lowPerformanceFallback?: React.ReactNode;
}

const Canvas3D: React.FC<Canvas3DProps> = ({
  children,
  fallback = <ErrorFallback />,
  lowPerformanceFallback,
  ...props
}) => {
  const [dpr, setDpr] = useState(1.5);
  const [supported, setSupported] = useState(true);
  const [lowPerformance, setLowPerformance] = useState(false);

  useEffect(() => {
    // Check WebGL support
    setSupported(isWebGLSupported());

    // Check for low-end device
    setLowPerformance(isLowEndDevice());
  }, []);

  // If WebGL is not supported, show fallback
  if (!supported) {
    return <>{fallback}</>;
  }

  // If device is low-end and we have a specific fallback for it
  if (lowPerformance && lowPerformanceFallback) {
    return <>{lowPerformanceFallback}</>;
  }

  // Default Canvas props for better performance
  const defaultProps: Partial<CanvasProps> = {
    dpr: [1, 2],
    gl: {
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      alpha: true
    },
    shadows: false, // Disable shadows by default for performance
    flat: true, // Use flat shading by default for performance
    frameloop: 'demand', // Use on-demand rendering by default
  };

  // Merge default props with user props
  const mergedProps = { ...defaultProps, ...props };

  return (
    <ErrorBoundary fallback={fallback}>
      <Canvas {...mergedProps}>
        <PerformanceMonitor
          onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
          onDecline={() => setDpr(1)}
          flipflops={3}
        >
          {/* @ts-ignore - dpr is a valid prop */}
          <AdaptivePixelRatio dpr={dpr} />
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </ErrorBoundary>
  );
};

// Component to set pixel ratio based on performance
const AdaptivePixelRatio = ({ dpr }: { dpr: number }) => {
  const { gl } = useThree();

  useEffect(() => {
    gl.setPixelRatio(dpr);
  }, [dpr, gl]);

  return null;
};



export default memo(Canvas3D);
