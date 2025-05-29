"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './ThaumatropeSketch.module.css';

interface ThaumatropeSketchProps {
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
  className?: string;
}

export function ThaumatropeSketch({
  size = 'medium',
  onClose,
  className = ''
}: ThaumatropeSketchProps) {
  const [showControls] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // The embedded p5.js sketch has a fixed canvas size of ~800x800px
  const SKETCH_SIZE = 800;

  // Map sizes to desired scale factors
  const sizeMultipliers = {
    small: 1.1,
    medium: 1.3,
    large: 1.5
  };

  const multiplier = sizeMultipliers[size];

  // Calculate scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 800;
      const containerHeight = rect.height || 600;
      
      // Account for controls and padding
      const availableHeight = containerHeight - 120;
      const availableWidth = containerWidth - 40;
      
      // Calculate scale to fit the available space
      const scaleToFitWidth = (availableWidth * multiplier) / SKETCH_SIZE;
      const scaleToFitHeight = (availableHeight * multiplier) / SKETCH_SIZE;
      
      // Use the smaller scale to ensure it fits in both dimensions
      const calculatedScale = Math.min(scaleToFitWidth, scaleToFitHeight);
      
      // Set minimum and maximum scale bounds
      const finalScale = Math.max(0.4, Math.min(calculatedScale, 1.8));
      
      setScale(finalScale);
    };

    updateScale();

    // Set up ResizeObserver for responsive behavior
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize for modal changes
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [multiplier]);

  return (
    <div ref={containerRef} className={`${styles.sketchContainer} ${className}`}>
      {/* Close button positioned at the top */}
      {onClose && (
        <div style={{ 
          position: 'absolute',
          top: '10px', 
          right: '10px',
          zIndex: 20 
        }}>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      )}
      
      {/* Hint text positioned above the sketch */}
      {showControls && (
        <div style={{ 
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '80%',
          zIndex: 15
        }}>
          <div style={{
            color: 'rgb(245, 248, 255)',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            lineHeight: '1.4',
            fontFamily: '"Times New Roman", serif',
            fontStyle: 'italic',
            textShadow: '0px 0px 3px rgba(0,0,0,0.8)'
          }}>
            <p>Hint: Pull the strings on either side with your mouse!</p>
          </div>
        </div>
      )}
      
      <div className={styles.canvasContainer}>
        <div 
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}
        >
          <iframe 
            src="https://editor.p5js.org/Parsaazari/full/UUrQXLRvr"
            width={SKETCH_SIZE}
            height={SKETCH_SIZE}
            style={{ 
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              display: 'block'
            }}
            title="Thaumatrope Sketch"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          />
        </div>
      </div>
    </div>
  );
}

export default ThaumatropeSketch; 