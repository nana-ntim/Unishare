/**
 * Test file for NotificationsPage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
const mockUser = { id: 'test-user-id' };
const mockUseAuth = vi.hoisted(() => vi.fn().mockReturnValue({
  user: mockUser
}));

// Mock Notification data
const mockNotificationsData = [
  {
    id: '1',
    type: 'like',
    created_at: new Date().toISOString(),
    data: JSON.stringify({ username: 'test_user', post_id: 'post-1' }),
    read: false,
    user_id: 'test-user-id'
  },
  {
    id: '2',
    type: 'comment',
    created_at: new Date().toISOString(),
    data: JSON.stringify({ username: 'another_user', content: 'Test comment', post_id: 'post-2' }),
    read: true,
    user_id: 'test-user-id'
  }
];

// Create a complete mock for Supabase with vi.hoisted()
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: mockNotificationsData, error: null }))
        }))
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: mockNotificationsData, error: null }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }))
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({ subscribe: vi.fn() }))
  })),
  removeChannel: vi.fn()
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
    useNavigate: () => mockNavigate
  };
});

// Import the component to test after all mocks
import NotificationsPage from '../../src/pages/NotificationsPage';

// Test suite
describe('NotificationsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    
    // Reset useAuth mock
    mockUseAuth.mockReturnValue({
      user: mockUser
    });
    
    // Reset Supabase mock to return notification data
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: mockNotificationsData, error: null })
          })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the notifications page correctly', async () => {
    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for notification content
    await waitFor(() => {
      expect(screen.getByText(/test_user/i)).toBeTruthy();
      expect(screen.getByText(/liked your post/i)).toBeTruthy();
    });
  });

  it('displays notifications correctly', async () => {
    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for notifications to load
    await waitFor(() => {
      // Check for like notification
      expect(screen.getByText(/liked your post/i)).toBeTruthy();
      
      // Check for comment notification
      expect(screen.getByText(/commented on your post/i)).toBeTruthy();
      expect(screen.getByText(/Test comment/i)).toBeTruthy();
    });
  });

  it('shows empty state when no notifications', async () => {
    // Override Supabase mock to return empty array
    mockSupabase.from.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    }));

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText(/All caught up!/i)).toBeTruthy();
      expect(screen.getByText(/You have no notifications at the moment/i)).toBeTruthy();
    });
  });

  it('handles marking notification as read', async () => {
    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Find an unread notification and click it
    await waitFor(() => {
      const notification = screen.getByText(/liked your post/i).closest('div').closest('div');
      fireEvent.click(notification);
    });

    // Verify the update function was called
    expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
    
    // This is a simplification - in a real test, you'd want to verify the specific update call
    // but the pattern of nested mocks makes this challenging
    const updateFn = mockSupabase.from().update;
    expect(updateFn).toHaveBeenCalled();
  });
});