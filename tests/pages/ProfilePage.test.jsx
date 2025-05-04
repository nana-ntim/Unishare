/**
 * Test file for ProfilePage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
const mockProfile = {
  id: 'test-user-id',
  username: 'testuser',
  full_name: 'Test User',
  bio: 'Test bio',
  university: 'Test University',
  avatar_url: 'test-avatar.jpg'
};

// Setup controllable mocks for Supabase with vi.hoisted()
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseOrder = vi.fn();
const mockSupabaseFrom = vi.hoisted(() => vi.fn());
const mockSupabaseCount = vi.fn();

// Setup mock for useAuth - make it controllable
const mockUseAuth = vi.hoisted(() => vi.fn().mockReturnValue({
  user: { id: 'current-user-id' },
  profile: mockProfile
}));

// Mock the useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => {
  // Setup the select chain
  mockSupabaseFrom.mockReturnValue({ select: mockSupabaseSelect });
  mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq, count: mockSupabaseCount });
  mockSupabaseEq.mockReturnValue({ single: mockSupabaseSingle, order: mockSupabaseOrder });
  mockSupabaseSingle.mockResolvedValue({ data: mockProfile, error: null });
  mockSupabaseOrder.mockResolvedValue({ data: [], error: null });
  mockSupabaseCount.mockResolvedValue({ count: 0, error: null });
  
  return {
    supabase: {
      from: mockSupabaseFrom,
      rpc: vi.fn().mockResolvedValue({ error: null })
    }
  };
});

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ username: 'testuser' })
  };
});

// Import the component to test - import AFTER all mocks
import ProfilePage from '../../src/pages/ProfilePage';

// Test suite
describe('ProfilePage Component', () => {
  // Reset before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    
    // Reset the mocks to default successful behavior
    mockUseAuth.mockReturnValue({
      user: { id: 'current-user-id' },
      profile: mockProfile
    });
    
    // Reset Supabase mock behavior
    mockSupabaseSingle.mockResolvedValue({ data: mockProfile, error: null });
    mockSupabaseOrder.mockResolvedValue({ data: [], error: null });
    mockSupabaseCount.mockResolvedValue({ count: 0, error: null });
  });

  it('renders the profile page correctly', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for profile data to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
      expect(screen.getByText('@testuser')).toBeTruthy();
      expect(screen.getByText('Test bio')).toBeTruthy();
      expect(screen.getByText('Test University')).toBeTruthy();
    });
  });

  it('shows edit profile button for own profile', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText(/Edit Profile/i)).toBeTruthy();
    });
  });

  it('shows follow button for other users', async () => {
    // Set useAuth to return a different user
    mockUseAuth.mockReturnValue({
      user: { id: 'different-user-id' },
      profile: { username: 'different-user' }
    });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText(/Follow/i)).toBeTruthy();
    });
  });

  it('displays empty state when no posts', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText(/You haven't posted anything yet/i)).toBeTruthy();
    });
    
    const createButton = screen.getByText(/Create Your First Post/i);
    expect(createButton).toBeTruthy();
  });

  it('navigates to create page when clicking create first post', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Find and click the button
    const createButton = screen.getByText(/Create Your First Post/i);
    fireEvent.click(createButton);

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/create');
  });

  it('shows user not found page for non-existent user', async () => {
    // Make the profile query return null (user not found)
    mockSupabaseSingle.mockResolvedValue({ 
      data: null, 
      error: new Error('User not found') 
    });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for not found text
    expect(screen.getByText(/User Not Found/i)).toBeTruthy();
    expect(screen.getByText(/Return Home/i)).toBeTruthy();
  });
});