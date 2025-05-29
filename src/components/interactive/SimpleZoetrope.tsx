import React, { useState, useRef, useEffect } from 'react';
import styles from './SimpleZoetrope.module.css';

interface SimpleZoetropeProps {
  onInteraction?: (type: string) => void;
}

/**
 * A simple fallback zoetrope component using CSS animations
 * in case the 3D model fails to load
 */
export function SimpleZoetrope({ onInteraction }: SimpleZoetropeProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [speed, setSpeed] = useState(5); // 1-10 scale
  const [showInfo, setShowInfo] = useState(false);
  const discRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLDivElement>(null);

  // Handle toggle spinning
  const handleToggleSpin = () => {
    setIsSpinning(!isSpinning);
    if (onInteraction) {
      onInteraction(isSpinning ? 'stop' : 'spin');
    }
  };

  // Handle speed change
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value, 10);
    setSpeed(newSpeed);
    if (onInteraction) {
      onInteraction('speed-change');
    }
  };

  // Handle info toggle
  const handleInfoToggle = () => {
    setShowInfo(!showInfo);
    if (onInteraction) {
      onInteraction('info-toggle');
    }
  };

  // Update animation speed when speed changes
  useEffect(() => {
    if (discRef.current) {
      const duration = 11 - speed; // Invert scale so higher = faster
      discRef.current.style.animationDuration = `${duration}s`;
    }
    if (framesRef.current) {
      const duration = 11 - speed; // Invert scale so higher = faster
      framesRef.current.style.animationDuration = `${duration}s`;
    }
  }, [speed]);

  // Update animation play state when isSpinning changes
  useEffect(() => {
    if (discRef.current) {
      discRef.current.style.animationPlayState = isSpinning ? 'running' : 'paused';
    }
    if (framesRef.current) {
      framesRef.current.style.animationPlayState = isSpinning ? 'running' : 'paused';
    }
  }, [isSpinning]);

  // Create frames for the zoetrope
  const renderFrames = () => {
    const frames = [];
    const frameCount = 12;

    for (let i = 0; i < frameCount; i++) {
      const angle = (i / frameCount) * 360;
      const phase = i / frameCount;
      
      frames.push(
        <div 
          key={i} 
          className={styles.frame}
          style={{ transform: `rotate(${angle}deg) translateY(-120px)` }}
        >
          <div 
            className={styles.horse}
            style={{ 
              '--phase': phase.toString(),
              transform: `rotate(${90}deg)`
            } as React.CSSProperties}
          />
        </div>
      );
    }

    return frames;
  };

  // Create slits for the zoetrope
  const renderSlits = () => {
    const slits = [];
    const slitCount = 12;

    for (let i = 0; i < slitCount; i++) {
      const angle = (i / slitCount) * 360;
      
      slits.push(
        <div 
          key={i} 
          className={styles.slit}
          style={{ transform: `rotate(${angle}deg) translateY(-150px)` }}
        />
      );
    }

    return slits;
  };

  return (
    <div className={styles.container}>
      <div className={styles.zoetropeContainer}>
        {/* Base */}
        <div className={styles.base} />
        
        {/* Disc */}
        <div 
          ref={discRef}
          className={`${styles.disc} ${isSpinning ? styles.spinning : ''}`}
        >
          {/* Slits */}
          {renderSlits()}
        </div>
        
        {/* Frames */}
        <div 
          ref={framesRef}
          className={`${styles.framesContainer} ${isSpinning ? styles.spinning : ''}`}
        >
          {renderFrames()}
        </div>
      </div>
      
      {/* Controls */}
      <div className={styles.controls}>
        <button 
          className={styles.button}
          onClick={handleToggleSpin}
        >
          {isSpinning ? 'Stop' : 'Spin'}
        </button>
        
        <div className={styles.sliderContainer}>
          <span className={styles.label}>Speed:</span>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={speed}
            onChange={handleSpeedChange}
            className={styles.slider}
          />
        </div>
        
        <button 
          className={styles.infoButton}
          onClick={handleInfoToggle}
        >
          ?
        </button>
      </div>
      
      {/* Info Overlay */}
      {showInfo && (
        <div className={styles.infoOverlay}>
          <div className={styles.infoContent}>
            <h2>How the Zoetrope Works</h2>
            <p>
              The zoetrope creates the illusion of motion through a series of sequential images.
              When the drum spins, you view the images through the slits, which act like a shutter
              in a camera. This creates the illusion of smooth motion due to a phenomenon called
              "persistence of vision" - where an image remains on your retina for a fraction of a
              second after viewing it.
            </p>
            <p>
              This principle was crucial to the development of cinema and animation, demonstrating
              how a series of still images could create the illusion of movement.
            </p>
            <button 
              className={styles.closeButton}
              onClick={handleInfoToggle}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleZoetrope;
