/**
 * Test file for EmailVerification component
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import the component to test
import EmailVerification from '../../src/components/auth/EmailVerification';

// Mock the useAuth hook
const mockResendVerificationEmail = vi.fn();
const mockUseAuth = vi.fn().mockReturnValue({
  user: { email: 'test@example.com' },
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
describe('EmailVerification Component', () => {
  // Set up before each test
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    mockResendVerificationEmail.mockReset();
    window.localStorage.getItem.mockReset();
    
    // Reset auth mock to default values
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: false,
      isVerified: false,
      resendVerificationEmail: mockResendVerificationEmail
    });
  });

  // Basic rendering test
  it('renders the verification page correctly', () => {
    render(
      <BrowserRouter>
        <EmailVerification />
      </BrowserRouter>
    );
    
    // Verify key elements are present
    expect(screen.getByText(/Verify Your Email/i)).toBeDefined();
    expect(screen.getByTestId('resend-button')).toBeDefined();
  });

  // Test email retrieval from localStorage
  it('gets email from localStorage if available', () => {
    // Mock localStorage returning an email
    window.localStorage.getItem.mockReturnValueOnce('stored@example.com');
    
    render(
      <BrowserRouter>
        <EmailVerification />
      </BrowserRouter>
    );
    
    // Check for masked email display
    expect(screen.getByText('sto•••@example.com')).toBeDefined();
    
    // Verify localStorage was checked
    expect(window.localStorage.getItem).toHaveBeenCalledWith('lastSignupEmail');
  });

  // Test email from auth context
  it('uses email from auth context if localStorage is empty', () => {
    // Mock localStorage returning null (no stored email)
    window.localStorage.getItem.mockReturnValueOnce(null);
    
    render(
      <BrowserRouter>
        <EmailVerification />
      </BrowserRouter>
    );
    
    // Check for masked email from auth context
    expect(screen.getByText('tes•••@example.com')).toBeDefined();
  });

  // Test resend functionality
  it('resends verification email when button is clicked', async () => {
    // Mock successful resend
    mockResendVerificationEmail.mockResolvedValueOnce({ success: true, error: null });
    
    // Mock localStorage to return email
    window.localStorage.getItem.mockReturnValueOnce('test@example.com');
    
    render(
      <BrowserRouter>
        <EmailVerification />
      </BrowserRouter>
    );
    
    // Click resend button
    fireEvent.click(screen.getByTestId('resend-button'));
    
    // Verify resend function was called
    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    });
    
    // Check for success message
    await waitFor(() => {
      const successText = screen.queryByText(/verification email sent/i);
      expect(successText).toBeTruthy();
    });
  });

  // Test error handling
  it('shows error when resend fails', async () => {
    // Mock failed resend
    mockResendVerificationEmail.mockResolvedValueOnce({ 
      success: false, 
      error: new Error('Failed to resend verification email') 
    });
    
    // Mock localStorage to return email
    window.localStorage.getItem.mockReturnValueOnce('test@example.com');
    
    render(
      <BrowserRouter>
        <EmailVerification />
      </BrowserRouter>
    );
    
    // Click resend button
    fireEvent.click(screen.getByTestId('resend-button'));
    
    // Check for error message - FIX: Use more reliable message testing approach
    await waitFor(() => {
      const errorText = screen.queryByText(/Failed to resend verification email/i);
      expect(errorText).toBeTruthy();
    });
  });

  // Test redirection for verified users
  it('redirects to home if already verified', async () => {
    // Override useAuth mock for this test to simulate verified user
    mockUseAuth.mockReturnValueOnce({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      isVerified: true,
      resendVerificationEmail: mockResendVerificationEmail
    });
    
    render(
      <BrowserRouter>
        <EmailVerification />
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