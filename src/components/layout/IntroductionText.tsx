import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './IntroductionText.module.css';

interface IntroductionTextProps {
  onComplete?: () => void;
}

const paragraphs = [
  {
    text: "In the enchanting realm of the 19th century, a remarkable fusion of science and wonder gave birth to what became known as 'philosophical toys'",
    subtitle: "devices that danced on the boundary between scientific discovery and pure entertainment.",
    delay: 0
  },
  {
    text: "These ingenious contraptions were more than mere playthings",
    subtitle: "they were windows into the mysteries of human perception, gateways to understanding how our minds process motion, light, and time.",
    delay: 2
  },
  {
    text: "From the hypnotic spin of the phenakistiscope to the mesmerizing flicker of the zoetrope",
    subtitle: "each toy held within its mechanical heart a profound truth about the nature of vision and the persistence of images in our minds.",
    delay: 4
  },
  {
    text: "What began as tools for scientific experimentation in royal courts and academic halls",
    subtitle: "gradually transformed into sources of wonder for children and adults alike, forever changing how we understand and create moving images.",
    delay: 6
  },
  {
    text: "Let us journey through time on a visual timeline of these remarkable inventions",
    subtitle: "from early optical devices to the birth of cinema, discovering how each advanced our understanding of motion and perception.",
    delay: 8
  }
];

export function IntroductionText({ onComplete }: IntroductionTextProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  const sentenceVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: i * 0.1 },
    }),
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      x: Math.random() * 30 - 15,
      rotate: Math.random() * 20 - 10,
      filter: 'blur(3px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      rotate: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    if (onComplete) {
      setTimeout(() => onComplete(), 1000);
    }
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(() => onComplete(), 1000);
      }
    }, 25000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentParagraph(prev => {
            const nextParagraph = prev < paragraphs.length - 1 ? prev + 1 : prev;
            
            // Show continue button on last paragraph
            if (nextParagraph === paragraphs.length - 1) {
              setTimeout(() => {
                setShowContinueButton(true);
              }, 3000);
            }
            
            return nextParagraph;
          });
          setIsTransitioning(false);
        }, 500);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${styles.container} relative z-10`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={styles.filmFrame}>
              <div className={styles.innerFrame}>
                <motion.div 
                  className={styles.contentWrapper}
                  animate={{
                    opacity: isTransitioning ? 0 : 1,
                    scale: isTransitioning ? 0.98 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h2
                    key={`title-${currentParagraph}`}
                    className={styles.title}
                    variants={sentenceVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {paragraphs[currentParagraph].text.split(' ').map((word, index) => (
                      <motion.span
                        key={`title-word-${currentParagraph}-${index}`}
                        variants={wordVariants}
                        className={styles.wordSpan}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.h2>
                  
                  <motion.p
                    key={`subtitle-${currentParagraph}`}
                    className={styles.subtitle}
                    variants={sentenceVariants}
                    initial="hidden"
                    animate="visible"
                    custom={2} // Add a slight delay for subtitle to start after title
                  >
                    {paragraphs[currentParagraph].subtitle.split(' ').map((word, index) => (
                      <motion.span
                        key={`subtitle-word-${currentParagraph}-${index}`}
                        variants={wordVariants}
                        className={styles.wordSpan}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.p>
                </motion.div>
              </div>
            </div>

            <motion.div className={styles.buttonContainer}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0.7 }}
                transition={{ duration: 0.3 }}
                onClick={handleSkip}
                className={styles.skipButton}
              >
                Skip Introduction
              </motion.button>

              {showContinueButton && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={styles.continueButton}
                  onClick={handleSkip}
                >
                  Continue to Timeline →
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IntroductionText;