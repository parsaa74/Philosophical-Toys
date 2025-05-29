/**
 * INTRODUCTION TEXT AND INTERFACE CONTENT ARCHIVE
 * 
 * This file contains content extracted from the original IntroductionText component
 * and InteractiveZoetrope component for future reference. Use this information when 
 * adding details to frames or creating new components with similar aesthetic.
 */

// PARAGRAPHS CONTENT
export const introductionParagraphs = [
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

// ANIMATION VARIANTS
export const animationVariants = {
  // Word animation variants
  wordVariants: {
    hidden: {
      opacity: 0,
      y: 20,
      x: [Math.random() * 30 - 15], // Random X offset
      rotate: [Math.random() * 20 - 10], // Random rotation
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
  },
  
  // Sentence animation variants
  sentenceVariants: {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: i * 0.1 },
    }),
  }
};

// CSS STYLING NOTES
export const stylingNotes = {
  // Fonts used
  fonts: [
    "Playfair Display - elegant serif font for headers",
    "IM Fell English - antique-looking serif font (main text)",
    "Fredericka the Great - decorative display font"
  ],
  
  // Film and vintage effects
  filmEffects: [
    "Vignette effect using radial-gradient",
    "Film grain animation using transform and keyframes",
    "Flicker effect with opacity changes in keyframes",
    "Film lines using repeating-linear-gradient",
    "Double border with inner and outer frames",
    "Subtle blur and text shadow effects"
  ],
  
  // Color scheme
  colorScheme: [
    "Dark backgrounds (rgba(15, 15, 15, 0.85))",
    "Off-white text (rgba(255, 255, 255, 0.9))",
    "Subtle borders (rgba(100, 100, 100, 0.2))",
    "Subdued UI elements (rgba(30, 30, 30, 0.8))"
  ],
  
  // Animation effects
  animationEffects: [
    "Word-by-word staggered animations",
    "Spring physics for natural motion",
    "Random initial positions for organic feel",
    "Blur transitions between paragraph changes",
    "Subtle hover effects on buttons"
  ]
};

// Transition timing references
export const transitionTimings = {
  paragraphDisplayTime: 4000, // ms between paragraphs
  componentTotalDuration: 25000, // ms for entire component
  buttonAppearDelay: 3000, // ms after last paragraph
  transitionDuration: 500, // ms for fading transitions
  zoetropeAutoTransition: 7000 // ms to show zoetrope before auto-transitioning
};

// ZOETROPE COMPONENT CONTENT
export const zoetropeContent = {
  title: {
    main: "Philosophical Toys",
    subtitle: "Explore the magic of early animation through this interactive zoetrope"
  },
  
  infoPanel: {
    heading: "The Zoetrope",
    description: "A philosophical toy from the 1830s that creates the illusion of motion through a series of sequential images. When spun and viewed through the slits, the static images appear to come to life.",
    
    instructions: [
      "Click the \"Spin\" button to start the animation",
      "Adjust the speed using the slider",
      "Click the \"?\" button for more information"
    ],
    
    note: "This interactive model demonstrates how persistence of vision creates the illusion of movement, a principle that led to the development of cinema.",
    
    history: "The zoetrope was invented in 1834 by William George Horner, though similar devices had existed in China as early as 180 AD. It was one of several \"philosophical toys\" of the 19th century that explored optical illusions and the science of perception. These toys were precursors to motion pictures and animation, demonstrating how a series of still images could create the illusion of movement."
  }
};

// ZOETROPE COMPONENT STYLING NOTES
export const zoetropeStylingNotes = {
  // Layout
  layout: {
    container: "Fixed positioning with flexbox column layout",
    content: "Responsive flex layout (column on mobile, row on desktop)",
    sketchContainer: "Flexible sizing with dark background and box shadow",
    infoPanel: "Flexible sizing with semi-transparent background and border"
  },
  
  // Animation effects
  animations: {
    container: "0.8s opacity transition for visibility",
    title: "0.8s opacity and transform transitions",
    content: "1s opacity and transform transitions with slight delay" 
  },
  
  // Visual effects
  visualEffects: {
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
    letterSpacing: "0.05em for titles",
    borderRadius: "8px for containers",
    borders: "1px solid rgba(255, 255, 255, 0.1)"
  }
}; 