/**
 * Test file for HomePage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Create controllable mocks for Supabase BEFORE vi.mock calls
// Use vi.hoisted to ensure these mocks are hoisted along with vi.mock()
const mockSupabaseSelect = vi.hoisted(() => vi.fn());
const mockSupabaseEq = vi.hoisted(() => vi.fn());
const mockSupabaseIn = vi.hoisted(() => vi.fn());
const mockSupabaseOrder = vi.hoisted(() => vi.fn());
const mockSupabaseLimit = vi.hoisted(() => vi.fn().mockResolvedValue({ data: [], error: null }));
const mockSupabaseNot = vi.hoisted(() => vi.fn());
const mockSupabaseFrom = vi.hoisted(() => vi.fn());

// Mock the channel function and its methods
const mockChannelOn = vi.hoisted(() => vi.fn(() => ({ subscribe: vi.fn() })));
const mockChannel = vi.hoisted(() => vi.fn(() => ({
  on: mockChannelOn,
  subscribe: vi.fn()
})));

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

// Mock Button component
vi.mock('../../src/components/ui/FormComponents', () => {
  return {
    default: ({ variant, children, onClick }) => (
      <button data-variant={variant} onClick={onClick}>{children}</button>
    )
  };
});

// Mock UserFollowButton component
vi.mock('../../src/components/ui/UserFollowButton', () => {
  return {
    default: ({ userId, variant, size, onFollowChange }) => (
      <button 
        data-userid={userId}
        data-variant={variant}
        data-size={size}
        onClick={() => onFollowChange && onFollowChange(true)}
      >
        Follow
      </button>
    )
  };
});

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
  mockSupabaseNot.mockReturnValue({ 
    in: vi.fn().mockReturnValue({ limit: mockSupabaseLimit }),
    limit: mockSupabaseLimit 
  });
  
  return {
    supabase: {
      from: mockSupabaseFrom,
      channel: mockChannel,
      removeChannel: vi.fn()
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

// Mock PostCard component
vi.mock('../../src/components/ui/PostCard', () => {
  return {
    default: ({ post }) => (
      <div className="mock-post-card" data-post-id={post.id}>
        <div className="post-author">{post.author.name}</div>
        <div className="post-content">{post.content}</div>
      </div>
    )
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
      ['Following', 'For You', 'University'].some(text => btn.textContent.includes(text))
    );
    
    expect(tabButtons.length).toBe(3);
    
    // Check for empty feed message
    expect(screen.getByText(/Your feed is empty/i)).toBeDefined();
  });
});