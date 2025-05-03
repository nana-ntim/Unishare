/**
 * Test file for ForgotPassword component
 * 
 * This file tests the password reset request form functionality
 */

// Import test utilities
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import the component to test
import ForgotPassword from '../../src/components/auth/ForgotPassword';

// Mock the useAuth hook
const mockForgotPassword = vi.fn();
const mockUseAuth = vi.fn().mockReturnValue({
  forgotPassword: mockForgotPassword,
  isAuthenticated: false
});

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock navigation and location
const mockNavigate = vi.fn();
let mockLocationState = {};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState })
  };
});

// Test suite
describe('ForgotPassword Component', () => {
  // Set up before each test
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    mockForgotPassword.mockReset();
    mockLocationState = {};
    
    // Reset auth mock to default values
    mockUseAuth.mockReturnValue({
      forgotPassword: mockForgotPassword,
      isAuthenticated: false
    });
  });

  // Basic rendering test
  it('renders the forgot password form correctly', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Verify key elements are present
    expect(screen.getByText(/Reset Your Password/i)).toBeDefined();
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeDefined();
  });

  // Test successful submission
  it('submits the form with valid email', async () => {
    // Mock successful request
    mockForgotPassword.mockResolvedValueOnce({ success: true, error: null });
    
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Enter valid email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);
    
    // Verify forgotPassword was called
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
    
    // Find success message
    await waitFor(() => {
      const successMessage = screen.queryByText(/Password reset link sent/i);
      expect(successMessage).toBeTruthy();
    });
  });

  // Test success state
  it('shows success state with email confirmation', async () => {
    // Mock successful request
    mockForgotPassword.mockResolvedValueOnce({ success: true, error: null });
    
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Enter email and submit
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    
    // Wait for success state
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalled();
    });
    
    // Verify email confirmation is shown
    await waitFor(() => {
      const emailElement = screen.queryByText(/test@example.com/i);
      expect(emailElement).toBeTruthy();
    });
  });

  // Test error handling
  it('shows error when request fails', async () => {
    // Mock failed request
    mockForgotPassword.mockRejectedValueOnce(
      new Error('Email not found')
    );
    
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Enter email and submit
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    
    // Check for error message
    await waitFor(() => {
      const errorElement = screen.queryByText(/Email not found/i);
      expect(errorElement).toBeTruthy();
    });
  });

  // Test loading state
  it('shows loading state during submission', async () => {
    // Mock delayed response
    mockForgotPassword.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() =>
        resolve({ success: true, error: null }), 100)
      )
    );
    
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Enter email and submit
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    
    // Check for loading state
    expect(screen.getByText(/Sending Reset Link/i)).toBeDefined();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalled();
    });
  });

  // Test redirection for authenticated users
  it('redirects to home if already authenticated', async () => {
    // Override useAuth mock for this test
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      forgotPassword: mockForgotPassword
    });
    
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Verify navigation to home
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});