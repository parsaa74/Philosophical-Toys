'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface RodenbroekerTitleProps {
  onComplete?: () => void;
  className?: string;
}

export const RodenbroekerTitle: React.FC<RodenbroekerTitleProps> = ({ 
  onComplete,
  className = '' 
}) => {
  const controls = useAnimation();
  const [phase, setPhase] = useState<'entering' | 'settled' | 'exiting'>('entering');
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const sequence = async () => {
      // Start the entrance animation
      await controls.start('visible');
      setPhase('settled');
      
      // Stay visible for 4 seconds to allow contemplation, then exit
      timerRef.current = setTimeout(async () => {
        setPhase('exiting');
        await controls.start('exit');
        onComplete?.();
      }, 4000);
    };

    sequence();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [controls, onComplete]);

  // Floating toy shapes - representing the playful nature
  const floatingShapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 12 + 8,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)]
  }));

  // Geometric grid system - Tim Rodenbroeker signature
  const gridVariants = {
    hidden: { 
      scaleX: 0,
      opacity: 0,
      originX: 0.5
    },
    visible: { 
      scaleX: 1,
      opacity: 0.12,
      transition: {
        duration: 2.0,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      scaleX: 0,
      opacity: 0,
      transition: {
        duration: 1.0,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Mathematical precision in letter animations - more contemplative
  const letterVariants = {
    hidden: { 
      opacity: 0,
      y: 60,
      x: 0,
      scale: 0.7,
      rotateZ: 0
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotateZ: 0,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 200,
        delay: i * 0.06,
        duration: 1.2
      }
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -40,
      x: (i % 2 === 0 ? 1 : -1) * 30,
      scale: 0.8,
      rotateZ: (i % 2 === 0 ? 1 : -1) * 8,
      transition: {
        duration: 0.8,
        delay: i * 0.03,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  // Sophisticated container animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  // Contemplative divider with breathing motion
  const dividerVariants = {
    hidden: { 
      scaleX: 0,
      opacity: 0
    },
    visible: { 
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 1.8,
        delay: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      scaleX: 0,
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Floating shapes variants
  const shapeVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      rotate: 0
    },
    visible: (shape: { duration: number; delay: number }) => ({
      opacity: 0.15,
      scale: 1,
      rotate: 360,
      transition: {
        duration: shape.duration,
        delay: shape.delay,
        repeat: Infinity,
        ease: "linear"
      }
    }),
    exit: {
      opacity: 0,
      scale: 0,
      transition: { duration: 0.5 }
    }
  };

  const philosophicalLetters = "philosophical".split("");
  const toysLetters = "toys".split("");

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${className}`}>
      {/* Floating geometric toys - representing playfulness and wonder */}
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute pointer-events-none"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
          }}
          variants={shapeVariants}
          custom={shape}
          initial="hidden"
          animate={controls}
        >
          {shape.shape === 'circle' && (
            <motion.div 
              className="w-full h-full border border-white/20 rounded-full"
              animate={{ 
                y: [0, -20, 0],
                rotate: phase === 'settled' ? [0, 180, 360] : 0
              }}
              transition={{ 
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
            />
          )}
          {shape.shape === 'square' && (
            <motion.div 
              className="w-full h-full border border-white/15 rotate-45"
              animate={{ 
                x: [0, 15, 0],
                scale: phase === 'settled' ? [1, 1.2, 1] : 1
              }}
              transition={{ 
                x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          )}
          {shape.shape === 'triangle' && (
            <motion.div 
              className="w-full h-full"
              animate={{ 
                rotate: phase === 'settled' ? [0, 120, 240, 360] : 0,
                y: [0, -10, 0]
              }}
              transition={{ 
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-transparent border-b-white/20" />
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Background grid system - computational design signature */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        variants={gridVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Vertical grid lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-[1px] bg-white/8"
            style={{ left: `${(i + 1) * 8.33}%` }}
            variants={{
              hidden: { scaleY: 0, opacity: 0 },
              visible: { 
                scaleY: 1, 
                opacity: 0.08,
                transition: { 
                  delay: i * 0.08,
                  duration: 1.5,
                  ease: "easeOut"
                }
              },
              exit: { scaleY: 0, opacity: 0 }
            }}
          />
        ))}
        
        {/* Horizontal grid lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-[1px] bg-white/5"
            style={{ top: `${(i + 1) * 12.5}%` }}
            variants={{
              hidden: { scaleX: 0, opacity: 0 },
              visible: { 
                scaleX: 1, 
                opacity: 0.05,
                transition: { 
                  delay: 0.8 + i * 0.05,
                  duration: 1.8,
                  ease: "easeOut"
                }
              },
              exit: { scaleX: 0, opacity: 0 }
            }}
          />
        ))}
      </motion.div>

      {/* Main title container with thoughtful layout */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Philosophical - refined typographic treatment with contemplative feel */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {philosophicalLetters.map((letter, index) => (
              <motion.span
                key={`philosophical-${index}`}
                className="inline-block text-4xl md:text-5xl lg:text-6xl font-light text-white/85"
                style={{ 
                  fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                  fontWeight: 300,
                  letterSpacing: '0.12em',
                  lineHeight: 1,
                  textShadow: '0 6px 25px rgba(255, 255, 255, 0.08)'
                }}
                variants={letterVariants}
                custom={index}
                whileHover={{
                  scale: 1.05,
                  textShadow: '0 8px 30px rgba(255, 255, 255, 0.15)',
                  transition: { duration: 0.3 }
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Contemplative divider with breathing motion */}
        <motion.div 
          className="flex items-center justify-center mb-10"
          variants={dividerVariants}
        >
          <div className="flex items-center space-x-8">
            {/* Left segment with subtle glow */}
            <motion.div 
              className="w-20 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-white/20"
              animate={{ 
                opacity: phase === 'settled' ? [0.5, 0.8, 0.5] : 0.5 
              }}
              transition={{ 
                duration: 3,
                repeat: phase === 'settled' ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            
            {/* Central contemplative element - breathing square */}
            <motion.div
              className="relative"
              animate={{ 
                rotate: phase === 'settled' ? [0, 360] : 0,
                scale: phase === 'settled' ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                rotate: {
                  duration: 12,
                  ease: "linear",
                  repeat: phase === 'settled' ? Infinity : 0
                },
                scale: {
                  duration: 4,
                  ease: "easeInOut",
                  repeat: phase === 'settled' ? Infinity : 0
                }
              }}
            >
              <div className="w-4 h-4 border border-white/50 rotate-45 relative">
                <div className="absolute inset-0 w-4 h-4 bg-white/8 rotate-45" />
                <motion.div 
                  className="absolute inset-1 w-2 h-2 border border-white/30"
                  animate={{ 
                    rotate: phase === 'settled' ? [0, -360] : 0 
                  }}
                  transition={{ 
                    duration: 8,
                    ease: "linear",
                    repeat: phase === 'settled' ? Infinity : 0
                  }}
                />
              </div>
            </motion.div>
            
            {/* Right segment */}
            <motion.div 
              className="w-20 h-[1px] bg-gradient-to-l from-transparent via-white/50 to-white/20"
              animate={{ 
                opacity: phase === 'settled' ? [0.5, 0.8, 0.5] : 0.5 
              }}
              transition={{ 
                duration: 3,
                repeat: phase === 'settled' ? Infinity : 0,
                ease: "easeInOut",
                delay: 1.5
              }}
            />
          </div>
        </motion.div>

        {/* Toys - playful yet sophisticated approach */}
        <div>
          <div className="flex items-center justify-center">
            {toysLetters.map((letter, index) => (
              <motion.span
                key={`toys-${index}`}
                className="inline-block text-5xl md:text-6xl lg:text-7xl font-bold text-white"
                style={{ 
                  fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                  textShadow: '0 8px 35px rgba(255, 255, 255, 0.12)'
                }}
                variants={letterVariants}
                custom={philosophicalLetters.length + index}
                whileHover={{
                  scale: 1.08,
                  rotate: 2,
                  textShadow: '0 10px 40px rgba(255, 255, 255, 0.2)',
                  transition: { duration: 0.3 }
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Philosophical metadata - more thoughtful */}
        <motion.div
          className="mt-16 text-center"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 1.2, 
                delay: 2.0,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            },
            exit: {
              opacity: 0,
              y: -15,
              transition: { duration: 0.6 }
            }
          }}
        >
          <p
            className="text-xs font-normal text-white/35 uppercase tracking-[0.25em] mb-2"
            style={{ 
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 400
            }}
          >
            Where Wonder Meets Wisdom
          </p>
          <motion.p
            className="text-[10px] font-light text-white/25 italic tracking-[0.15em]"
            style={{ 
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 300
            }}
            animate={{
              opacity: phase === 'settled' ? [0.25, 0.4, 0.25] : 0.25
            }}
            transition={{
              duration: 5,
              repeat: phase === 'settled' ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            Interactive Contemplations • Digital Playground
          </motion.p>
        </motion.div>

        {/* Thoughtful accent elements */}
        <motion.div
          className="mt-8 flex items-center justify-center space-x-3"
          variants={{
            hidden: { opacity: 0, scale: 0.7 },
            visible: { 
              opacity: 1, 
              scale: 1,
              transition: { 
                duration: 0.8, 
                delay: 2.5,
                ease: "easeOut"
              }
            },
            exit: {
              opacity: 0,
              scale: 0.7,
              transition: { duration: 0.4 }
            }
          }}
        >
          <motion.div 
            className="w-1.5 h-1.5 bg-white/40 rounded-full"
            animate={{
              scale: phase === 'settled' ? [1, 1.3, 1] : 1,
              opacity: phase === 'settled' ? [0.4, 0.7, 0.4] : 0.4
            }}
            transition={{
              duration: 2,
              repeat: phase === 'settled' ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{
              scaleX: phase === 'settled' ? [1, 1.2, 1] : 1
            }}
            transition={{
              duration: 3,
              repeat: phase === 'settled' ? Infinity : 0,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="w-1.5 h-1.5 bg-white/40 rounded-full"
            animate={{
              scale: phase === 'settled' ? [1, 1.3, 1] : 1,
              opacity: phase === 'settled' ? [0.4, 0.7, 0.4] : 0.4
            }}
            transition={{
              duration: 2,
              repeat: phase === 'settled' ? Infinity : 0,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RodenbroekerTitle; 