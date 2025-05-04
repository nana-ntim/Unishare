/**
 * Test file for ExplorePage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Create mock variables with vi.hoisted() to ensure they're hoisted with vi.mock()
const mockFollowUser = vi.fn();
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      ilike: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      or: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [] }))
      })),
      in: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [] }))
        }))
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [] }))
      })),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      neq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: {}, error: null }))
  }))
}));

// Mock navigation
const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

// Mock dependencies
// Mock the useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isAuthenticated: true,
    isVerified: true
  })
}));

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock URL parameters and navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ 
      search: mockSearchParams.toString(),
      pathname: '/explore'
    }),
    useSearchParams: () => [mockSearchParams, vi.fn()]
  };
});

// Import the component to test - import AFTER all mocks
import ExplorePage from '../../src/pages/ExplorePage';

// Test suite
describe('ExplorePage Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockFollowUser.mockReset();
    mockSearchParams = new URLSearchParams();
    
    // Reset the Supabase mock to its default implementation
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          single: () => Promise.resolve({ data: null, error: null })
        }),
        ilike: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        or: () => ({
          limit: () => Promise.resolve({ data: [] })
        }),
        in: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [] })
          })
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [] })
        }),
        single: () => Promise.resolve({ data: null, error: null }),
        neq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        limit: () => Promise.resolve({ data: [], error: null })
      })
    }));
  });

  // Test basic rendering
  it('renders the explore page correctly', async () => {
    render(
      <BrowserRouter>
        <ExplorePage />
      </BrowserRouter>
    );
    
    // Check for search field
    expect(screen.getByPlaceholderText(/Search people, hashtags, or posts.../i)).toBeDefined();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for empty state
    await waitFor(() => {
      expect(screen.getByText(/No results found/i)).toBeDefined();
    });
  });

  // Test search functionality
  it('allows searching for content', async () => {
    render(
      <BrowserRouter>
        <ExplorePage />
      </BrowserRouter>
    );
    
    // Find search input
    const searchInput = screen.getByPlaceholderText(/Search people, hashtags, or posts.../i);
    
    // Enter search term
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Submit search form
    const form = searchInput.closest('form');
    fireEvent.submit(form);
    
    // Verify navigation with search params
    expect(mockNavigate).toHaveBeenCalledWith('/explore?q=test%20search');
  });

  // Test with search query parameter
  it('displays search results when query parameter is present', async () => {
    // Set up mock search query parameter
    mockSearchParams.set('q', 'test search');
    
    render(
      <BrowserRouter>
        <ExplorePage />
      </BrowserRouter>
    );
    
    // Check that search term is populated in input
    const searchInput = screen.getByPlaceholderText(/Search people, hashtags, or posts.../i);
    expect(searchInput.value).toBe('test search');
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for no results state
    await waitFor(() => {
      // Should show empty results for the search
      expect(screen.getByText(/No results found/i)).toBeDefined();
    });
  });

  // Test with hashtag parameter
  it('displays hashtag results when tag parameter is present', async () => {
    // Mock hashtag data response
    const mockHashtagData = {
      id: 'hashtag-1',
      name: 'testhashtag',
      post_count: 10
    };
    
    // Override the mock for hashtag lookup
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockHashtagData, error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        ilike: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        neq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        in: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        single: () => Promise.resolve({ data: null, error: null })
      })
    }));
    
    // Set up mock tag parameter
    mockSearchParams.set('tag', 'testhashtag');
    
    render(
      <BrowserRouter>
        <ExplorePage />
      </BrowserRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify hashtag heading displays
    await waitFor(() => {
      const headings = screen.getAllByRole('heading');
      // Find the heading containing the hashtag text
      const hashtagHeading = headings.find(h => h.textContent.includes('testhashtag'));
      expect(hashtagHeading).toBeDefined();
    });
  });
});