"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FlipbookSketchProps {
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
  className?: string;
}

export function FlipbookSketch({
  size = 'medium',
  onClose,
  className = ''
}: FlipbookSketchProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const totalPages = 18;
  const containerRef = useRef<HTMLDivElement>(null);
  const autoFlipIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ultra-fast spring animation configurations for spontaneous movement
  const fastSpringConfig = { 
    type: "spring" as const, 
    damping: 8, 
    stiffness: 400,
    mass: 0.3
  };
  
  // Even faster for dissolve effects
  const dissolveConfig = {
    type: "spring" as const,
    damping: 6,
    stiffness: 600,
    mass: 0.2
  };

  // Size configurations
  const sizeConfig = {
    small: { width: 200, height: 250 },
    medium: { width: 280, height: 350 },
    large: { width: 360, height: 450 }
  };
  
  const bookSize = sizeConfig[size];

  // Preload images
  useEffect(() => {
    let cancelled = false;
    const preloadImages = async () => {
      for (let i = 1; i <= totalPages; i++) {
        const img = new window.Image();
        img.src = `/images/flipbook/${i}.jpg`;
        img.onload = () => {
          if (!cancelled) {
            setImagesLoaded(prev => Math.min(prev + 1, totalPages));
          }
        };
        img.onerror = () => {
          if (!cancelled) {
            setImagesLoaded(prev => Math.min(prev + 1, totalPages));
          }
        };
      }
    };

    if (typeof window !== 'undefined') {
      preloadImages();
    }

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (imagesLoaded >= totalPages) {
      setIsLoading(false);
    }
  }, [imagesLoaded]);

  // Automatic flipping functionality
  const startAutoFlip = useCallback(() => {
    if (autoFlipIntervalRef.current) {
      clearInterval(autoFlipIntervalRef.current);
    }
    
    autoFlipIntervalRef.current = setInterval(() => {
      setCurrentPage(prev => {
        const nextPage = (prev + 1) % totalPages;
        setIsFlipping(true);
        
        setTimeout(() => setIsFlipping(false), 80);
        
        return nextPage;
      });
    }, 150); // Very fast automatic flipping
  }, [totalPages]);

  const stopAutoFlip = useCallback(() => {
    if (autoFlipIntervalRef.current) {
      clearInterval(autoFlipIntervalRef.current);
      autoFlipIntervalRef.current = null;
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev) {
        startAutoFlip();
      } else {
        stopAutoFlip();
      }
      return !prev;
    });
  }, [startAutoFlip, stopAutoFlip]);

  // Start/stop automatic flipping based on isPlaying state
  useEffect(() => {
    if (isPlaying && !isLoading) {
      startAutoFlip();
    } else {
      stopAutoFlip();
    }

    return () => stopAutoFlip();
  }, [isPlaying, isLoading, startAutoFlip, stopAutoFlip]);

  // Keyboard navigation - only for play/pause and close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') { // Spacebar for play/pause
        event.preventDefault();
        togglePlayPause();
      } else if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, onClose]);

  return (
    <div 
      ref={containerRef}
      className={`${className} relative flex items-center justify-center w-full h-[80vh] bg-gradient-to-br from-gray-900 via-stone-900 to-slate-900 overflow-hidden rounded-lg`}
    >
        {/* Play/Pause button */}
        <motion.button 
          onClick={togglePlayPause}
          className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center bg-gray-800/90 text-gray-300 rounded-full hover:bg-gray-700 hover:text-white transition-all backdrop-blur-sm border border-gray-700/50 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isPlaying ? (
            // Pause icon
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-gray-300 rounded-sm" />
              <div className="w-0.5 h-3 bg-gray-300 rounded-sm" />
            </div>
          ) : (
            // Play icon
            <div className="w-0 h-0 border-l-3 border-l-gray-300 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-0.5" />
          )}
        </motion.button>

      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30 bg-black/30 backdrop-blur-sm"
          >
            <div className="text-center text-white">
              <motion.div 
                className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="font-light text-sm opacity-80">Loading flipbook...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book container */}
      <motion.div 
        className="relative perspective-1000"
        style={{ 
          width: bookSize.width,
          height: bookSize.height
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, ...fastSpringConfig }}
      >
        {/* Subtle shadow */}
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-3 bg-black/40 rounded-full blur-md"
        />

        {/* Main flipbook container */}
        <div 
          className="relative w-full h-full bg-white rounded-lg shadow-2xl border border-gray-600/30 overflow-hidden select-none"
        >
          {/* Subtle depth layers */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`stack-${i}`}
              className="absolute inset-0 bg-stone-50 rounded-lg"
              style={{
                transform: `translateZ(-${(i + 1) * 1}px) translateX(-${i * 0.5}px) translateY(-${i * 0.5}px)`,
                zIndex: -i - 1,
                opacity: 0.3 - i * 0.1
              }}
            />
          ))}

          {/* Current page with seamless transitions */}
          <div className="relative w-full h-full bg-white overflow-hidden">
            {/* Base layer - always shows current image */}
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full p-6 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={`/images/flipbook/${currentPage + 1}.jpg`}
                    alt={`Frame ${currentPage + 1}`}
                    fill
                    className="object-contain"
                    priority={currentPage < 3}
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* Animated overlay layers for seamless transitions */}
            <AnimatePresence>
              <motion.div
                key={`page-${currentPage}`}
                className="absolute inset-0 z-10"
                initial={{
                  scale: isFlipping ? 0.92 + Math.random() * 0.06 : 1,
                  x: isFlipping ? (Math.random() - 0.5) * 20 : 0,
                  y: isFlipping ? (Math.random() - 0.5) * 15 : 0,
                  opacity: isFlipping ? 0.6 : 1
                }}
                animate={{
                  scale: 1,
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                exit={{
                  scale: 0.88 + Math.random() * 0.08,
                  opacity: 0,
                  x: (Math.random() - 0.5) * 40,
                  y: (Math.random() - 0.5) * 30
                }}
                transition={fastSpringConfig}
                style={{
                  filter: isFlipping ? `blur(${Math.random() * 2}px) brightness(${0.8 + Math.random() * 0.4}) contrast(${1.1 + Math.random() * 0.2})` : 'none'
                }}
              >
                {/* Page content with spontaneous movement */}
                <motion.div 
                  className="w-full h-full p-6 flex items-center justify-center"
                  animate={{
                    x: isFlipping ? (Math.random() - 0.5) * 12 : 0,
                    y: isFlipping ? (Math.random() - 0.5) * 8 : 0,
                    scale: isFlipping ? 0.96 + Math.random() * 0.08 : 1,
                    skewX: isFlipping ? (Math.random() - 0.5) * 3 : 0,
                    skewY: isFlipping ? (Math.random() - 0.5) * 2 : 0
                  }}
                  transition={dissolveConfig}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={`/images/flipbook/${currentPage + 1}.jpg`}
                      alt={`Frame ${currentPage + 1}`}
                      fill
                      className="object-contain drop-shadow-sm"
                      priority={currentPage < 3}
                      draggable={false}
                    />
                  </div>
                </motion.div>

                {/* Page number */}
                <div className="absolute bottom-4 right-6 text-xs text-gray-400 font-light">
                  {currentPage + 1}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Overlapping next frame for seamless interweaving */}
            <AnimatePresence>
              {isFlipping && currentPage < totalPages - 1 && (
                <motion.div
                  className="absolute inset-0 z-5"
                  initial={{ 
                    opacity: 0,
                    scale: 0.9,
                    x: (Math.random() - 0.5) * 25,
                    y: (Math.random() - 0.5) * 20
                  }}
                  animate={{ 
                    opacity: 0.7,
                    scale: 0.98,
                    x: (Math.random() - 0.5) * 8,
                    y: (Math.random() - 0.5) * 6
                  }}
                  exit={{ opacity: 0 }}
                  transition={dissolveConfig}
                  style={{
                    mixBlendMode: 'soft-light',
                    filter: 'blur(0.5px) brightness(1.1)'
                  }}
                >
                  <div className="w-full h-full p-6 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src={`/images/flipbook/${currentPage + 2}.jpg`}
                        alt={`Frame ${currentPage + 2}`}
                        fill
                        className="object-contain"
                        draggable={false}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Previous frame dissolve overlay */}
            <AnimatePresence>
              {isFlipping && currentPage > 0 && (
                <motion.div
                  className="absolute inset-0 z-15"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ 
                    opacity: 0,
                    scale: 1.02,
                    x: (Math.random() - 0.5) * 20,
                    y: (Math.random() - 0.5) * 15
                  }}
                  exit={{ opacity: 0 }}
                  transition={dissolveConfig}
                  style={{
                    mixBlendMode: 'multiply',
                    filter: `blur(1px) brightness(${0.9 + Math.random() * 0.2})`
                  }}
                >
                  <div className="w-full h-full p-6 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src={`/images/flipbook/${currentPage}.jpg`}
                        alt={`Frame ${currentPage}`}
                        fill
                        className="object-contain"
                        draggable={false}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Title and controls info */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-gray-200 font-light text-sm mb-1 tracking-wide">
          Flipbook (1868)
        </h3>
        <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
          {isPlaying ? 'Playing automatically' : 'Paused'} • Press spacebar to {isPlaying ? 'pause' : 'play'}
        </p>
      </motion.div>
    </div>
  );
}

export default FlipbookSketch; 