export interface TimelineItem {
  id: number;
  image: string;
  year: string;
  title: string;
  description: string;
  type: "image" | "interactive";
  interactive: boolean;
  sketchId?: string; // Optional sketchId for interactive items
  youtubeUrl?: string; // Optional YouTube URL for watching content
}

// The philosophical toys and cinema timeline data - 24 frames of history
export const timelineData: TimelineItem[] = [
  { id: 1, image: '/images/camera-obscura.jpg', title: 'Camera Obscura', year: '1550', description: 'Giovanni Battista della Porta describes the camera obscura principle in "Natural Magic". This optical device projects external scenes into a darkened room, becoming fundamental to understanding how images can be captured and observed.', type: "interactive" as const, interactive: true, sketchId: 'camera-obscura' },
  
  { id: 2, image: '/images/magic-lantern.jpg', title: 'Magic Lantern', year: '1659', description: 'Christiaan Huygens develops the magic lantern, projecting painted glass slides onto walls. This marks the first step toward projected entertainment and the philosophical exploration of light, shadow, and illusion.', type: "image" as const, interactive: false },
  
  { id: 3, image: '/images/Portable-Camera-Obscura.jpg', title: 'Portable Camera Obscura', year: '1685', description: 'Johann Zahn designs the first portable camera obscura, making the philosophical toy accessible to artists and natural philosophers for direct observation and drawing from nature.', type: "image" as const, interactive: false },
  
  { id: 4, image: '/images/magic-lantern-shows.jpg', title: 'Magic Lantern Shows', year: '1730', description: 'Magic lantern shows become popular entertainment across Europe. These "philosophical instruments" blur the line between education and spectacle, introducing audiences to the power of projected imagery.', type: "image" as const, interactive: false },
  
  { id: 5, image: '/images/Persistence-of-Vision-Theory.jpeg', title: 'Persistence of Vision Theory', year: '1768', description: 'Peter Mark Roget presents his theory of persistence of vision to the Royal Society. This scientific principle becomes the foundation for understanding how the eye and brain process sequential images as motion.', type: "image" as const, interactive: false },
  
  { id: 6, image: '/images/Camera-Lucida.jpg', title: 'Camera Lucida', year: '1807', description: 'William Hyde Wollaston invents the camera lucida, a drawing aid that superimposes the subject being viewed on the drawing surface. This philosophical toy helps artists achieve accurate proportions and perspective.', type: "image" as const, interactive: false },
  
  { id: 7, image: '/images/thaumatrope.jpeg', title: 'Thaumatrope', year: '1824', description: 'Dr. John Ayrton Paris invents the thaumatrope, a simple disk with different images on each side that appear to blend when spun rapidly. This "wonder turner" demonstrates persistence of vision in its most elegant form.', type: "interactive" as const, interactive: true, sketchId: 'thaumatrope' },
  
  { id: 8, image: '/images/phenakistoscope.jpg', title: 'Phenakistoscope', year: '1831', description: 'Joseph Plateau creates the phenakistoscope in Belgium, using a spinning disk with sequential drawings viewed through slits in a mirror. This philosophical toy creates the first true illusion of animated motion.', type: "interactive" as const, interactive: true, sketchId: 'phenakistoscope' },
  
  { id: 9, image: '/images/Stroboscope.jpg', title: 'Stroboscope', year: '1832', description: 'Simon von Stampfer independently invents the stroboscope in Austria, similar to the phenakistoscope. These competing devices spread the philosophical wonder of animated images across Europe.', type: "image" as const, interactive: false },
  
  { id: 10, image: '/images/zoetrope.webp', title: 'Zoetrope', year: '1834', description: 'William George Horner invents the "Wheel of Life" or zoetrope, improving on the phenakistoscope by allowing multiple viewers to watch the animation simultaneously through slits in a rotating drum.', type: "interactive" as const, interactive: true, sketchId: 'zoetrope' },
  
  { id: 11, image: '/images/photography.jpg', title: 'Photography Emerges', year: '1839', description: 'Louis Daguerre announces the daguerreotype process, creating the first practical photography method. This revolutionary technique captures permanent still images, setting the stage for motion picture development.', type: "image" as const, interactive: false },
  
  { id: 12, image: '/images/Choreutoscope.jpg', title: 'Choreutoscope', year: '1866', description: 'L.S. Beale creates the choreutoscope, a magic lantern that projects sequential photographic images to create motion. This device bridges the gap between photography and animation.', type: "image" as const, interactive: false },
  
  { id: 13, image: '/images/flip-book.jpg', title: 'Flip Book', year: '1868', description: 'John Barnes Linnett patents the kineograph or "flip book", democratizing animation by allowing anyone to create moving images with simple drawings and manual page-flipping action.', type: "interactive" as const, interactive: true, sketchId: 'flipbook' },
  
  { id: 14, image: '/images/Motion-Study-Photography.jpg', title: 'Motion Study Photography', year: '1872', description: 'Eadweard Muybridge begins his famous horse locomotion studies using multiple cameras with trip wires. These sequential photographs scientifically document motion for the first time.', type: "image" as const, interactive: false },
  
  { id: 15, image: '/images/praxinoscope.jpg', title: 'Praxinoscope', year: '1877', description: 'Émile Reynaud improves upon the zoetrope with his praxinoscope, using mirrors instead of slits to view the animation. This eliminates the strobing effect and creates smoother motion illusions.', type: "interactive" as const, interactive: true, sketchId: 'praxinoscope' },
  
  { id: 16, image: '/images/zoopraxiscope.jpg', title: 'Zoopraxiscope', year: '1879', description: 'Muybridge invents the zoopraxiscope, projecting his sequential photographs onto a screen using a magic lantern setup. This device creates the first true motion pictures from photographic sources.', type: "interactive" as const, interactive: true, sketchId: 'zoopraxiscope' },
  
  { id: 17, image: '/images/Praxinoscope-Theatre.jpg', title: 'Praxinoscope Theatre', year: '1880', description: 'Reynaud enhances his praxinoscope by adding a small theatre with scenery behind the spinning drum, creating more elaborate animated entertainment that prefigures cinema.', type: "image" as const, interactive: false },
  
  { id: 18, image: '/images/chronophotography.jpg', title: 'Chronophotography', year: '1882', description: 'Étienne-Jules Marey develops his chronophotographic gun, capturing multiple phases of motion on a single photographic plate. This scientific instrument advances the study of movement and time.', type: "image" as const, interactive: false },
  
  { id: 19, image: '/images/kinetoscope.jpg', title: 'Kinetoscope Development', year: '1888', description: 'Thomas Edison begins developing the Kinetoscope with William Kennedy Laurie Dickson, creating a peep-show device for viewing motion pictures. This represents the industrialization of moving image entertainment.', type: "image" as const, interactive: false },
  
  { id: 20, image: '/images/Theatre-Optique.jpg', title: 'Théâtre Optique', year: '1892', description: 'Reynaud opens his Théâtre Optique at the Musée Grévin in Paris, projecting hand-drawn animated films to paying audiences. This marks the beginning of commercial animated entertainment.', type: "image" as const, interactive: false },
  
  { id: 21, image: '/images/Kinetoscope Parlors.jpg', title: 'Kinetoscope Parlors', year: '1894', description: 'Edison\'s Kinetoscope parlors open in New York City, allowing individuals to view short motion pictures through peephole viewers. The philosophical toy becomes a commercial entertainment medium.', type: "image" as const, interactive: false },
  
  { id: 22, image: '/images/cinematograph.jpg', title: 'Cinematographe', year: '1895', description: 'The Lumière brothers present the first public film screening using their Cinematographe at the Grand Café in Paris. This projected motion picture system establishes cinema as a shared social experience.', type: "image" as const, interactive: false },
  
  { id: 23, image: '/images/Narrative-Cinema.jpg', title: 'Narrative Cinema', year: '1902', description: 'Georges Méliès creates "A Trip to the Moon", demonstrating cinema\'s potential for storytelling and fantasy. The philosophical toy evolves into an art form capable of exploring imagination and dreams.', type: "image" as const, interactive: false },
  
  { id: 24, image: '/images/The-Great-Train-Robbery.jpg', title: 'The Great Train Robbery', year: '1903', description: 'Edwin S. Porter\'s "The Great Train Robbery" establishes cinematic editing and narrative techniques. The journey from philosophical toys to cinema is complete, transforming how humanity experiences and understands reality.', type: "image" as const, interactive: false, youtubeUrl: 'https://www.youtube.com/watch?v=cT6Pz9t89Lk' },
];

// The Muybridge animation frames
export const MUYBRIDGE_IMAGES = Array.from({ length: 24 }, (_, i) =>
  `/images/optimized/Horse_Flode_Holden_trotting,_harnessed_to_sulky_with_driver_and_breaking_into_a_gallop_(rbm-QP301M8-1887-614a~${i+1}).webp`
); 