import React from 'react';

interface ThreeJsPlaceholderProps {
  toyId?: string;
}

/**
 * Placeholder component for future Three.js integration
 * This will be replaced with actual Three.js implementation
 */
export function ThreeJsPlaceholder({ toyId }: ThreeJsPlaceholderProps) {
  return (
    <div style={{
      width: '100%',
      height: '200px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.7)',
      fontFamily: 'monospace',
      fontSize: '14px',
      padding: '1rem',
      textAlign: 'center'
    }}>
      <div>
        <p>Three.js visualization for {toyId || 'philosophical toy'} will be implemented here.</p>
        <p style={{ fontSize: '12px', marginTop: '0.5rem' }}>
          This is a placeholder for future integration.
        </p>
      </div>
    </div>
  );
}

export default ThreeJsPlaceholder;
