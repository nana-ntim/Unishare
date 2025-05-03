import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// Get directory URL
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  test: {
    // Enable global test utilities
    globals: true,
    
    // Use jsdom for DOM simulation
    environment: 'jsdom',
    
    // Setup file paths relative to the project root
    setupFiles: ['./tests/setup.js'],
    
    // Include test files matching this pattern
    include: ['./tests/**/*.{test,spec}.{js,jsx}'],
    
    // Configure code coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
      ],
    },
    
    // Specify transformations
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
    
    // Use legacy snapshots for backwards compatibility
    snapshotFormat: {
      printBasicPrototype: true,
    },
    
    // Improve compatibility with older test code
    sequence: {
      hooks: 'stack',
    },
    
    // Timeout for async operations
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});