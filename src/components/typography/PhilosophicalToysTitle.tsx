import React from 'react';
import { motion } from 'framer-motion';

interface PhilosophicalToysTitleProps {
  variant?: 'primary' | 'minimal' | 'ornate';
  size?: 'small' | 'medium' | 'large' | 'hero';
  animate?: boolean;
  className?: string;
}

export const PhilosophicalToysTitle: React.FC<PhilosophicalToysTitleProps> = ({
  variant = 'primary',
  size = 'medium',
  animate = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'text-2xl md:text-3xl',
    medium: 'text-3xl md:text-4xl lg:text-5xl',
    large: 'text-4xl md:text-5xl lg:text-6xl',
    hero: 'text-5xl md:text-6xl lg:text-7xl xl:text-8xl'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          philosophical: 'font-light tracking-[0.15em] text-white/90',
          toys: 'font-bold tracking-[0.05em] text-white',
          container: 'gap-4'
        };
      case 'ornate':
        return {
          philosophical: 'font-normal tracking-[0.1em] text-white/80 italic',
          toys: 'font-black tracking-[-0.02em] text-white',
          container: 'gap-2'
        };
      default: // primary
        return {
          philosophical: 'font-medium tracking-[0.12em] text-white/85',
          toys: 'font-bold tracking-[0.02em] text-white',
          container: 'gap-3'
        };
    }
  };

  const styles = getVariantStyles();
  const philosophicalLetters = "philosophical".split("");
  const toysLetters = "toys".split("");

  const MotionComponent = animate ? motion.div : 'div';
  const MotionSpan = animate ? motion.span : 'span';

  return (
    <MotionComponent
      className={`flex flex-col items-center justify-center ${styles.container} ${sizeClasses[size]} ${className}`}
      variants={animate ? containerVariants : undefined}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
    >
      {/* Philosophical */}
      <div className="flex items-center justify-center">
        {philosophicalLetters.map((letter, index) => (
          <MotionSpan
            key={`philosophical-${index}`}
            className={`inline-block ${styles.philosophical}`}
            variants={animate ? letterVariants : undefined}
            style={{ 
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            {letter}
          </MotionSpan>
        ))}
      </div>

      {/* Separator Line */}
      <MotionComponent
        className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
        variants={animate ? {
          hidden: { scaleX: 0, opacity: 0 },
          visible: { 
            scaleX: 1, 
            opacity: 1,
            transition: { 
              duration: 0.8, 
              delay: 1.2,
              ease: "easeInOut" 
            }
          }
        } : undefined}
      />

      {/* Toys */}
      <div className="flex items-center justify-center">
        {toysLetters.map((letter, index) => (
          <MotionSpan
            key={`toys-${index}`}
            className={`inline-block ${styles.toys}`}
            variants={animate ? {
              ...letterVariants,
              visible: {
                ...letterVariants.visible,
                transition: {
                  ...letterVariants.visible.transition,
                  delay: 1.0 + (index * 0.1)
                }
              }
            } : undefined}
            style={{ 
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              textShadow: '0 2px 15px rgba(255, 255, 255, 0.2)'
            }}
          >
            {letter}
          </MotionSpan>
        ))}
      </div>

      {/* Subtitle */}
      <MotionComponent
        className="text-xs md:text-sm font-light tracking-[0.2em] text-white/50 mt-2 uppercase"
        variants={animate ? {
          hidden: { opacity: 0, y: 10 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.6, 
              delay: 2.0 
            }
          }
        } : undefined}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Digital Atelier
      </MotionComponent>
    </MotionComponent>
  );
};

export default PhilosophicalToysTitle;