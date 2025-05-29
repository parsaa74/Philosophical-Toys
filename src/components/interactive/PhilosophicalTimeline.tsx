"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './PhilosophicalTimeline.module.css';
import dynamic from 'next/dynamic';
import { TimelineItem, timelineData as importedTimelineData, MUYBRIDGE_IMAGES } from '../../data/timelineData';

interface PhilosophicalTimelineProps {
  isVisible?: boolean;
  onInteraction?: (type: string) => void;
}

// Dynamically import sketch components
const ZoopraxiscopeSketch = dynamic(() => import('../p5/ZoopraxiscopeSketch'), { ssr: false });
const PraxinoscopeSketch = dynamic(() => import('../p5/PraxinoscopeSketch'), { ssr: false });
const ThaumatropeSketch = dynamic(() => import('../p5/ThaumatropeSketch'), { ssr: false });
const PhenakistoscopeSketch = dynamic(() => import('../p5/PhenakistoscopeSketch'), { ssr: false });
const ZoetropeSketch = dynamic(() => import('../p5/ZoetropeSketch'), { ssr: false });
const FlipbookSketch = dynamic(() => import('../p5/FlipbookSketch'), { ssr: false });
const CameraObscuraSketch = dynamic(() => import('../p5/CameraObscuraSketch'), { ssr: false });

const SketchLoader = ({ sketchId, onClose }: { sketchId?: string, onClose?: () => void }) => {
  if (!sketchId) return null;
  
  switch (sketchId) {
    case 'zoopraxiscope':
      return <ZoopraxiscopeSketch size="medium" onClose={onClose} />;
    case 'praxinoscope':
      return <PraxinoscopeSketch size="medium" />;
    case 'thaumatrope':
      return <ThaumatropeSketch size="medium" onClose={onClose} />;
    case 'phenakistoscope':
      return <PhenakistoscopeSketch size="medium" onClose={onClose} />;
    case 'zoetrope':
      return <ZoetropeSketch size="medium" onClose={onClose} />;
    case 'flipbook':
      return <FlipbookSketch size="medium" onClose={onClose} />;
    case 'camera-obscura':
      return <CameraObscuraSketch size="medium" onClose={onClose} />;
    default:
      return (
        <div className={styles.sketchPlaceholder}>
          <h3>Interactive {sketchId}</h3>
          <p>Sketch implementation pending</p>
        </div>
      );
  }
};

export function PhilosophicalTimeline({ isVisible = false, onInteraction }: PhilosophicalTimelineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalData, setModalData] = useState<TimelineItem | null>(null);
  const [isModalActive, setIsModalActive] = useState(false);
  const [isFastScrolling, setIsFastScrolling] = useState(false);
  const [muybridgeFrame, setMuybridgeFrame] = useState(0);
  const [isFilmMode, setIsFilmMode] = useState(false); // Manual toggle for film/still mode
  
  const animationRef = useRef<number | null>(null);
  const targetIndexRef = useRef(0);
  const currentIndexRef = useRef(0);
  const lastUpdateTime = useRef(0);
  const scrollVelocityRef = useRef(0);
  const lastScrollTime = useRef(0);
  const fastScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const muybridgeAnimationRef = useRef<number | null>(null);
  const fastScrollCountRef = useRef(0);
  
  const timelineData = importedTimelineData;

  // Muybridge animation loop
  const animateMuybridge = useCallback(() => {
    const frameInterval = 1000 / 24; // 24 FPS = ~41.67ms per frame
    let lastFrameTime = performance.now();
    
    const animate = () => {
      const currentTime = performance.now();
      if (currentTime - lastFrameTime >= frameInterval) {
        setMuybridgeFrame(prev => (prev + 1) % MUYBRIDGE_IMAGES.length);
        lastFrameTime = currentTime;
      }
      muybridgeAnimationRef.current = requestAnimationFrame(animate);
    };
    
    muybridgeAnimationRef.current = requestAnimationFrame(animate);
  }, []);

  // Start/stop Muybridge animation
  useEffect(() => {
    if (isFastScrolling || isFilmMode) {
      animateMuybridge();
    } else {
      if (muybridgeAnimationRef.current) {
        cancelAnimationFrame(muybridgeAnimationRef.current);
        muybridgeAnimationRef.current = null;
      }
    }
    
    return () => {
      if (muybridgeAnimationRef.current) {
        cancelAnimationFrame(muybridgeAnimationRef.current);
        muybridgeAnimationRef.current = null;
      }
    };
  }, [isFastScrolling, isFilmMode, animateMuybridge]);

  // Smooth scroll animation with easing
  const animateToTarget = useCallback(() => {
    const now = performance.now();
    const deltaTime = (now - lastUpdateTime.current) / 16.67; // 60fps baseline
    lastUpdateTime.current = now;
    
    const target = targetIndexRef.current;
    const current = currentIndexRef.current;
    const diff = target - current;
    
    if (Math.abs(diff) < 0.002) {
      currentIndexRef.current = target;
      setCurrentIndex(target);
      return;
    }
    
    // Smooth easing with frame-rate independence - made smoother
    const ease = 0.12 * Math.min(deltaTime, 2);
    const newIndex = current + diff * ease;
    currentIndexRef.current = newIndex;
    setCurrentIndex(newIndex);
    
    animationRef.current = requestAnimationFrame(animateToTarget);
  }, []);

  // Optimized scroll handler with momentum and fast scroll detection
  const handleScroll = useCallback((direction: number, velocity: number = 1) => {
    const now = performance.now();
    const timeDelta = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    // Calculate scroll velocity - made less sensitive
    scrollVelocityRef.current = Math.abs(velocity);
    
    // Detect fast scrolling - much more restrictive (requires ALL conditions)
    const isHighVelocity = scrollVelocityRef.current > 4.0;
    const isVeryFast = Math.abs(velocity) > 5.0;
    const isRapidSuccession = timeDelta < 60;
    
    // Require multiple conditions to be true simultaneously
    const isFast = isHighVelocity && isVeryFast && isRapidSuccession;
    
    if (isFast) {
      fastScrollCountRef.current += 1;
      // Require at least 3 consecutive fast scroll events to trigger mode
      if (fastScrollCountRef.current >= 3 && !isFastScrolling) {
        setIsFastScrolling(true);
        onInteraction?.('fast-scroll-start');
      }
    } else {
      // Reset count if not fast scrolling
      fastScrollCountRef.current = Math.max(0, fastScrollCountRef.current - 1);
    }
    
    // Clear existing timeout and set new one
    if (fastScrollTimeoutRef.current) {
      clearTimeout(fastScrollTimeoutRef.current);
    }
    
    // Stop fast scrolling after 1500ms of no fast scroll events (increased for more stability)
    fastScrollTimeoutRef.current = setTimeout(() => {
      setIsFastScrolling(false);
      fastScrollCountRef.current = 0;
      onInteraction?.('fast-scroll-end');
    }, 1500);
    
    const newIndex = Math.max(0, Math.min(timelineData.length - 1, targetIndexRef.current + direction));
    
    if (newIndex !== targetIndexRef.current) {
      targetIndexRef.current = newIndex;
      
      // Always restart animation for new target
      lastUpdateTime.current = performance.now();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animateToTarget);
    }
  }, [animateToTarget, timelineData.length, isFastScrolling, onInteraction]);

  // Jump to specific index
  const jumpToIndex = useCallback((index: number) => {
    if (index >= 0 && index < timelineData.length && index !== targetIndexRef.current) {
      targetIndexRef.current = index;
      
      // Always restart animation for new target
      lastUpdateTime.current = performance.now();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animateToTarget);
    }
  }, [animateToTarget, timelineData.length]);

  const closeModal = useCallback(() => {
    setIsModalActive(false);
    setModalData(null);
  }, []);

  // Toggle between film mode and still mode
  const toggleFilmMode = useCallback(() => {
    setIsFilmMode(prev => !prev);
    onInteraction?.(isFilmMode ? 'still-mode' : 'film-mode');
  }, [isFilmMode, onInteraction]);

  // Event handlers
  useEffect(() => {
    if (!isVisible) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      const velocity = Math.abs(e.deltaY / 150); // Much less sensitive velocity calculation
      handleScroll(direction, velocity);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleScroll(1, 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleScroll(-1, 1);
      } else if (e.key === 'Escape' && isModalActive) {
        closeModal();
      }
    };

    // Touch handling for mobile
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const deltaY = touchStartY - touchEndY;
      const deltaTime = touchEndTime - touchStartTime;
      
      // Only respond to very deliberate, fast swipes - much more restrictive
      if (Math.abs(deltaY) > 80 && deltaTime < 200) {
        const direction = deltaY > 0 ? 1 : -1;
        const velocity = Math.abs(deltaY) / (deltaTime * 3); // Much less sensitive touch velocity
        handleScroll(direction, velocity);
      }
    };

    // Add event listeners
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (fastScrollTimeoutRef.current) clearTimeout(fastScrollTimeoutRef.current);
    };
  }, [isVisible, handleScroll, isModalActive, closeModal]);

  // Update refs when state changes
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleItemClick = useCallback((item: TimelineItem) => {
    if (item.interactive) {
      setModalData(item);
      setIsModalActive(true);
      onInteraction?.('interactive-modal-open');
    } else if (item.youtubeUrl) {
      // Open YouTube link in new tab
      window.open(item.youtubeUrl, '_blank', 'noopener,noreferrer');
      onInteraction?.('youtube-link-clicked');
    }
  }, [onInteraction]);

  const currentItem = timelineData[Math.round(currentIndex)] || timelineData[0];

  // Calculate filmstrip frame positions for smooth distribution
  const filmstripFrames = timelineData.map((item, index) => {
    const offset = (index - currentIndex) * 44; // Frame spacing reduced for smaller filmstrip
    const opacity = Math.abs(index - currentIndex) < 8 ? 
      Math.max(0.1, 1 - Math.abs(index - currentIndex) * 0.12) : 0;
    
    return {
      item,
      index,
      offset,
      opacity,
      isActive: Math.round(currentIndex) === index
    };
  });

  // Calculate Muybridge horse frames for fast scrolling
  const muybridgeFrames = () => {
    // Create 7 static frames with the center one (index 3) showing the animation
    const staticFrames = [];
    for (let i = 0; i < 7; i++) {
      const offset = (i - 3) * 44; // Center frame at index 3
      const isCenter = i === 3;
      const opacity = isCenter ? 1 : 0.4; // Center frame is fully visible, others are dimmed
      
      staticFrames.push({
        imageSrc: isCenter ? MUYBRIDGE_IMAGES[muybridgeFrame] : MUYBRIDGE_IMAGES[0], // Animation only in center
        index: i,
        offset,
        opacity,
        isActive: isCenter,
        frameNumber: isCenter ? muybridgeFrame + 1 : '—'
      });
    }
    return staticFrames;
  };

  return (
    <div className={`${styles.wrapper} ${isVisible ? styles.visible : styles.hidden}`}>
      {/* Full screen background image */}
      {!isFastScrolling && !isFilmMode && (
        <div 
          className={styles.backgroundImage}
          style={{
            backgroundImage: `url(${currentItem.image})`,
          }}
        />
      )}
      
      {/* Progress indicator */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${(currentIndex / (timelineData.length - 1)) * 100}%` }}
        />
      </div>

      {/* Author name */}
      <div className={styles.authorName}>
        Parsa azari
      </div>

      {/* Fast scrolling indicator */}
      {(isFastScrolling || isFilmMode) && (
        <div className={styles.fastScrollIndicator}>
          <div className={styles.muybridgeTitle}>
            Muybridge Horse in Motion (1878)
            {isFilmMode && !isFastScrolling && <span className={styles.modeIndicator}> (Film Mode)</span>}
          </div>
          <div className={styles.frameCounter}>
            Frame {muybridgeFrame + 1} / {MUYBRIDGE_IMAGES.length}
          </div>
        </div>
      )}

      {/* Current item display - hidden during fast scrolling or film mode */}
      {!isFastScrolling && !isFilmMode && (
        <div className={styles.currentItem} key={currentItem.id}>
          <div className={styles.itemNumber}>
            {String(Math.round(currentIndex) + 1).padStart(2, '0')} / {String(timelineData.length).padStart(2, '0')}
          </div>
          <div className={styles.itemYear}>
            {currentItem.year}
          </div>
          <div className={styles.itemTitle}>
            {currentItem.title}
          </div>
          <div className={styles.itemDescription}>
            {currentItem.description}
          </div>
          {(currentItem.interactive || currentItem.youtubeUrl) && (
            <button 
              className={styles.interactButton}
              onClick={() => handleItemClick(currentItem)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleItemClick(currentItem);
                }
              }}
            >
              {currentItem.youtubeUrl ? 'Watch' : 'Explore'}
            </button>
          )}
        </div>
      )}

      {/* Film/Still Toggle Button */}
      <div className={styles.toggleButtonContainer}>
        <button 
          className={`${styles.toggleButton} ${isFilmMode ? styles.filmActive : styles.stillActive}`}
          onClick={toggleFilmMode}
          aria-label={isFilmMode ? 'Switch to still mode' : 'Switch to film mode'}
        >
          {isFilmMode ? (
            // Film/Movie icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
            </svg>
          ) : (
            // Photo/Camera icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/>
            </svg>
          )}
          <span className={styles.toggleLabel}>
            {isFilmMode ? 'Film' : 'Still'}
          </span>
        </button>
      </div>

      {/* Filmstrip Timeline - switches between regular timeline and Muybridge frames */}
      <div className={styles.filmstrip}>
        <div className={styles.filmstripContainer}>
          {(isFastScrolling || isFilmMode) ? (
            // Show focused Muybridge animation with one frame in focus
            muybridgeFrames().map(({ imageSrc, index, offset, opacity, isActive, frameNumber }) => (
              <div
                key={`muybridge-${index}`}
                className={`${styles.filmFrame} ${isActive ? styles.active : ''} ${styles.muybridgeFrame}`}
                style={{
                  transform: `translateY(${offset}px)`,
                  opacity,
                  pointerEvents: 'none' // Disable interaction during fast scroll
                }}
              >
                <div className={styles.filmHoles}>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                </div>
                <div className={styles.frameContent}>
                  <img 
                    src={imageSrc}
                    alt={isActive ? `Horse motion frame ${muybridgeFrame + 1}` : 'Context frame'}
                    className={styles.frameImage}
                  />
                  <div className={styles.frameOverlay}>
                    <div className={styles.frameNumber}>{frameNumber}</div>
                  </div>
                </div>
                <div className={styles.filmHoles}>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                </div>
              </div>
            ))
          ) : (
            // Show regular timeline frames
            filmstripFrames.map(({ item, index, offset, opacity, isActive }) => (
              <div
                key={item.id}
                className={`${styles.filmFrame} ${isActive ? styles.active : ''}`}
                style={{
                  transform: `translateY(${offset}px)`,
                  opacity,
                  pointerEvents: opacity > 0.3 ? 'auto' : 'none'
                }}
                onClick={() => jumpToIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    jumpToIndex(index);
                  }
                }}
                tabIndex={opacity > 0.3 ? 0 : -1}
                role="button"
                aria-label={`Jump to ${item.year}: ${item.title}`}
              >
                <div className={styles.filmHoles}>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                </div>
                <div className={styles.frameContent}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className={styles.frameImage}
                  />
                  <div className={styles.frameOverlay}>
                    <div className={styles.frameYear}>{item.year}</div>
                    {item.interactive && <div className={styles.interactiveIndicator}>⚡</div>}
                  </div>
                </div>
                <div className={styles.filmHoles}>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                  <div className={styles.hole}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation hint */}
      <div className={styles.navHint}>
        {(isFastScrolling || isFilmMode) ? 'Showing Muybridge horse motion' : 'scroll, use arrow keys, or click filmstrip'}
      </div>

      {/* Modal */}
      {isModalActive && (
        <div 
          className={styles.modal} 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              className={styles.closeButton} 
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>
            <div id="modal-title" className="sr-only">
              {modalData?.title} Interactive Experience
            </div>
            <SketchLoader sketchId={modalData?.sketchId} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}

export default PhilosophicalTimeline;