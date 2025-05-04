/**
 * Test file for HomePage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Create controllable mocks for Supabase BEFORE vi.mock calls
// Use vi.hoisted to ensure these mocks are hoisted along with vi.mock()
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseIn = vi.fn();
const mockSupabaseOrder = vi.fn();
const mockSupabaseLimit = vi.fn();
const mockSupabaseNot = vi.fn();
const mockSupabaseFrom = vi.hoisted(() => vi.fn());

// Mock dependencies
// Mock the useAuth hook
const mockUseAuth = vi.hoisted(() => vi.fn().mockReturnValue({
  user: { id: 'test-user-id' },
  profile: { 
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: 'test-avatar.jpg'
  },
  isAuthenticated: true,
  isVerified: true
}));

// Setup mock chain in a way that will be properly hoisted
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => {
  // Setup the mock chain
  mockSupabaseFrom.mockReturnValue({ select: mockSupabaseSelect });
  mockSupabaseSelect.mockReturnValue({ 
    eq: mockSupabaseEq, 
    in: mockSupabaseIn,
    order: mockSupabaseOrder,
    not: mockSupabaseNot
  });
  mockSupabaseEq.mockReturnValue({ order: mockSupabaseOrder });
  mockSupabaseIn.mockReturnValue({ order: mockSupabaseOrder });
  mockSupabaseOrder.mockReturnValue({ limit: mockSupabaseLimit });
  mockSupabaseNot.mockReturnValue({ limit: mockSupabaseLimit });
  mockSupabaseLimit.mockResolvedValue({ data: [], error: null });
  
  return {
    supabase: {
      from: mockSupabaseFrom
    }
  };
});

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Import the component to test - import AFTER all mocks
import HomePage from '../../src/pages/HomePage';

// Test suite
describe('HomePage Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    
    // Reset Supabase mock behaviors
    mockSupabaseLimit.mockResolvedValue({ data: [], error: null });
  });

  // Test basic rendering
  it('renders the home page correctly', async () => {
    // Render component
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Wait for loading spinner to disappear
    await waitFor(() => {
      const spinner = screen.queryByRole('progressbar');
      return !spinner;
    }, { timeout: 3000 });
    
    // Check for tabs (use dataTestId, role, or more specific targeting)
    const tabButtons = screen.getAllByRole('button').filter(btn => 
      ['Following', 'For You', 'University'].includes(btn.textContent)
    );
    
    expect(tabButtons.length).toBe(3);
    
    // Check for empty feed message
    expect(screen.getByText(/Your feed is empty/i)).toBeDefined();
  });

  // Test tab switching with a timeout to prevent infinite waiting
  it('allows switching between feed tabs', async () => {
    // Create a done flag to control test completion
    let testCompleted = false;
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      const spinner = screen.queryByRole('progressbar');
      return !spinner;
    }, { timeout: 3000 });
    
    try {
      // Find all tab buttons
      const tabButtons = screen.getAllByRole('button').filter(btn => 
        ['Following', 'For You', 'University'].includes(btn.textContent)
      );
      
      // Click the "For You" tab
      const forYouTab = tabButtons.find(btn => btn.textContent === 'For You');
      fireEvent.click(forYouTab);
      
      // Wait for content to update
      await waitFor(() => {
        // Make sure we don't get stuck waiting indefinitely
        return screen.getByText(/Discover new content/i);
      }, { timeout: 2000 });
      
      // Verify we're on the For You tab content
      expect(screen.getByText(/Discover new content/i)).toBeDefined();
      
      // Click the University tab
      const universityTab = tabButtons.find(btn => btn.textContent === 'University');
      fireEvent.click(universityTab);
      
      // Return to the Following tab - just verify the click works
      const followingTab = tabButtons.find(btn => btn.textContent === 'Following');
      fireEvent.click(followingTab);
      
      // Mark test as completed
      testCompleted = true;
    } catch (error) {
      console.error('Test failed:', error);
    }
    
    // Ensure the test completed
    expect(testCompleted).toBe(true);
  });
});