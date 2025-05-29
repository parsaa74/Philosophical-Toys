import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CollectionPage from '@/app/collection/page';
import { toys, Toy } from '@/data/toys';

// Mock the toys data
jest.mock('@/data/toys', () => {
  // Create a varied set of test toys to demonstrate categories and sorting
  const mockToys = [
    {
      id: '1',
      name: 'Alpha Device',
      slug: 'alpha-device',
      inventor: 'Beta Creator',
      year: 1900,
      description: 'First test device',
      category: 'mechanical',
      philosophical_notes: 'Notes about mechanics and motion',
      tags: ['mechanics', 'motion'],
    },
    {
      id: '2',
      name: 'Cinema Machine',
      slug: 'cinema-machine',
      inventor: 'Alpha Creator',
      year: 1800,
      description: 'Second test device',
      category: 'optical',
      image: '/test.svg',
      tags: ['cinema', 'perception'],
    },
    {
      id: '3',
      name: 'Beta Instrument',
      slug: 'beta-instrument',
      inventor: 'Delta Creator',
      year: 1850,
      description: 'Third test device',
      category: 'sound',
      video: '/test.mp4',
      philosophical_notes: 'Notes about sound and waves',
      tags: ['sound', 'waves'],
    },
  ];
  
  return {
    __esModule: true,
    toys: mockToys,
    Toy: {} // Type interface mock
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock the Filters component
jest.mock('@/components/collection/Filters', () => {
  return function Filters({ 
    sort, 
    category, 
    onSortChange, 
    onCategoryChange
  }: { 
    sort: string; 
    category: string; 
    onSortChange: (sort: string) => void; 
    onCategoryChange: (category: string) => void;
    accentColor: string;
  }) {
    return (
      <div data-testid="filters">
        <select 
          data-testid="sort-selector" 
          value={sort} 
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="year">Year</option>
          <option value="inventor">Inventor</option>
        </select>
        <select 
          data-testid="category-selector" 
          value={category} 
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="mechanical">Mechanical</option>
          <option value="optical">Optical</option>
          <option value="sound">Sound</option>
        </select>
      </div>
    );
  };
});

// Mock the ToyCard component
jest.mock('@/components/collection/ToyCard', () => {
  return function ToyCard({ toy }: { toy: Toy; accentColor?: string }) {
    return (
      <div data-testid={`toy-${toy.id}`} className="toy-card">
        <h3>{toy.name}</h3>
        <p>{toy.year} • {toy.inventor}</p>
        <p>{toy.description}</p>
        {toy.category && <span data-testid="category">{toy.category}</span>}
        {toy.philosophical_notes && <div data-testid="notes">{toy.philosophical_notes}</div>}
        {toy.tags && toy.tags.map(tag => <span key={tag} data-testid="tag">{tag}</span>)}
      </div>
    );
  };
});

describe('CollectionPage Component', () => {
  // Test 1: Basic rendering
  test('renders the collection page with all components', () => {
    render(<CollectionPage />);
    
    // Check for the heading and description
    expect(screen.getByText('Collection')).toBeInTheDocument();
    expect(screen.getByText(/Browse our digital archive/i)).toBeInTheDocument();
    
    // Check for the filters
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    
    // Check all toys are rendered
    expect(screen.getByTestId('toy-1')).toBeInTheDocument();
    expect(screen.getByTestId('toy-2')).toBeInTheDocument();
    expect(screen.getByTestId('toy-3')).toBeInTheDocument();
  });

  // Test 2: Filtering by category
  test('filters toys by category', () => {
    render(<CollectionPage />);
    
    // Initially shows all toys
    expect(screen.getByTestId('toy-1')).toBeInTheDocument();
    expect(screen.getByTestId('toy-2')).toBeInTheDocument();
    expect(screen.getByTestId('toy-3')).toBeInTheDocument();
    
    // Select optical category
    const categorySelector = screen.getByTestId('category-selector');
    fireEvent.change(categorySelector, { target: { value: 'optical' } });
    
    // Should only show optical toys
    expect(screen.queryByTestId('toy-1')).not.toBeInTheDocument(); // mechanical
    expect(screen.getByTestId('toy-2')).toBeInTheDocument(); // optical
    expect(screen.queryByTestId('toy-3')).not.toBeInTheDocument(); // sound
  });

  // Test 3: Sorting toys
  test('sorts toys by selected sort option', () => {
    render(<CollectionPage />);
    
    // Get the initial order of toys (sorted by name by default)
    const initialToys = screen.getAllByTestId(/toy-/);
    
    // Alpha Device, Beta Instrument, Cinema Machine (alphabetical order)
    expect(initialToys[0]).toHaveTextContent('Alpha Device');
    expect(initialToys[1]).toHaveTextContent('Beta Instrument');
    expect(initialToys[2]).toHaveTextContent('Cinema Machine');
    
    // Sort by year
    const sortSelector = screen.getByTestId('sort-selector');
    fireEvent.change(sortSelector, { target: { value: 'year' } });
    
    // Get the new order (should be sorted by year)
    const sortedToys = screen.getAllByTestId(/toy-/);
    
    // 1800, 1850, 1900 (year order)
    expect(sortedToys[0]).toHaveTextContent('Cinema Machine'); // 1800
    expect(sortedToys[1]).toHaveTextContent('Beta Instrument'); // 1850
    expect(sortedToys[2]).toHaveTextContent('Alpha Device'); // 1900
  });

  // Test 4: Empty category handling
  test('shows message when no toys are in selected category', () => {
    // Create a mock implementation that filters out all toys
    jest.mock('@/data/toys', () => {
      return {
        __esModule: true,
        toys: [
          {
            id: '1',
            name: 'Alpha Device',
            slug: 'alpha-device',
            inventor: 'Creator',
            year: 1900,
            description: 'Test device',
            category: 'unknown-category', // A category that won't match any filters
          },
        ],
        Toy: {}
      };
    });
    
    render(<CollectionPage />);
    
    // Select a category that doesn't match any toys
    const categorySelector = screen.getByTestId('category-selector');
    fireEvent.change(categorySelector, { target: { value: 'mechanical' } });
    
    // Should show "No toys found" message
    expect(screen.getByText('No toys found for this category.')).toBeInTheDocument();
  });

  // Test 5: Research-driven data model
  test('shows philosophical notes and research metadata when available', () => {
    render(<CollectionPage />);
    
    // Count the number of philosophical notes displayed
    const notes = screen.getAllByTestId('notes');
    expect(notes).toHaveLength(2); // Two toys have philosophical notes
    
    // Check for tags (research metadata)
    const tags = screen.getAllByTestId('tag');
    expect(tags.length).toBeGreaterThan(0);
    expect(tags).toContain(screen.getByText('cinema'));
    expect(tags).toContain(screen.getByText('perception'));
    expect(tags).toContain(screen.getByText('mechanics'));
  });
}); 