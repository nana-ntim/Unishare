/**
 * Test file for CreatePage component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import the component to test
import CreatePage from '../../src/pages/CreatePage';

// Mock dependencies
// Mock the useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    profile: { 
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: 'test-avatar.jpg'
    },
    isAuthenticated: true,
    isVerified: true
  })
}));

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: () => ({
        select: () => Promise.resolve({ data: [{ id: 'post-1' }], error: null })
      })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: {}, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'test-url.jpg' } })
      })
    }
  }
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

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn(() => 'mock-blob-url');
URL.revokeObjectURL = vi.fn();

// Test suite
describe('CreatePage Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    URL.createObjectURL.mockClear();
    URL.revokeObjectURL.mockClear();
  });

  // Test basic rendering
  it('renders the create page correctly', async () => {
    render(
      <BrowserRouter>
        <CreatePage />
      </BrowserRouter>
    );
    
    // Check for main elements using role selectors
    expect(screen.getByRole('heading', { name: /Create Post/i })).toBeDefined();
    
    // Check for form fields
    expect(screen.getByLabelText(/^Caption$/i)).toBeDefined();
    expect(screen.getByLabelText(/^Location/i)).toBeDefined();
  });

  // Test tab navigation
  it('switches between Create and Preview tabs', async () => {
    render(
      <BrowserRouter>
        <CreatePage />
      </BrowserRouter>
    );
    
    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Get all tab buttons and find the ones we need by their content
    const buttons = screen.getAllByRole('button');
    const createButton = buttons.find(button => 
      button.textContent === 'Create' && !button.textContent.includes('Create Post')
    );
    
    // Fill in the caption to enable preview
    const captionInput = screen.getByLabelText(/^Caption$/i);
    fireEvent.change(captionInput, { target: { value: 'Test caption' } });
    
    // Now find the Preview button that should be enabled
    await waitFor(() => {
      const previewButtons = screen.getAllByRole('button');
      const previewButton = previewButtons.find(button => 
        button.textContent === 'Preview'
      );
      expect(previewButton).toBeDefined();
      
      // Switch to preview mode
      fireEvent.click(previewButton);
    });
    
    // Check for preview content
    await waitFor(() => {
      expect(screen.getByText(/This is a preview/i)).toBeDefined();
    });
  });

  // Test form submission
  it('handles form submission', async () => {
    render(
      <BrowserRouter>
        <CreatePage />
      </BrowserRouter>
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByLabelText(/^Caption$/i)).toBeDefined();
    });
    
    // Fill in caption
    const captionInput = screen.getByLabelText(/^Caption$/i);
    fireEvent.change(captionInput, { target: { value: 'Test caption' } });
    
    // Find and click the Share Post button
    const buttons = screen.getAllByRole('button');
    const shareButton = buttons.find(button => 
      button.textContent === 'Share Post'
    );
    expect(shareButton).toBeDefined();
    fireEvent.click(shareButton);
    
    // Check that progress indicators appear
    await waitFor(() => {
      // Look for any elements that suggest submission is in progress
      const progressElements = screen.getAllByText(/Creating post.../i);
      expect(progressElements.length).toBeGreaterThan(0);
    });
    
    // Check navigation occurs
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  // Test cancel navigation
  it('navigates back when cancel is clicked', async () => {
    render(
      <BrowserRouter>
        <CreatePage />
      </BrowserRouter>
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByLabelText(/^Caption$/i)).toBeDefined();
    });
    
    // Find and click the Cancel button specifically
    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find(button => 
      button.textContent === 'Cancel'
    );
    expect(cancelButton).toBeDefined();
    fireEvent.click(cancelButton);
    
    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});