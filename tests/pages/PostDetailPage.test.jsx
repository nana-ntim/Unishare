/**
 * Test file for PostDetailPage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
const mockUser = { id: 'current-user-id' };
const mockPost = {
  id: 'post-1',
  user_id: 'user-1',
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: 'avatar.jpg',
  caption: 'Test post caption',
  image_url: 'image.jpg',
  likes_count: 5,
  created_at: new Date().toISOString(),
  location: 'Test Location'
};

const mockComments = [
  {
    id: 'comment-1',
    content: 'Test comment',
    created_at: new Date().toISOString(),
    user_id: 'user-2',
    profiles: {
      username: 'commenter',
      avatar_url: 'avatar2.jpg'
    }
  }
];

// Create a mock function for useAuth that we can control
const mockUseAuth = vi.hoisted(() => vi.fn().mockReturnValue({
  user: mockUser
}));

// Create a complete mock for Supabase with vi.hoisted()
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockPost, error: null })),
        order: vi.fn(() => Promise.resolve({ data: mockComments, error: null })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => Promise.resolve({ error: null }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [{}], error: null }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }))
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({ subscribe: vi.fn() }))
  })),
  removeChannel: vi.fn(),
  rpc: vi.fn(() => Promise.resolve({ error: null }))
}));

// Mock the useAuth module
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ postId: 'post-1' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>
  };
});

// Import the component to test - import AFTER all mocks
import PostDetailPage from '../../src/pages/PostDetailPage';

// Test suite
describe('PostDetailPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    
    // Reset the useAuth mock to default
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({
      user: mockUser
    });
    
    // Reset the mock implementations for each test
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockPost, error: null }),
          order: () => Promise.resolve({ data: mockComments, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        })
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: [{}], error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the post detail page correctly', async () => {
    render(
      <BrowserRouter>
        <PostDetailPage />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Now check for post content
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
      expect(screen.getByText('Test post caption')).toBeTruthy();
      expect(screen.getByText('Test Location')).toBeTruthy();
    });
  });

  it('displays comments correctly', async () => {
    render(
      <BrowserRouter>
        <PostDetailPage />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeTruthy();
      expect(screen.getByText('commenter')).toBeTruthy();
    });
  });

  it('handles comment submission', async () => {
    render(
      <BrowserRouter>
        <PostDetailPage />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Find comment input and submit button
    await waitFor(() => {
      const commentInput = screen.getByPlaceholderText(/Add a comment.../i);
      fireEvent.change(commentInput, { target: { value: 'New comment' } });
      
      const submitButton = screen.getByText(/Post/i);
      fireEvent.click(submitButton);
    });

    // Verify the supabase method was called
    await waitFor(() => {
      // Check if from('comments') was called
      expect(mockSupabase.from).toHaveBeenCalledWith('comments');
    });
  });

  it('shows post not found for invalid post', async () => {
    // Override Supabase mock to return error
    mockSupabase.from.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: new Error('Not found') })
        })
      })
    }));

    render(
      <BrowserRouter>
        <PostDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Post Not Found/i)).toBeTruthy();
      expect(screen.getByText(/Return Home/i)).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('handles delete post for owner', async () => {
    // Mock as post owner
    mockUseAuth.mockReturnValueOnce({
      user: { id: 'user-1' } // Same as post owner
    });

    render(
      <BrowserRouter>
        <PostDetailPage />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Find menu button and click
    await waitFor(() => {
      const menuButton = document.querySelector('button svg').closest('button');
      fireEvent.click(menuButton);
    });

    // Find delete option
    await waitFor(() => {
      const deleteButton = screen.getByText(/Delete Post/i);
      fireEvent.click(deleteButton);
    });

    // Confirm deletion
    await waitFor(() => {
      const confirmButton = screen.getByText(/Delete/i);
      fireEvent.click(confirmButton);
    });

    // Verify navigation to profile
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});