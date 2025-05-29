'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface ModernTitleProps {
  className?: string;
  animated?: boolean;
}

export const ModernTitle: React.FC<ModernTitleProps> = ({ 
  className = '', 
  animated = true 
}) => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animated) {
      controls.start('visible');
    }
  }, [controls, animated]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const lineVariants = {
    hidden: { 
      scaleX: 0,
      opacity: 0
    },
    visible: { 
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const subtitleVariants = {
    hidden: { 
      opacity: 0,
      letterSpacing: '0.5em'
    },
    visible: { 
      opacity: 1,
      letterSpacing: '0.15em',
      transition: {
        duration: 1.0,
        delay: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={`flex flex-col items-center justify-center space-y-6 ${className}`}
      variants={containerVariants}
      initial={animated ? "hidden" : "visible"}
      animate={controls}
    >
      {/* Main Title */}
      <div className="relative">
        {/* Background geometric elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-white/20 to-transparent"
            style={{ transform: 'translateX(-50%)' }}
            variants={lineVariants}
          />
          <motion.div
            className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{ transform: 'translateY(-50%)' }}
            variants={lineVariants}
          />
        </div>

        {/* Philosophical */}
        <motion.div
          className="text-center mb-4"
          variants={textVariants}
        >
          <h1
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[0.08em] text-white/90"
            style={{ 
              fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
              fontWeight: 300,
              lineHeight: 0.85,
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            PHILOSOPHICAL
          </h1>
        </motion.div>

        {/* Central divider with mathematical precision */}
        <motion.div 
          className="flex items-center justify-center my-6"
          variants={lineVariants}
        >
          <div className="flex items-center space-x-4">
            <div className="w-8 h-[1px] bg-white/60" />
            <div className="w-2 h-2 border border-white/60 rotate-45" />
            <div className="w-8 h-[1px] bg-white/60" />
          </div>
        </motion.div>

        {/* Toys */}
        <motion.div
          className="text-center mt-4"
          variants={textVariants}
        >
          <h2
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-[-0.01em] text-white"
            style={{ 
              fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
              fontWeight: 700,
              lineHeight: 0.85,
              textShadow: '0 6px 30px rgba(255, 255, 255, 0.15)'
            }}
          >
            TOYS
          </h2>
        </motion.div>
      </div>

      {/* Subtitle with refined typography */}
      <motion.div
        className="text-center"
        variants={subtitleVariants}
      >
        <p
          className="text-xs md:text-sm font-normal text-white/50 uppercase"
          style={{ 
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 400,
            letterSpacing: '0.15em'
          }}
        >
          Digital Atelier — Est. 2024
        </p>
      </motion.div>

      {/* Bottom accent line */}
      <motion.div
        className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
        variants={lineVariants}
      />
    </motion.div>
  );
};

export default ModernTitle;