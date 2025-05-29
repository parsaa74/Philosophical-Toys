import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RodenbroekerTitle from '../typography/RodenbroekerTitle';
import GrainBackgroundSketch from './GrainBackgroundSketch';

interface AnimatedIntroProps {
  onComplete: () => void;
}

export function AnimatedIntro({ onComplete }: AnimatedIntroProps) {
  const [showTitle, setShowTitle] = useState(true);
  const [isBackgroundExpanded, setIsBackgroundExpanded] = useState(false);

  const handleTitleComplete = () => {
    setShowTitle(false);
    setTimeout(() => {
      setIsBackgroundExpanded(true);
      // Call onComplete when background is expanded
      setTimeout(() => {
        onComplete();
      }, 800); // Match the duration of the background expansion animation
    }, 500);
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center"
      initial={false}
    >
      {/* Background Container */}
      <motion.div
        className="absolute"
        animate={{
          width: isBackgroundExpanded ? '100vw' : 'auto',
          height: isBackgroundExpanded ? '100vh' : 'auto',
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut"
        }}
      >
        <GrainBackgroundSketch
          size="medium"
          isExpanded={isBackgroundExpanded}
          enableSound={false}
        />
      </motion.div>

      {/* Title Container */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RodenbroekerTitle
              onComplete={handleTitleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AnimatedIntro; 