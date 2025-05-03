/**
 * Test file for ResendVerification component
 * 
 * This file tests the functionality of requesting a new verification email
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import the component to test
import ResendVerification from '../../src/components/auth/ResendVerification';

// Mock the useAuth hook
const mockResendVerificationEmail = vi.fn();
const mockUseAuth = vi.fn().mockReturnValue({
  isAuthenticated: false,
  isVerified: false,
  resendVerificationEmail: mockResendVerificationEmail
});

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test suite
describe('ResendVerification Component', () => {
  // Set up before each test
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    mockResendVerificationEmail.mockReset();
    window.localStorage.setItem.mockReset();
    
    // Reset auth mock to default values
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isVerified: false,
      resendVerificationEmail: mockResendVerificationEmail
    });
  });

  // Basic rendering test
  it('renders the form correctly', () => {
    render(
      <BrowserRouter>
        <ResendVerification />
      </BrowserRouter>
    );
    
    // Verify key elements
    expect(screen.getByRole('heading', { name: /Resend Verification Email/i })).toBeDefined();
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByTestId('resend-button')).toBeDefined();
  });

  // Test successful submission - FIX: Using better selectors
  it('submits the form with valid email', async () => {
    // Mock successful resend
    mockResendVerificationEmail.mockResolvedValueOnce({ success: true, error: null });
    
    render(
      <BrowserRouter>
        <ResendVerification />
      </BrowserRouter>
    );
    
    // Enter valid email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit form
    fireEvent.click(screen.getByTestId('resend-button'));
    
    // Verify resendVerificationEmail was called
    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    });
    
    // Verify localStorage was updated
    expect(window.localStorage.setItem).toHaveBeenCalledWith('lastSignupEmail', 'test@example.com');
    
    // Check for success message - FIX: Use a more reliable approach
    await waitFor(() => {
      const successMessage = screen.queryByText(/verification email sent successfully/i);
      expect(successMessage).toBeTruthy();
    });
    
    // Use act to handle the timeout in the component
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2500));
    });
    
    // Verify navigation to verification page
    expect(mockNavigate).toHaveBeenCalledWith('/verify-email');
  });

  // Test error handling - FIX: Using better selectors
  it('shows error when submission fails', async () => {
    // Mock failed resend with rejection
    mockResendVerificationEmail.mockRejectedValueOnce(
      new Error('Failed to resend verification email')
    );
    
    render(
      <BrowserRouter>
        <ResendVerification />
      </BrowserRouter>
    );
    
    // Enter email and submit
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('resend-button'));
    
    // Look for error message - FIX: Use more reliable selector
    await waitFor(() => {
      const errorMessage = screen.queryByText(/Failed to resend verification email/i);
      expect(errorMessage).toBeTruthy();
    });
    
    // Verify no navigation occurs
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Test redirection for verified users
  it('redirects to home if already verified', async () => {
    // Override useAuth mock for this test
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isVerified: true,
      resendVerificationEmail: mockResendVerificationEmail
    });
    
    render(
      <BrowserRouter>
        <ResendVerification />
      </BrowserRouter>
    );
    
    // Use act to handle state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify navigation to home
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});