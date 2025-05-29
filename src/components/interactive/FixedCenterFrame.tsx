import React, { useEffect, useRef } from 'react';
import { useTimelineContext } from './TimelineContext';
import { MUYBRIDGE_IMAGES } from '../../data/timelineData';
import styles from './PhilosophicalTimeline.module.css';

const FixedCenterFrame: React.FC = () => {
  const { 
    showFixedFrame, 
    mode, 
    currentMuybridgeIndex,
    scrollSpeedRef,
    setCurrentMuybridgeIndex,
    currentMuybridgeIndexRef
  } = useTimelineContext();
  
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const fixedFrameAnimationRef = useRef<number | null>(null);
  
  // Fixed frame animation function
  const startFixedFrameAnimation = () => {
    let lastFrameTime = performance.now();
    const targetFPS = 24;
    const frameDuration = 1000 / targetFPS;

    const animateFixedFrame = (timestamp: number) => {
      if (mode !== 'moving' || !showFixedFrame) return;
      
      const elapsed = timestamp - lastFrameTime;
      const speed = scrollSpeedRef.current || 1;
      const adjustedFrameDuration = frameDuration / speed;
      
      if (elapsed >= adjustedFrameDuration) {
        // Use the ref for the current index with a fallback to 0 if null
        const currentIndex = currentMuybridgeIndexRef.current ?? 0;
        const nextIndex = (currentIndex + 1) % MUYBRIDGE_IMAGES.length;
        
        // Only update the state when needed
        if (currentMuybridgeIndex !== nextIndex) {
          setCurrentMuybridgeIndex(nextIndex);
        }
        
        // Directly update the image src for smoother animation
        if (fixedFrameRef.current) {
          const imageElement = fixedFrameRef.current.querySelector('img');
          if (imageElement) {
            imageElement.src = MUYBRIDGE_IMAGES[nextIndex];
          }
        }
        
        lastFrameTime = timestamp - (elapsed % adjustedFrameDuration);
      }
      
      fixedFrameAnimationRef.current = requestAnimationFrame(animateFixedFrame);
    };
    
    fixedFrameAnimationRef.current = requestAnimationFrame(animateFixedFrame);
  };
  
  // Ensure animation always starts/stops with showFixedFrame
  useEffect(() => {
    if (showFixedFrame && mode === 'moving') {
      // Cancel any existing animation frame
      if (fixedFrameAnimationRef.current) {
        cancelAnimationFrame(fixedFrameAnimationRef.current);
        fixedFrameAnimationRef.current = null;
      }
      startFixedFrameAnimation();
    } else {
      if (fixedFrameAnimationRef.current) {
        cancelAnimationFrame(fixedFrameAnimationRef.current);
        fixedFrameAnimationRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (fixedFrameAnimationRef.current) {
        cancelAnimationFrame(fixedFrameAnimationRef.current);
        fixedFrameAnimationRef.current = null;
      }
    };
  }, [showFixedFrame, mode]);
  
  if (!showFixedFrame) return null;
  
  return (
    <div className={styles.fixedCenterFramePerspective}>
      <div 
        ref={fixedFrameRef} 
        className={styles.fixedCenterFrame}
        style={{ 
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        <div className={styles.fixedCenterFrameImageZ}>
          <div className={styles.imageHolderDiv}>
            {/* Show just the current frame for the animation */}
            <img 
              src={MUYBRIDGE_IMAGES[currentMuybridgeIndex]} 
              alt={`Animation Frame ${currentMuybridgeIndex + 1}`} 
              className={styles.mainImage}
            />
          </div>
          {/* Add film perforation holes on both sides - positioned outside the main image */}
          <div className={`${styles.filmHole} ${styles.filmHoleLeft}`} style={{top: '15%', left: 0, transform: 'translateX(-50%)'}}></div>
          <div className={`${styles.filmHole} ${styles.filmHoleRight}`} style={{top: '15%', right: 0, transform: 'translateX(50%)'}}></div>
          <div className={`${styles.filmHole} ${styles.filmHoleLeft}`} style={{top: '50%', left: 0, transform: 'translateX(-50%)'}}></div>
          <div className={`${styles.filmHole} ${styles.filmHoleRight}`} style={{top: '50%', right: 0, transform: 'translateX(50%)'}}></div>
          <div className={`${styles.filmHole} ${styles.filmHoleLeft}`} style={{top: '85%', left: 0, transform: 'translateX(-50%)'}}></div>
          <div className={`${styles.filmHole} ${styles.filmHoleRight}`} style={{top: '85%', right: 0, transform: 'translateX(50%)'}}></div>
        </div>
      </div>
    </div>
  );
};

export default FixedCenterFrame; 