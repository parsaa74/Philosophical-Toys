import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './InteractiveZoetrope.module.css';

// Dynamic import for the 3D Zoetrope component (client-side only)
const DynamicZoetrope3D = dynamic(
  () => import('./Zoetrope3D').catch(err => {
    console.error('Failed to load 3D zoetrope:', err);
    return import('./SimpleZoetrope');
  }),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading zoetrope model...</div>
      </div>
    )
  }
);

interface InteractiveZoetropeProps {
  isVisible?: boolean;
  onInteraction?: (type: string) => void;
}

/**
 * Interactive Zoetrope Component
 *
 * A wrapper for the P5.js-based zoetrope sketch that provides additional
 * information and context about this philosophical toy.
 */
export function InteractiveZoetrope({
  isVisible = false,
  onInteraction
}: InteractiveZoetropeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Handle component loading
  useEffect(() => {
    // Set a timeout to check if the component has loaded
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.warn('Zoetrope component taking too long to load, may be using fallback');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  // Handle visibility changes with proper transitions
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isVisible) {
      // Delay showing content to ensure smooth transition
      timer = setTimeout(() => {
        setIsContentVisible(true);
      }, 300);
    } else {
      setIsContentVisible(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible]);

  const handleInteraction = (type: string) => {
    if (type === 'component-loaded') {
      setIsLoaded(true);
    }

    if (onInteraction) {
      onInteraction(type);
    }
  };

  return (
    <div
      className={`${styles.container} ${isVisible ? styles.visible : styles.hidden}`}
      ref={containerRef}
    >
      <div className={`${styles.title} ${isContentVisible ? styles.titleVisible : styles.titleHidden}`}>
        <h1>Philosophical Toys</h1>
        <p>Explore the magic of early animation through this interactive zoetrope</p>
      </div>

      <div className={`${styles.content} ${isContentVisible ? styles.contentVisible : styles.contentHidden}`}>
        <div className={styles.sketchContainer}>
          <DynamicZoetrope3D
            onInteraction={handleInteraction}
          />
        </div>

        <div className={styles.infoPanel}>
          <h2>The Zoetrope</h2>
          <p className={styles.description}>
            A philosophical toy from the 1830s that creates the illusion of motion through a series of sequential images.
            When spun and viewed through the slits, the static images appear to come to life.
          </p>

          <div className={styles.instructions}>
            <h3>How to interact:</h3>
            <ul>
              <li>Click the &quot;Spin&quot; button to start the animation</li>
              <li>Adjust the speed using the slider</li>
              <li>Click the &quot;?&quot; button for more information</li>
            </ul>
          </div>

          <p className={styles.note}>
            This interactive model demonstrates how persistence of vision creates the illusion of movement,
            a principle that led to the development of cinema.
          </p>

          <div className={styles.historySection}>
            <h3>Historical Context</h3>
            <p>
              The zoetrope was invented in 1834 by William George Horner, though similar devices had existed in China as early as 180 AD.
              It was one of several &quot;philosophical toys&quot; of the 19th century that explored optical illusions and the science of perception.
              These toys were precursors to motion pictures and animation, demonstrating how a series of still images could create the illusion of movement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveZoetrope;
