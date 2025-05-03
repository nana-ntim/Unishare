/**
 * Test file for Login component
 * 
 * This test demonstrates how to test the Login component
 * and its authentication functionality.
 */

// -----------------------------------------------------------------------------
// SECTION 1: IMPORTS
// -----------------------------------------------------------------------------
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/components/auth/Login';

// -----------------------------------------------------------------------------
// SECTION 2: MOCKS
// -----------------------------------------------------------------------------
// Mock the useAuth hook
const mockSignIn = vi.fn();
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    isAuthenticated: false,
    isVerified: false,
    authError: null
  })
}));

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: '/home' } })
  };
});

// -----------------------------------------------------------------------------
// SECTION 3: TEST SUITE
// -----------------------------------------------------------------------------
describe('Login Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockReset();
  });

  // -----------------------------------------------------------------------------
  // SECTION 4: TEST CASES
  // -----------------------------------------------------------------------------
  it('renders the login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Check that the title is displayed - using querySelector directly
    const heading = screen.getByRole('heading', { name: /Welcome Back/i });
    expect(heading).toBeDefined();
    
    // Check that the form elements are displayed
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    const forgotPassword = screen.getByText(/Forgot password\?/i);
    
    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(submitButton).toBeDefined();
    expect(forgotPassword).toBeDefined();
  });

  it('validates form inputs before submission', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // The submit button should be disabled initially
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    expect(submitButton.disabled).toBe(true);
    
    // Fill in email only
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Button should still be disabled without password
    expect(submitButton.disabled).toBe(true);
    
    // Fill in password
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Now the button should be enabled
    expect(submitButton.disabled).toBe(false);
  });

  it('submits the form with valid credentials', async () => {
    // Mock successful login
    mockSignIn.mockResolvedValueOnce({ 
      data: { user: { id: '123' } }, 
      error: null 
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill in the form
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);
    
    // Verify that signIn was called with the correct credentials
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows loading state during form submission', async () => {
    // Mock a slow login response
    mockSignIn.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: { user: { id: '123' } }, error: null });
        }, 100);
      });
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Fill in the form
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);
    
    // Check for loading state
    await waitFor(() => {
      // Find the button text that shows "Signing In..."
      const loadingText = screen.getByText(/Signing In/i);
      expect(loadingText).toBeDefined();
    });
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it('toggles password visibility', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Password should be hidden initially
    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput.type).toBe('password');
    
    // Find the toggle button - it's likely an icon button without text
    // We'll need to find it by its function (being near the password field)
    const toggleButton = passwordInput.closest('div').querySelector('button');
    fireEvent.click(toggleButton);
    
    // Password should now be visible
    expect(passwordInput.type).toBe('text');
    
    // Click again to hide
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });
});