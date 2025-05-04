/**
 * Test file for NotificationsPage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies - define with vi.hoisted() before imports and vi.mock() calls
const mockUser = vi.hoisted(() => ({ id: 'test-user-id' }));
const mockUseAuth = vi.hoisted(() => vi.fn().mockReturnValue({
  user: mockUser
}));

// Mock Notification data
const mockNotificationsData = vi.hoisted(() => [
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
]);

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

// Mock notification service
const mockNotificationService = vi.hoisted(() => ({
  markAsRead: vi.fn().mockResolvedValue({}),
  markAllAsRead: vi.fn().mockResolvedValue({})
}));

// Mock the useAuth module
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock notification service
vi.mock('../../src/services/notificationService', () => ({
  default: mockNotificationService
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
      return !screen.queryByText(/loading/i);
    }, { timeout: 3000 });

    // Check for notification content
    await waitFor(() => {
      expect(screen.getByText(/test_user/i)).toBeTruthy();
      expect(screen.getByText(/liked your post/i)).toBeTruthy();
    });
  });
});