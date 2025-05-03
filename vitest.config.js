import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

// Get the current directory
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    // Use globals for easier testing (no need to import expect, describe, etc.)
    globals: true,
    
    // Use jsdom as the test environment to simulate a browser
    environment: 'jsdom',
    
    // Setup file that runs before tests
    setupFiles: ['./tests/setup.js'],
    
    // Configure test file patterns
    include: ['./tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    // Increase timeout to avoid timeout errors
    testTimeout: 30000,
    
    // Set wait time for testing-library
    hookTimeout: 10000,
    
    // Use isolation to prevent test pollution
    isolate: true,
    
    // Increase pool timeout
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        timeout: 30000
      }
    },
    
    // For CI integration
    reporters: ['default'],
    outputFile: {
      junit: './test-results.xml'
    },
    
    // Configure code coverage
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'tests/setup.js',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
      ],
    },
    
    // Stop on first failure (for easier debugging)
    bail: 0
  },
  
  // Path aliases (for easier imports)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
})