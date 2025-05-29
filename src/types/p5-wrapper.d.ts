import type p5Types from 'p5';
import type { ComponentType } from 'react';

declare module '@p5-wrapper/react' {
  export type Sketch = (p5: p5Types) => void | (() => void);
}

declare module '@p5-wrapper/next' {
  interface P5WrapperProps {
    sketch: (p5: p5Types) => void | (() => void);
  }
  
  export const NextReactP5Wrapper: ComponentType<P5WrapperProps>;
} 