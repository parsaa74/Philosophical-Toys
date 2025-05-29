import { toys, Toy } from '@/data/toys';

describe('Data Model', () => {
  // Test 1: Data model structure
  test('toys data model supports rich content types', () => {
    // Verify the interface supports all our required fields
    const requiredFields: Array<keyof Toy> = [
      'id', 
      'name', 
      'slug', 
      'inventor', 
      'year', 
      'description', 
      'category'
    ];
    
    const optionalFields: Array<keyof Toy> = [
      'image', 
      'video', 
      'references', 
      'philosophical_notes', 
      'tags'
    ];
    
    // Check that our toys data includes items with all the required fields
    toys.forEach(toy => {
      requiredFields.forEach(field => {
        expect(toy[field]).toBeDefined();
      });
    });
    
    // Check that at least one toy has each optional field
    optionalFields.forEach(field => {
      const hasToyWithField = toys.some(toy => toy[field] !== undefined);
      expect(hasToyWithField).toBe(true);
    });
  });
  
  // Test 2: Research and scholarly aspects
  test('data model captures research and scholarly information', () => {
    // Verify we have toys with philosophical notes
    const toysWithNotes = toys.filter(toy => toy.philosophical_notes);
    expect(toysWithNotes.length).toBeGreaterThan(0);
    
    // Verify we have toys with references
    const toysWithReferences = toys.filter(toy => toy.references && toy.references.length > 0);
    expect(toysWithReferences.length).toBeGreaterThan(0);
    
    // Verify we have toys with tags for knowledge categorization
    const toysWithTags = toys.filter(toy => toy.tags && toy.tags.length > 0);
    expect(toysWithTags.length).toBeGreaterThan(0);
  });
  
  // Test 3: Media richness
  test('data model supports multiple types of media', () => {
    // Verify we have toys with images
    const toysWithImages = toys.filter(toy => toy.image);
    expect(toysWithImages.length).toBeGreaterThan(0);
    
    // Verify we have toys with videos
    const toysWithVideos = toys.filter(toy => toy.video);
    expect(toysWithVideos.length).toBeGreaterThan(0);
  });
  
  // Test 4: Categories for organization
  test('toys are properly categorized', () => {
    // Get the set of unique categories
    const categories = new Set(toys.map(toy => toy.category));
    
    // Verify we have multiple categories
    expect(categories.size).toBeGreaterThan(1);
    
    // Verify we have the expected categories
    expect(categories.has('mechanical')).toBe(true);
    expect(categories.has('optical')).toBe(true);
    
    // Verify each category has at least one toy
    for (const category of categories) {
      const toysInCategory = toys.filter(toy => toy.category === category);
      expect(toysInCategory.length).toBeGreaterThan(0);
    }
  });
  
  // Test 5: Historical context
  test('data model captures historical context', () => {
    // Verify we have toys from different time periods
    const years = toys.map(toy => toy.year);
    const uniqueYears = new Set(years);
    
    // We should have toys from multiple years
    expect(uniqueYears.size).toBeGreaterThan(1);
    
    // Verify time span covers multiple centuries
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearSpan = maxYear - minYear;
    
    expect(yearSpan).toBeGreaterThan(100); // Span covers at least a century
  });
  
  // Test 6: Extensibility
  test('data model can be extended with new fields', () => {
    // Create a mock extended toy with new fields
    const extendedToy = {
      ...toys[0],
      essay: 'A detailed essay on the historical significance of this device',
      relatedConcepts: ['persistence of vision', 'animation', 'zoetrope'],
      audioDescription: '/audio/toy-description.mp3',
      timeline: [
        { year: 1800, event: 'Initial concept' },
        { year: 1820, event: 'First prototype' },
        { year: 1834, event: 'Public introduction' }
      ]
    };
    
    // Verify the extended toy has the base Toy properties
    expect(extendedToy.id).toBeDefined();
    expect(extendedToy.name).toBeDefined();
    
    // Verify the extended toy has the new properties
    expect(extendedToy.essay).toBeDefined();
    expect(extendedToy.relatedConcepts).toBeInstanceOf(Array);
    expect(extendedToy.timeline).toBeInstanceOf(Array);
    
    // Verify we can add the extended toy to the existing array
    const extendedToys = [...toys, extendedToy as any];
    expect(extendedToys.length).toBe(toys.length + 1);
  });
}); 