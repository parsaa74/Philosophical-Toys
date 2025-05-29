import React from 'react';
import { render, screen } from '@testing-library/react';
import ToyCard from '@/components/collection/ToyCard';
import { Toy } from '@/data/toys';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
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

describe('ToyCard Component', () => {
  // Test 1: Basic rendering with minimal data
  test('renders basic toy information correctly', () => {
    const minimalToy: Toy = {
      id: '1',
      name: 'Test Toy',
      slug: 'test-toy',
      inventor: 'Test Inventor',
      year: 1900,
      description: 'Test description',
      category: 'mechanical',
    };

    render(<ToyCard toy={minimalToy} />);
    
    expect(screen.getByText('Test Toy')).toBeInTheDocument();
    expect(screen.getByText('1900 • Test Inventor')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  // Test 2: Test with image
  test('displays image when provided', () => {
    const toyWithImage: Toy = {
      id: '2',
      name: 'Image Toy',
      slug: 'image-toy',
      inventor: 'Image Inventor',
      year: 1901,
      description: 'Toy with image',
      category: 'optical',
      image: '/test-image.svg',
    };

    render(<ToyCard toy={toyWithImage} />);
    
    const img = screen.getByAltText('Image Toy');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.svg');
  });

  // Test 3: Test with video
  test('displays video when provided', () => {
    const toyWithVideo: Toy = {
      id: '3',
      name: 'Video Toy',
      slug: 'video-toy',
      inventor: 'Video Inventor',
      year: 1902,
      description: 'Toy with video',
      category: 'optical',
      video: '/test-video.mp4',
    };

    render(<ToyCard toy={toyWithVideo} />);
    
    const video = screen.getByRole('presentation', { hidden: true });
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/test-video.mp4');
  });

  // Test 4: Test with philosophical notes
  test('includes philosophical notes when provided', () => {
    const toyWithNotes: Toy = {
      id: '4',
      name: 'Philosophical Toy',
      slug: 'philosophical-toy',
      inventor: 'Philosopher',
      year: 1903,
      description: 'Toy with philosophical notes',
      category: 'mechanical',
      philosophical_notes: 'Deep thoughts about motion and time',
    };

    render(<ToyCard toy={toyWithNotes} />);
    
    expect(screen.getByText('Deep thoughts about motion and time')).toBeInTheDocument();
  });

  // Test 5: Test with tags
  test('displays tags when provided', () => {
    const toyWithTags: Toy = {
      id: '5',
      name: 'Tagged Toy',
      slug: 'tagged-toy',
      inventor: 'Tagger',
      year: 1904,
      description: 'Toy with tags',
      category: 'optical',
      tags: ['motion', 'perception', 'time'],
    };

    render(<ToyCard toy={toyWithTags} />);
    
    expect(screen.getByText('motion')).toBeInTheDocument();
    expect(screen.getByText('perception')).toBeInTheDocument();
    expect(screen.getByText('time')).toBeInTheDocument();
  });

  // Test 6: Test with all fields (complete toy)
  test('renders a complete toy with all fields correctly', () => {
    const completeToy: Toy = {
      id: '6',
      name: 'Complete Toy',
      slug: 'complete-toy',
      inventor: 'Complete Inventor',
      year: 1905,
      description: 'Toy with all fields',
      category: 'mechanical',
      image: '/complete-image.svg',
      video: '/complete-video.mp4', // Video should take precedence over image
      philosophical_notes: 'Complex philosophical implications',
      tags: ['complex', 'complete'],
      references: ['Book 1', 'Article 2'],
    };

    render(<ToyCard toy={completeToy} />);
    
    // Video should be preferred over image when both are present
    const video = screen.getByRole('presentation', { hidden: true });
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/complete-video.mp4');
    
    expect(screen.getByText('Complete Toy')).toBeInTheDocument();
    expect(screen.getByText('Complex philosophical implications')).toBeInTheDocument();
    expect(screen.getByText('complex')).toBeInTheDocument();
    expect(screen.getByText('complete')).toBeInTheDocument();
  });

  // Test 7: Custom accent color
  test('applies custom accent color', () => {
    const toy: Toy = {
      id: '7',
      name: 'Accent Toy',
      slug: 'accent-toy',
      inventor: 'Accent Inventor',
      year: 1906,
      description: 'Toy with custom accent',
      category: 'optical',
    };

    const customColor = '#FF5500';
    render(<ToyCard toy={toy} accentColor={customColor} />);
    
    // Check that the custom color is applied to the underline element
    const underline = screen.getByRole('presentation', { hidden: true });
    expect(underline).toHaveStyle(`background: ${customColor}`);
  });
}); 