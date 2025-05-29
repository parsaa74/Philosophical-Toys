"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
// import { AnimatedIntro } from '@/components/p5/AnimatedIntro';

// InteractiveZoetrope component removed

// Dynamic import for the philosophical timeline
const DynamicPhilosophicalTimeline = dynamic(
  () => import('../components/interactive/PhilosophicalTimeline'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[45] flex items-center justify-center">
        <div className="text-white text-opacity-70 text-lg">Loading interactive timeline...</div>
      </div>
    )
  }
);

// Dynamic import for the modern title sketch (Tim Rodenbroeker style)
const DynamicModernTitleSketch = dynamic(
  () => import('../components/p5/ModernTitleSketch'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-white text-opacity-70 text-lg font-light tracking-wider">Loading...</div>
      </div>
    )
  }
);

export default function Home() {
  // Component visibility states
  const [showTimeline, setShowTimeline] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const [showModernTitle, setShowModernTitle] = useState(true);
  const animationRef = useRef<number | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const filmLeaderContainerRef = useRef<HTMLDivElement>(null);

  // Flow control handlers
  const handleIntroComplete = () => {
    console.log("Modern title complete");
    setIsSlidingUp(true);
  };

  const handleModernTitleTransitionEnd = () => {
    if (isSlidingUp) {
      setShowModernTitle(false);
      setIsTransitioning(true);
      animateTransition();
    }
  };

  // Smooth transition animation
  const animateTransition = () => {
    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Apply easing (cubic ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setTransitionProgress(easedProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - slight delay before showing timeline to trigger entrance animations
        setTimeout(() => {
          setShowTimeline(true);
          setIsTransitioning(false);
          
          // Focus the timeline container for keyboard navigation
          if (timelineContainerRef.current) {
            timelineContainerRef.current.focus();
          }
        }, 100); // Small delay to ensure proper state transition
      }
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleTimelineInteraction = (type: string) => {
    console.log("Timeline interaction:", type);
    // Handle timeline interactions if needed
  };

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-between bg-black overflow-hidden">
      {/* Modern Title Container with slide-up animation */}
      {showModernTitle && (
        <div
          ref={filmLeaderContainerRef}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          style={{
            transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isSlidingUp ? 'translateY(-100vh)' : 'translateY(0)',
            willChange: 'transform',
          }}
          onTransitionEnd={handleModernTitleTransitionEnd}
        >
          <DynamicModernTitleSketch
            onAnimationComplete={handleIntroComplete}
            text="philosophical toys"
            style="rodenbroeker"
            paused={isSlidingUp}
          />
        </div>
      )}

      {/* Timeline Container with vertical slide-in effect */}
      <div 
        ref={timelineContainerRef}
        className="fixed inset-0 z-[30]"
        style={{
          opacity: showTimeline ? 1 : isTransitioning ? transitionProgress : 0,
          transform: showTimeline ? 'translateY(0)' : `translateY(${(1 - transitionProgress) * 100}vh)`,
          transition: isTransitioning ? 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          pointerEvents: showTimeline ? 'auto' : 'none'
        }}
      >
        <DynamicPhilosophicalTimeline 
          isVisible={showTimeline} 
          onInteraction={handleTimelineInteraction} 
        />
      </div>

      {/* Film Strip Visual Elements - Completely disabled */}
      {false && (
        <div className="fixed inset-0 z-[50] pointer-events-none overflow-hidden">
          {/* Left film perforations */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#222]" 
               style={{ opacity: 1 - transitionProgress * 0.8 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={`left-${i}`}
                className="absolute w-4 h-4 rounded-full bg-black left-4" 
                style={{ 
                  top: `${i * 5}vh`,
                  boxShadow: 'inset 0 0 4px rgba(0, 0, 0, 0.8)'
                }}
              />
            ))}
          </div>
          
          {/* Right film perforations */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#222]"
               style={{ opacity: 1 - transitionProgress * 0.8 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={`right-${i}`}
                className="absolute w-4 h-4 rounded-full bg-black right-4" 
                style={{ 
                  top: `${i * 5}vh`,
                  boxShadow: 'inset 0 0 4px rgba(0, 0, 0, 0.8)'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
