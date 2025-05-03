/**
 * Test file for Signup component
 * 
 * This test demonstrates how to test the Signup component
 * and its user registration functionality.
 */

// -----------------------------------------------------------------------------
// SECTION 1: IMPORTS
// -----------------------------------------------------------------------------
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../../src/components/auth/SignUp';

// -----------------------------------------------------------------------------
// SECTION 2: MOCKS
// -----------------------------------------------------------------------------
// Mock the useAuth hook
const mockSignUp = vi.fn();
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    isAuthenticated: false,
    authError: null
  })
}));

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// -----------------------------------------------------------------------------
// SECTION 3: TEST SUITE
// -----------------------------------------------------------------------------
describe('SignUp Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockReset();
    
    // Reset localStorage mock
    if (window.localStorage.getItem.mockClear) {
      window.localStorage.getItem.mockClear();
      window.localStorage.setItem.mockClear();
    }
  });

  // -----------------------------------------------------------------------------
  // SECTION 4: TEST CASES
  // -----------------------------------------------------------------------------
  it('renders the signup form correctly', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Check that the title is displayed
    const heading = screen.getByText(/Create Your Account/i);
    expect(heading).toBeDefined();
    
    // Check that all form elements are displayed
    const emailInput = screen.getByLabelText(/Email Address/i);
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const universityInput = screen.getByLabelText(/University/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    
    expect(emailInput).toBeDefined();
    expect(fullNameInput).toBeDefined();
    expect(usernameInput).toBeDefined();
    expect(universityInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(confirmPasswordInput).toBeDefined();
    expect(submitButton).toBeDefined();
  });

  it('validates form inputs before submission', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // The submit button should be disabled initially
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    expect(submitButton.disabled).toBe(true);
    
    // Fill in all required fields except password confirmation
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const universityInput = screen.getByLabelText(/University/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe123' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(universityInput, { target: { value: 'Test University' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });
    
    // Button should still be disabled without password confirmation
    expect(submitButton.disabled).toBe(true);
    
    // Fill in password confirmation with a different value
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass1!' } });
    
    // Button should still be disabled with mismatched passwords
    expect(submitButton.disabled).toBe(true);
    
    // Fix password confirmation
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass1!' } });
    
    // Now the button should be enabled
    expect(submitButton.disabled).toBe(false);
  });

  it('generates a username based on full name', async () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Check empty username initially
    const usernameInput = screen.getByLabelText(/Username/i);
    expect(usernameInput.value).toBe('');
    
    // Fill in full name
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    
    // Wait for the auto-generation to occur
    await waitFor(() => {
      // Check that username was auto-generated based on the full name
      expect(usernameInput.value).not.toBe('');
      expect(usernameInput.value.toLowerCase()).toContain('johndoe');
    });
  });

  it('submits the form with valid user data', async () => {
    mockSignUp.mockResolvedValueOnce({ data: {}, error: null });
    
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Fill in all required fields
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const universityInput = screen.getByLabelText(/University/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe123' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(universityInput, { target: { value: 'Test University' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass1!' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);
    
    // Verify that signUp was called with correct parameters
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledTimes(1);
      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'StrongPass1!',
        expect.objectContaining({
          full_name: 'John Doe',
          university: 'Test University',
          username: 'johndoe123'
        })
      );
    });
    
    // Should redirect to verification page after successful signup
    expect(mockNavigate).toHaveBeenCalledWith('/verify-email');
  });

  it('shows password strength indicator', async () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Find password input
    const passwordInput = screen.getByLabelText(/^Password/i);
    
    // Enter a weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    
    // Should show a strength indicator
    await waitFor(() => {
      // Look for strength indicator terms
      const weakIndicator = screen.getByText(/Weak/i);
      expect(weakIndicator).toBeDefined();
    });
    
    // Enter a stronger password
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
    
    // Should update the strength indicator
    await waitFor(() => {
      // Look for stronger indicator
      const strongIndicator = screen.getByText(/Strong/i);
      expect(strongIndicator).toBeDefined();
    });
  });

  it('displays error when signup fails', async () => {
    // Mock signup failure
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: new Error('This email is already registered')
    });
    
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Fill in all required fields
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const universityInput = screen.getByLabelText(/University/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe123' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(universityInput, { target: { value: 'Test University' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass1!' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);
    
    // Check that error is displayed
    await waitFor(() => {
      const errorMessage = screen.getByText(/This email is already registered/i);
      expect(errorMessage).toBeDefined();
    });
    
    // Should not redirect
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows loading state during form submission', async () => {
    // Mock slow signup
    mockSignUp.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => 
        resolve({ data: {}, error: null }), 100)
      )
    );
    
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Fill in all required fields
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const universityInput = screen.getByLabelText(/University/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe123' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(universityInput, { target: { value: 'Test University' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass1!' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);
    
    // Check for loading state
    await waitFor(() => {
      // Look for loading text
      const loadingText = screen.getByText(/Creating Account.../i);
      expect(loadingText).toBeDefined();
    });
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
  });
});