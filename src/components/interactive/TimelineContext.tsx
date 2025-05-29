import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { TimelineItem } from '../../data/timelineData';

// Add TypeScript declaration for the window.scrollTimeout property if not already defined
declare global {
  interface Window {
    scrollTimeout: NodeJS.Timeout | null;
  }
}

// Helper for wrapping indices
export function wrapIndex(idx: number, length: number) {
  return ((idx % length) + length) % length;
}

interface TimelineContextType {
  // Core state
  currentIndex: number;
  targetIndex: number;
  currentItem: TimelineItem | null;
  mode: 'still' | 'moving';
  showFixedFrame: boolean;
  showSpeedIndicator: boolean;
  currentMuybridgeIndex: number;
  scrollSpeed: number;
  timelineData: TimelineItem[];
  
  // Modal state
  isModalActive: boolean;
  modalData: TimelineItem | null;
  
  // Methods
  setCurrentIndex: (index: number) => void;
  setTargetIndex: (index: number) => void;
  triggerMovingMode: () => void;
  checkFastScrollThreshold: (isHighSpeed: boolean) => void;
  setShowSpeedIndicator: (show: boolean) => void;
  setCurrentMuybridgeIndex: (index: number) => void;
  updateCurrentItem: (item: TimelineItem | null) => void;
  openModal: (item: TimelineItem) => void;
  closeModal: () => void;
  
  // Refs - changed from RefObject to MutableRefObject to allow direct assignment
  currentIndexRef: React.MutableRefObject<number>;
  targetIndexRef: React.MutableRefObject<number>;
  scrollSpeedRef: React.MutableRefObject<number>;
  positionSlidesRef: React.MutableRefObject<((index: number) => void) | null>;
  currentMuybridgeIndexRef: React.MutableRefObject<number>;
  animationInProgressRef: React.MutableRefObject<boolean>;
  lastAnimationTimestampRef: React.MutableRefObject<number>;
  
  // Animation control
  setAnimationInProgress: (inProgress: boolean) => void;
  getAnimationStatus: () => boolean;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

interface TimelineProviderProps {
  children: React.ReactNode;
  timelineData: TimelineItem[];
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ 
  children,
  timelineData
}) => {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<TimelineItem | null>(null);
  const [mode, setMode] = useState<'still' | 'moving'>('still');
  const [showFixedFrame, setShowFixedFrame] = useState(false);
  const [showSpeedIndicator, setShowSpeedIndicator] = useState(false);
  const [currentMuybridgeIndex, setCurrentMuybridgeIndex] = useState(0);
  
  // Modal state
  const [isModalActive, setIsModalActive] = useState(false);
  const [modalData, setModalData] = useState<TimelineItem | null>(null);
  
  // Refs
  const currentIndexRef = useRef<number>(0);
  const targetIndexRef = useRef<number>(0);
  const scrollSpeedRef = useRef<number>(1);
  const positionSlidesRef = useRef<((index: number) => void) | null>(null);
  const currentMuybridgeIndexRef = useRef<number>(0);
  const animationInProgressRef = useRef<boolean>(false);
  const lastAnimationTimestampRef = useRef<number>(0);
  const movingModeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fastScrollCountRef = useRef(0);
  const fastScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFastScrollTimeRef = useRef(0);
  
  // Update refs when state changes
  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  
  React.useEffect(() => {
    targetIndexRef.current = targetIndex;
  }, [targetIndex]);
  
  React.useEffect(() => {
    currentMuybridgeIndexRef.current = currentMuybridgeIndex;
  }, [currentMuybridgeIndex]);
  
  // Fast scroll detection and mode switching
  const resetFastScrollCounters = useCallback(() => {
    fastScrollCountRef.current = 0;
    if (fastScrollTimerRef.current) {
      clearTimeout(fastScrollTimerRef.current);
      fastScrollTimerRef.current = null;
    }
  }, []);
  
  const triggerMovingMode = useCallback(() => {
    if (mode !== 'moving') {
      setMode('moving');
      // Set a consistent speed for film mode
      scrollSpeedRef.current = 8;
      // Show the fixed frame when entering moving mode
      setShowFixedFrame(true);
      
      // Show a notification about mode change
      const notification = document.createElement('div');
      notification.className = 'modeNotification';
      notification.textContent = 'Film Animation Mode Activated - Scroll to Control Speed';
      document.body.appendChild(notification);
      // Remove notification after animation
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 3000);
      
      // Reset animation timestamp for consistent movement
      lastAnimationTimestampRef.current = 0;
      // Reset references for Muybridge animation
      setCurrentMuybridgeIndex(0);
      currentMuybridgeIndexRef.current = 0;
      
      // Reset fast scroll counters when we enter film mode
      resetFastScrollCounters();
    }
    
    if (movingModeTimeoutRef.current) clearTimeout(movingModeTimeoutRef.current);
    
    // Adaptive timeout based on current speed
    const timeoutDuration = Math.min(5000, 3000 + (scrollSpeedRef.current - 1) * 1000);
    movingModeTimeoutRef.current = setTimeout(() => {
      if (mode === 'moving') {
        setMode('still');
        // Hide the fixed frame when leaving moving mode
        setShowFixedFrame(false);
        
        // Show a notification about mode change
        const notification = document.createElement('div');
        notification.className = 'modeNotification';
        notification.textContent = 'Timeline Mode - Click Items to View Details';
        document.body.appendChild(notification);
        // Remove notification after animation
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 3000);
        
        // When transitioning back to still mode, ensure we're on a whole index
        const roundedIndex = Math.round(currentIndexRef.current);
        setTargetIndex(roundedIndex);
        targetIndexRef.current = roundedIndex;
        
        // Reset velocity and speed for consistent still mode
        scrollSpeedRef.current = 1;
        
        // Reset animation timestamp for consistent movement
        lastAnimationTimestampRef.current = 0;
        
        // Reset fast scroll counters when we exit film mode
        resetFastScrollCounters();
      }
    }, timeoutDuration);
  }, [mode, resetFastScrollCounters]);
  
  // Check if we should enter moving mode
  const checkFastScrollThreshold = useCallback((isHighSpeed: boolean) => {
    const now = Date.now();
    
    // If it's been more than 500ms since the last fast scroll, reset the counter
    if (now - lastFastScrollTimeRef.current > 500) {
      fastScrollCountRef.current = 0;
      if (fastScrollTimerRef.current) {
        clearTimeout(fastScrollTimerRef.current);
        fastScrollTimerRef.current = null;
      }
    }
    
    // Update the last fast scroll time
    lastFastScrollTimeRef.current = now;
    
    // If we have a high speed event, increment the counter
    if (isHighSpeed) {
      fastScrollCountRef.current++;
      
      // Start a timer if not already running
      if (!fastScrollTimerRef.current) {
        fastScrollTimerRef.current = setTimeout(() => {
          // If we've had enough fast scroll events within the threshold time,
          // trigger moving mode
          if (fastScrollCountRef.current >= 20) {
            triggerMovingMode();
          }
          
          // Reset counters
          resetFastScrollCounters();
        }, 5000); // 5 second threshold
      }
      
      // If we've reached a high enough count immediately, trigger moving mode
      if (fastScrollCountRef.current >= 35) {
        triggerMovingMode();
        resetFastScrollCounters();
      }
    }
  }, [triggerMovingMode, resetFastScrollCounters]);
  
  // Modal handlers
  const openModal = useCallback((item: TimelineItem) => {
    setModalData(item);
    setIsModalActive(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsModalActive(false);
    setModalData(null);
  }, []);
  
  // Animation control
  const setAnimationInProgress = useCallback((inProgress: boolean) => {
    animationInProgressRef.current = inProgress;
  }, []);
  
  const getAnimationStatus = useCallback(() => {
    return animationInProgressRef.current;
  }, []);
  
  // Update current item
  const updateCurrentItem = useCallback((item: TimelineItem | null) => {
    setCurrentItem(item);
  }, []);
  
  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (movingModeTimeoutRef.current) clearTimeout(movingModeTimeoutRef.current);
      if (fastScrollTimerRef.current) clearTimeout(fastScrollTimerRef.current);
    };
  }, []);
  
  const contextValue: TimelineContextType = {
    // Core state
    currentIndex,
    targetIndex,
    currentItem,
    mode,
    showFixedFrame,
    showSpeedIndicator,
    currentMuybridgeIndex,
    scrollSpeed: scrollSpeedRef.current,
    timelineData,
    
    // Modal state
    isModalActive,
    modalData,
    
    // Methods
    setCurrentIndex,
    setTargetIndex,
    triggerMovingMode,
    checkFastScrollThreshold,
    setShowSpeedIndicator,
    setCurrentMuybridgeIndex,
    updateCurrentItem,
    openModal,
    closeModal,
    
    // Refs
    currentIndexRef,
    targetIndexRef,
    scrollSpeedRef,
    positionSlidesRef,
    currentMuybridgeIndexRef,
    animationInProgressRef,
    lastAnimationTimestampRef,
    
    // Animation control
    setAnimationInProgress,
    getAnimationStatus,
  };
  
  return (
    <TimelineContext.Provider value={contextValue}>
      {children}
    </TimelineContext.Provider>
  );
};

// Custom hook to use the timeline context
export const useTimelineContext = () => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error('useTimelineContext must be used within a TimelineProvider');
  }
  return context;
}; 