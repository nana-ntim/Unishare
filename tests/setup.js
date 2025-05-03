/**
 * Test setup file
 * 
 * This file sets up the testing environment and global mocks
 */

// Import Vitest utilities
import { expect, afterEach, vi, beforeAll } from 'vitest';

// Import React Testing Library methods
import { cleanup } from '@testing-library/react';

// Import jest-dom matchers for DOM element assertions
import matchers from '@testing-library/jest-dom/matchers';

// Add custom jest-dom matchers to extend expect
expect.extend(matchers);

// Suppress React act() warnings
beforeAll(() => {
  // Save original console.error
  const originalConsoleError = console.error;
  
  // Filter out act() warnings
  console.error = (...args) => {
    if (
      args[0]?.includes?.('Warning: An update to') && 
      args[0]?.includes?.('inside a test was not wrapped in act')
    ) {
      return; // Suppress the warning
    }
    
    // For React Router warnings
    if (args[0]?.includes?.('React Router Future Flag Warning')) {
      return; // Suppress the warning
    }
    
    // For all other errors, use the original console.error
    originalConsoleError(...args);
  };
});

// Automatically cleanup after each test
afterEach(() => {
  // Clean up any rendered components
  cleanup();
  
  // Reset all mocks
  vi.resetAllMocks();
  
  // Restore real timers in case a test used fake timers
  if (typeof vi.useRealTimers === 'function') {
    vi.useRealTimers();
  }
});

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn().mockImplementation((key) => null),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Mock sessionStorage for tests
const sessionStorageMock = {
  getItem: vi.fn().mockImplementation((key) => null),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Apply storage mocks to global window object
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock window.matchMedia (required for some UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (required for some UI components)
const mockIntersectionObserver = vi.fn().mockImplementation(function(callback, options) {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
  this.root = options?.root || null;
  this.rootMargin = options?.rootMargin || '';
  this.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0];
  
  // Return observer instance
  return this;
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver
});

// Add helper function to wait for state updates
global.waitForStateUpdate = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
};