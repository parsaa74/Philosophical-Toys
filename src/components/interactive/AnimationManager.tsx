import React, { useEffect, useRef, useCallback } from 'react';
import { useTimelineContext, wrapIndex } from './TimelineContext';
import { timelineData, MUYBRIDGE_IMAGES } from '../../data/timelineData';
import styles from './PhilosophicalTimeline.module.css';

interface AnimationManagerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  boxesRef: React.MutableRefObject<Array<HTMLDivElement & {dataset: DOMStringMap}>>;
}

const AnimationManager: React.FC<AnimationManagerProps> = ({ containerRef, boxesRef }) => {
  const { 
    currentIndex,
    targetIndex,
    mode,
    showFixedFrame,
    updateCurrentItem,
    setCurrentIndex,
    currentIndexRef,
    targetIndexRef,
    scrollSpeedRef,
    lastAnimationTimestampRef,
    positionSlidesRef,
    setAnimationInProgress,
    getAnimationStatus
  } = useTimelineContext();
  
  const animationRef = useRef<number | null>(null);

  // Animation handler for smooth scrolling between frames
  const animateScroll = useCallback(() => {
    if (!getAnimationStatus()) {
      return;
    }
    
    const currentTimestamp = performance.now();
    const deltaTime = lastAnimationTimestampRef.current ? 
      Math.min(32, currentTimestamp - lastAnimationTimestampRef.current) / 16.67 : 1;
    lastAnimationTimestampRef.current = currentTimestamp;
    
    const length = mode === 'moving' ? 24 : timelineData.length;
    let cf = currentIndexRef.current;
    const tf = targetIndexRef.current;
    
    // Calculate the shortest path to target (handle the loop)
    let diff = tf - cf;
    // Adjust for wraparound at boundaries using modular arithmetic
    if (Math.abs(diff) > length / 2) {
      diff = diff - Math.sign(diff) * length;
    }
    
    // Fixed easing factor based on mode
    const easingFactor = 0.1;
    
    // Apply speed directly to frame advancement, not easing
    const speedAdjustedDiff = diff * (mode === 'moving' ? 
      Math.max(1, scrollSpeedRef.current * 0.2) : 
      Math.max(0.5, Math.min(1.0, scrollSpeedRef.current * 0.1)));
    
    // Adjust the current frame by a more consistent amount based on time delta
    const frameAdvancement = speedAdjustedDiff * easingFactor * deltaTime;
    cf += frameAdvancement;
    
    // Ensure cf stays within proper range
    cf = ((cf % length) + length) % length;
    
    // Update state and refs
    currentIndexRef.current = cf;
    setCurrentIndex(cf);
    
    // Stop animation if very close to target
    if (Math.abs(diff) < 0.005) {
      currentIndexRef.current = tf;
      setCurrentIndex(tf);
      setAnimationInProgress(false);
      return;
    }
    
    // Update visual position of frames
    if (positionSlidesRef.current) {
      positionSlidesRef.current(cf);
    } else {
      console.error("positionSlidesRef.current is null - can't position slides");
    }
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animateScroll);
  }, [mode, currentIndexRef, targetIndexRef, scrollSpeedRef, lastAnimationTimestampRef, setCurrentIndex, positionSlidesRef, getAnimationStatus, setAnimationInProgress]);

  // Position slides function (virtual window for seamless looping)
  const positionSlides = useCallback((index: number) => {
    // Choose the length based only on timelineData
    const length = timelineData.length;
    const VISIBLE_SLIDES = 24;

    // Centering logic
    let baselineY = 0;
    const container = containerRef.current;
    let frameHeight = 0;
    
    if (boxesRef.current.length > 0) {
      frameHeight = boxesRef.current[0].offsetHeight || 264;
    }
    
    let containerHeight = 0;
    if (container) {
      containerHeight = container.offsetHeight || window.innerHeight;
    }
    
    // Adjust baselineY to position the current frame at the center
    const currentFrameIndex = Math.round(index) % length;
    baselineY = (containerHeight / 2) - (frameHeight / 2);

    // Fixed spacing for consistent movement
    const baseSpacing = 270;
    
    // Get the filmFramesContainer to position it as a single unit
    const filmFramesContainer = document.querySelector(`.${styles.filmFramesContainer}`);
    if (!filmFramesContainer) {
      console.error("Could not find filmFramesContainer element");
      return;
    }
    
    // Calculate the total reel position based on current index
    const reelY = -index * baseSpacing;
    
    // Apply the position to the entire filmstrip container with no transition
    // This allows our animation loop to control the movement smoothly
    (filmFramesContainer as HTMLElement).style.transition = 'none';
    (filmFramesContainer as HTMLElement).style.transform = `translate(0px, ${baselineY + reelY}px)`;
    
    // Add dimming effect to filmstrip when fixed frame is visible
    if (showFixedFrame) {
      (filmFramesContainer as HTMLElement).style.filter = 'brightness(0.3) blur(2px)';
      (filmFramesContainer as HTMLElement).style.opacity = '0.7';
    } else {
      (filmFramesContainer as HTMLElement).style.filter = 'none';
      (filmFramesContainer as HTMLElement).style.opacity = '1';
    }
    
    // For each frame - simplified for more consistent performance
    for (let i = 0; i < boxesRef.current.length; i++) {
      // Calculate the data index for this physical frame box
      // Each frame box consistently maps to a timeline item in still mode
      // In moving mode, we show the Muybridge sequence
      const dataIndex = i; // Direct 1:1 mapping in still mode
      
      const box = boxesRef.current[i];
      if (!box) continue;

      // Determine which slide is the center/current one 
      const isCurrentSlide = i === currentFrameIndex;
      
      // Z-indexing - prioritize the current frame
      box.style.zIndex = isCurrentSlide ? '100' : (VISIBLE_SLIDES - Math.abs(i - currentFrameIndex)).toString();
      
      // Opacity - focus on current frame and nearby frames
      const distanceFromCurrent = Math.min(
        Math.abs(i - currentFrameIndex),
        Math.abs(i - currentFrameIndex + VISIBLE_SLIDES),
        Math.abs(i - currentFrameIndex - VISIBLE_SLIDES)
      );
      const baseOpacity = 1 - Math.min(0.4, distanceFromCurrent * 0.05);
      box.style.opacity = String(baseOpacity);
      
      // Frame styling - use boxFocus class for center frame
      if (isCurrentSlide) {
        box.classList.add(styles.boxFocus);
      } else {
        box.classList.remove(styles.boxFocus);
      }
      
      // Remove motion blur effects for consistency
      box.classList.remove(styles.motionBlurLow, styles.motionBlurMedium, styles.motionBlurHigh);
      
      // Image crossfade logic - optimize by only updating when necessary
      if (Math.abs(i - currentFrameIndex) <= 2) {
        const imgContainer = box.querySelector<HTMLDivElement>(`.${styles.imageHolderDiv}`);
        if (imgContainer) {
          const mainImg = imgContainer.querySelector(`.${styles.mainImage}`);
          const overlayImg = imgContainer.querySelector(`.${styles.overlayImage}`) as HTMLElement | null;

          if (mainImg && overlayImg) {
            if (mode === 'moving') {
              // FILM MODE: Each frame shows only its corresponding Muybridge image
              const muybridgeSrc = MUYBRIDGE_IMAGES[i % MUYBRIDGE_IMAGES.length];
              if (mainImg.getAttribute('src') !== muybridgeSrc) {
                mainImg.setAttribute('src', muybridgeSrc);
              }
              // Hide overlay image
              overlayImg.style.display = 'none';
            } else {
              // TIMELINE MODE: Show timeline image - fixed mapping
              const stillSrc = timelineData[dataIndex].image;
              if (mainImg.getAttribute('src') !== stillSrc) {
                mainImg.setAttribute('src', stillSrc);
              }
              overlayImg.style.display = 'none';
            }
          }
        }
        
        // Update content only when needed (center frame or near center)
        const content = box.querySelector<HTMLElement>(`.${styles.slideContent}`);
        if (content) {
          // Use the fixed dataIndex for consistent content
          content.innerHTML = `<h2>${timelineData[dataIndex].title} (${timelineData[dataIndex].year})</h2><p>${timelineData[dataIndex].description}</p>`;
          
          // Hide content in moving mode
          content.style.display = mode === 'moving' ? 'none' : 'block';
        }
        
        // Update data attributes - use fixed mapping for consistent data
        box.dataset.year = timelineData[dataIndex].year;
        box.dataset.title = timelineData[dataIndex].title;
        box.dataset.description = timelineData[dataIndex].description;
        box.dataset.type = timelineData[dataIndex].interactive ? "interactive" : "image";
        box.dataset.id = String(dataIndex + 1);
        box.dataset.index = String(dataIndex);
      }
    }
    
    // Update indicators
    updateIndicators(wrapIndex(Math.round(index), length));
  }, [boxesRef, containerRef, mode, showFixedFrame, updateCurrentItem]);

  // Update indicators
  const updateIndicators = useCallback((index: number) => {
    const length = timelineData.length;
    const displayIndex = wrapIndex(Math.round(index), length);
    const progress = displayIndex / (length - 1);
    document.querySelector(`.${styles.timelineMarker}`)?.setAttribute('style', `top: ${progress * 100}%`);
    updateCurrentItem(timelineData[displayIndex]);
  }, [updateCurrentItem]);

  // Set up the positionSlides reference
  useEffect(() => {
    positionSlidesRef.current = positionSlides;
    
    // Initial positioning of slides
    if (boxesRef.current.length > 0) {
      positionSlides(currentIndex);
    }
  }, [positionSlides, positionSlidesRef, currentIndex, boxesRef]);

  // Start animation when currentIndex or targetIndex changes
  useEffect(() => {
    // Only start animation if it's not already running
    if (!getAnimationStatus() && currentIndex !== targetIndex) {
      setAnimationInProgress(true);
      
      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Start new animation
      animationRef.current = requestAnimationFrame(animateScroll);
    }
  }, [currentIndex, targetIndex, animateScroll, getAnimationStatus, setAnimationInProgress]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      if (positionSlidesRef.current) {
        positionSlidesRef.current(currentIndex);
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentIndex, positionSlidesRef]);

  return null; // This component doesn't render anything
};

export default AnimationManager; 