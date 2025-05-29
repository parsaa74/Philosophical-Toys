import React from 'react';

export function DebugBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'purple',
      zIndex: 500,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '24px',
      textAlign: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      border: '10px solid yellow'
    }}>
      <div>DEBUG BACKGROUND</div>
      <div>This should be visible</div>
      <div style={{ fontSize: '16px', marginTop: '20px' }}>
        If you can see this, the issue is with the GrainBackgroundSketch component
      </div>
    </div>
  );
}

export default DebugBackground;
