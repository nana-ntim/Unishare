/**
 * Test file for SettingsPage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Create mock variables with vi.hoisted() BEFORE vi.mock calls
const mockUpdateProfile = vi.fn();
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }))
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'test-url.jpg' } }))
    }))
  },
  auth: {
    updateUser: vi.fn(() => Promise.resolve({ error: null }))
  }
}));

// Mock the useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    profile: { 
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: 'test-avatar.jpg',
      bio: 'Test bio',
      university: 'Test University'
    },
    updateProfile: mockUpdateProfile
  })
}));

// Mock Supabase
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

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = vi.fn(() => 'mocked-url');
URL.revokeObjectURL = vi.fn();

// Import the component after all mocks
import SettingsPage from '../../src/pages/SettingsPage';

// Test suite
describe('SettingsPage Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockUpdateProfile.mockReset();
  });

  it('renders the settings page correctly', async () => {
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );

    // Check for tabs
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Account & Security/i)).toBeInTheDocument();

    // Check profile data is loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Test User/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/testuser/i)).toBeInTheDocument();
    });
  });

  it('allows switching between tabs', async () => {
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );

    // Click on Account & Security tab
    fireEvent.click(screen.getByText(/Account & Security/i));
    
    // Check that account section is shown
    await waitFor(() => {
      expect(screen.getByText(/Account Information/i)).toBeInTheDocument();
      expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
    });
  });

  it('displays user email on account tab', async () => {
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );

    // Click on Account & Security tab
    fireEvent.click(screen.getByText(/Account & Security/i));
    
    // Check that user email is displayed
    await waitFor(() => {
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });

  it('allows editing profile data', async () => {
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );

    // Edit full name field
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(fullNameInput, { target: { value: 'Updated Name' } });
    
    // Check that the input value has been updated
    expect(fullNameInput.value).toBe('Updated Name');
    
    // Find and click save button
    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);
    
    // Check if supabase update was called
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.from().update).toHaveBeenCalled();
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  it('validates username format', async () => {
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );

    // Enter invalid username
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'invalid username!' } });
    
    // Check for validation error
    await waitFor(() => {
      const errorMessage = screen.getByText(/Username can only contain letters, numbers, periods, and underscores/i);
      expect(errorMessage).toBeInTheDocument();
    });
    
    // Save button should be disabled
    const saveButton = screen.getByText(/Save Changes/i);
    expect(saveButton).toBeDisabled();
  });
});