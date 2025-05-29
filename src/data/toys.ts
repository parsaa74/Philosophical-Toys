export interface Toy {
  id: string;
  name: string;
  slug: string;
  inventor: string;
  year: number;
  description: string;
  category: string;
  image?: string; // path to image or SVG
  video?: string; // path to video loop
  references?: string[]; // URLs or citation strings
  perceptualArgument: string; // The core philosophical or perceptual point the toy makes
  historicalContext: string; // Brief historical or media archaeology context
  artifactKeywords: string[]; // Keywords related to its function as an artifact
  tags?: string[];
}

export const toys: Toy[] = [
  {
    id: '1',
    name: 'Philosophical Dodecahedron',
    slug: 'philosophical-dodecahedron',
    inventor: 'Unknown',
    year: 1850,
    description: 'A geometric object representing the platonic ideal of symmetry and mathematical beauty.',
    category: 'mechanical',
    image: '/globe.svg',
    perceptualArgument: 'The dodecahedron, as Plato described, is a symbol of the cosmos—its symmetry a metaphor for the harmony of the universe and the underlying mathematical structure of reality.',
    historicalContext: 'Associated with Plato\'s cosmology, representing the element of the universe or cosmos itself. Its form has fascinated mathematicians and philosophers for centuries.',
    artifactKeywords: ['platonic solid', 'geometry', 'cosmos', 'symmetry', 'ideal form'],
    tags: ['geometry', 'symmetry', 'platonic solids'],
    references: [
      'https://en.wikipedia.org/wiki/Dodecahedron',
      'Plato, Timaeus'
    ]
  },
  {
    id: '2',
    name: 'Zoetrope',
    slug: 'zoetrope',
    inventor: 'William George Horner',
    year: 1834,
    description: 'A device that produces the illusion of motion by displaying a sequence of drawings or photographs.',
    category: 'optical',
    video: '/zoetrope-loop.mp4',
    perceptualArgument: 'Demonstrates how a sequence of static images creates the illusion of continuous motion, a foundational principle of cinema and a commentary on constructed reality.',
    historicalContext: 'Invented in the 1830s by William George Horner, the Zoetrope was a popular parlor toy that showcased the persistence of vision, a key step in media archaeology towards cinema.',
    artifactKeywords: ['illusion of motion', 'persistence of vision', 'pre-cinema', 'optical toy', 'animation device'],
    tags: ['animation', 'illusion', 'cinema'],
    references: [
      'https://en.wikipedia.org/wiki/Zoetrope'
    ]
  },
  {
    id: '3',
    name: 'Camera Obscura',
    slug: 'camera-obscura',
    inventor: 'Ibn al-Haytham',
    year: 1021,
    description: 'An optical device that projects an image of its surroundings on a screen.',
    category: 'optical',
    image: '/window.svg',
    perceptualArgument: 'Reveals the fundamental optical principle of image projection, questioning the directness of perception by showing how light forms inverted images.',
    historicalContext: 'Known since antiquity (e.g., Mozi in China, Aristotle in Greece) and formally described by Ibn al-Haytham, it was crucial for developments in optics, art, and early photography.',
    artifactKeywords: ['optics', 'projection', 'light', 'image formation', 'pre-photography'],
    tags: ['projection', 'light'],
  },
  {
    id: '4',
    name: 'Phenakistoscope',
    slug: 'phenakistoscope',
    inventor: 'Joseph Plateau',
    year: 1832,
    description: 'An early animation device that used the persistence of vision principle to create an illusion of motion.',
    category: 'optical',
    perceptualArgument: 'The phenakistoscope demonstrates the cyclical nature of perception and the construction of movement from stillness, highlighting the active role of the viewer in creating motion.',
    historicalContext: 'Invented by Joseph Plateau around 1832, it was one of the first devices to create a fluid illusion of motion, relying on stroboscopic effects.',
    artifactKeywords: ['stroboscopic effect', 'early animation', 'visual illusion', 'persistence of vision'],
    tags: ['animation', 'illusion'],
  },
  {
    id: '5',
    name: 'Aeolian Harp',
    slug: 'aeolian-harp',
    inventor: 'Athanasius Kircher',
    year: 1650,
    description: 'A musical instrument that is played by the wind, exploring the relationship between nature and sound.',
    category: 'sound',
    image: '/file.svg',
    perceptualArgument: 'Explores the aesthetic possibilities of chance and natural forces in creating sound, challenging notions of authorship and intentionality in art.',
    historicalContext: 'Described by Athanasius Kircher in the 17th century, these instruments were popular in Romanticism for their evocation of natural, ethereal music.',
    artifactKeywords: ['sound art', 'natural forces', 'aleatoric music', 'wind instrument'],
  },
  {
    id: '6',
    name: 'Thaumatrope',
    slug: 'thaumatrope',
    inventor: 'John Ayrton Paris',
    year: 1824,
    description: 'A simple optical toy that demonstrates the persistence of vision through a spinning disk with images on both sides.',
    category: 'optical',
    perceptualArgument: 'A simple yet profound demonstration of how the brain merges two distinct images into a single, coherent one when presented in rapid succession, illustrating the synthetic nature of vision.',
    historicalContext: 'Popularized in the 19th century by John Ayrton Paris, it\'s a classic example of an optical toy based on the persistence of vision.',
    artifactKeywords: ['optical illusion', 'persistence of vision', 'image synthesis', 'parlor toy'],
  },
  // ...more toys can be added here
];