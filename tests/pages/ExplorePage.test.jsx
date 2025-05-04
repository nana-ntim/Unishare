/**
 * Test file for ExplorePage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Create mock variables with vi.hoisted() to ensure they're hoisted with vi.mock()
const mockFollowUser = vi.hoisted(() => vi.fn());
// Use a function to create new search params rather than trying to reassign a constant
const getSearchParams = vi.hoisted(() => () => new URLSearchParams());
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
        })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })) // Add direct limit method
      })),
      limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: {}, error: null }))
  }))
}));

// Mock navigation functions
const mockNavigate = vi.hoisted(() => vi.fn());
let mockSearchParams; // Declare as variable, not constant

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
    mockSearchParams = getSearchParams(); // Use function to create new instance instead of reassignment
    
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
          }),
          limit: () => Promise.resolve({ data: [], error: null }) // Add direct limit method
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
      return !screen.queryByText(/loading/i);
    }, { timeout: 3000 });

    // Check for empty state - use queryAllByText to handle multiple matches
    await waitFor(() => {
      const noResultsElements = screen.queryAllByText(/No results found/i);
      expect(noResultsElements.length).toBeGreaterThan(0);
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
    mockSearchParams = getSearchParams();
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
      return !screen.queryByText(/loading/i);
    }, { timeout: 3000 });

    // Wait for no results state - use queryAllByText
    await waitFor(() => {
      const noResultsElements = screen.queryAllByText(/No results found/i);
      expect(noResultsElements.length).toBeGreaterThan(0);
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
          }),
          limit: () => Promise.resolve({ data: [], error: null })
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
    mockSearchParams = getSearchParams();
    mockSearchParams.set('tag', 'testhashtag');
    
    render(
      <BrowserRouter>
        <ExplorePage />
      </BrowserRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      return !screen.queryByText(/loading/i);
    }, { timeout: 3000 });

    // Verify hashtag heading displays (using queryAllByText)
    await waitFor(() => {
      // Find all headings
      const allHeadings = screen.getAllByRole('heading');
      // Check if any heading contains the hashtag
      const hasHashtag = allHeadings.some(h => h.textContent.includes('testhashtag'));
      expect(hasHashtag).toBe(true);
    });
  });
});