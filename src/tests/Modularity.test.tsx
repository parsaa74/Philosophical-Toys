import React from 'react';
import { render } from '@testing-library/react';
import ToyCard from '@/components/collection/ToyCard';
import { Toy } from '@/data/toys';
import { motion } from 'framer-motion';

// Mock components
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-element" {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href} data-testid="next-link">{children}</a>;
  };
});

describe('Modularity and Extensibility', () => {
  // Test 1: Component composition
  test('components can be composed and reused', () => {
    // Create a new component that composes ToyCard
    const ComposedComponent = () => {
      const sampleToy: Toy = {
        id: '1',
        name: 'Test Toy',
        slug: 'test-toy',
        inventor: 'Test Inventor',
        year: 1900,
        description: 'Test description',
        category: 'mechanical',
      };
      
      return (
        <div data-testid="composed-component">
          <h1>Featured Toy</h1>
          <ToyCard toy={sampleToy} accentColor="#FF0000" />
        </div>
      );
    };
    
    const { getByTestId } = render(<ComposedComponent />);
    
    // Verify the composed component renders
    expect(getByTestId('composed-component')).toBeInTheDocument();
    
    // Verify the ToyCard is rendered inside it
    expect(getByTestId('next-link')).toBeInTheDocument();
  });
  
  // Test 2: Extended component
  test('components can be extended with new functionality', () => {
    // Create an extended version of ToyCard with additional functionality
    const ExtendedToyCard = ({ toy, accentColor, onClick }: { toy: Toy; accentColor?: string; onClick?: () => void }) => {
      return (
        <div data-testid="extended-card">
          <button onClick={onClick} data-testid="action-button">View Details</button>
          <ToyCard toy={toy} accentColor={accentColor} />
        </div>
      );
    };
    
    const mockClickHandler = jest.fn();
    
    const sampleToy: Toy = {
      id: '1',
      name: 'Test Toy',
      slug: 'test-toy',
      inventor: 'Test Inventor',
      year: 1900,
      description: 'Test description',
      category: 'mechanical',
    };
    
    const { getByTestId } = render(
      <ExtendedToyCard toy={sampleToy} onClick={mockClickHandler} />
    );
    
    // Verify the extended component renders
    expect(getByTestId('extended-card')).toBeInTheDocument();
    
    // Verify the ToyCard is rendered inside it
    expect(getByTestId('next-link')).toBeInTheDocument();
    
    // Verify new functionality (button) is present
    expect(getByTestId('action-button')).toBeInTheDocument();
    
    // Test the click handler
    getByTestId('action-button').click();
    expect(mockClickHandler).toHaveBeenCalled();
  });
  
  // Test 3: Alternative theme (adaptability)
  test('components can adapt to different themes and styles', () => {
    // Create a themed version of the toy data
    const themedToy: Toy = {
      id: '1',
      name: 'Test Toy',
      slug: 'test-toy',
      inventor: 'Test Inventor',
      year: 1900,
      description: 'Test description',
      category: 'mechanical',
      tags: ['motion', 'mechanical'],
    };
    
    // Function to create a themed card wrapper
    const createThemedCard = (theme: 'light' | 'dark' | 'sepia') => {
      const themeStyles = {
        light: { 
          background: '#FFFFFF', 
          color: '#000000',
          accentColor: '#3366FF'
        },
        dark: { 
          background: '#111111', 
          color: '#EEEEEE',
          accentColor: '#FF6633'
        },
        sepia: { 
          background: '#F4ECD8', 
          color: '#5C4B37',
          accentColor: '#8B7355'
        }
      };
      
      const style = themeStyles[theme];
      
      return (
        <div 
          data-testid={`themed-wrapper-${theme}`}
          style={{ 
            backgroundColor: style.background, 
            color: style.color,
            padding: '20px',
            borderRadius: '8px'
          }}
        >
          <ToyCard toy={themedToy} accentColor={style.accentColor} />
        </div>
      );
    };
    
    // Test light theme
    const { getByTestId, rerender } = render(createThemedCard('light'));
    expect(getByTestId('themed-wrapper-light')).toBeInTheDocument();
    
    // Test dark theme
    rerender(createThemedCard('dark'));
    expect(getByTestId('themed-wrapper-dark')).toBeInTheDocument();
    
    // Test sepia theme
    rerender(createThemedCard('sepia'));
    expect(getByTestId('themed-wrapper-sepia')).toBeInTheDocument();
  });
  
  // Test 4: Customizable behavior
  test('components can be customized with different behaviors', () => {
    // Create an interactive toy card with different interaction modes
    const InteractiveToyCard = ({ 
      toy, 
      interactionMode 
    }: { 
      toy: Toy; 
      interactionMode: 'click' | 'hover' | 'none' 
    }) => {
      // Different props based on interaction mode
      const modeProps = {
        click: {
          whileHover: {},
          whileTap: { scale: 0.95 },
          onClick: () => console.log('Clicked!'),
          className: 'cursor-pointer'
        },
        hover: {
          whileHover: { scale: 1.05, rotate: -2 },
          whileTap: {},
          className: 'cursor-default'
        },
        none: {
          className: 'pointer-events-none opacity-75'
        }
      };
      
      const props = modeProps[interactionMode];
      
      return (
        <div data-testid={`interactive-${interactionMode}`}>
          {/* We're using the mock motion.div since we've mocked framer-motion */}
          <motion.div {...props}>
            <ToyCard toy={toy} />
          </motion.div>
        </div>
      );
    };
    
    const sampleToy: Toy = {
      id: '1',
      name: 'Test Toy',
      slug: 'test-toy',
      inventor: 'Test Inventor',
      year: 1900,
      description: 'Test description',
      category: 'mechanical',
    };
    
    // Test click mode
    const { getByTestId, rerender } = render(
      <InteractiveToyCard toy={sampleToy} interactionMode="click" />
    );
    expect(getByTestId('interactive-click')).toBeInTheDocument();
    
    // Test hover mode
    rerender(<InteractiveToyCard toy={sampleToy} interactionMode="hover" />);
    expect(getByTestId('interactive-hover')).toBeInTheDocument();
    
    // Test none mode
    rerender(<InteractiveToyCard toy={sampleToy} interactionMode="none" />);
    expect(getByTestId('interactive-none')).toBeInTheDocument();
  });
}); 