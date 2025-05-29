// Import jest-dom for custom matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia to avoid errors during testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observers = [];
  }

  observe(element) {
    this.observers.push({
      element,
      isIntersecting: true,
    });
  }

  unobserve(element) {
    this.observers = this.observers.filter(observer => observer.element !== element);
  }

  disconnect() {
    this.observers = [];
  }

  // Trigger a mock intersection event
  triggerIntersect() {
    this.callback(this.observers, this);
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = callback => {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = id => {
  clearTimeout(id);
}; 