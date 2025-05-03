# UniShare Testing Guide

This guide explains how to work with tests for the UniShare authentication components.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun when files change)
npm test -- --watch

# Run a specific test file
npm test -- tests/components/Login.test.jsx
```

## Test Structure

Each test file follows a consistent pattern:

1. **Imports**: Required libraries and components
2. **Mocks**: Setup of simulated dependencies
3. **Test Suite**: A group of related tests
4. **Individual Tests**: Specific behaviors being verified

## Common Test Patterns

### 1. Component Rendering Tests

Tests that verify components display correctly:

```javascript
it('renders the form correctly', () => {
  render(<MyComponent />);
  
  // Check for expected elements
  expect(screen.getByText(/Welcome/i)).toBeDefined();
  expect(screen.getByLabelText(/Email/i)).toBeDefined();
});
```

### 2. Form Submission Tests

Tests that verify form behavior:

```javascript
it('submits the form with valid data', async () => {
  // Mock successful API response
  mockApiFunction.mockResolvedValueOnce({ success: true });
  
  render(<Form />);
  
  // Fill in form fields
  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: 'test@example.com' }
  });
  
  // Submit form
  fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
  
  // Verify API was called correctly
  await waitFor(() => {
    expect(mockApiFunction).toHaveBeenCalledWith('test@example.com');
  });
});
```

### 3. Error Handling Tests

Tests that verify error displays:

```javascript
it('shows error when submission fails', async () => {
  // Mock failed API response
  mockApiFunction.mockRejectedValueOnce(
    new Error('Error message')
  );
  
  render(<Form />);
  
  // Fill in and submit form
  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: 'test@example.com' }
  });
  fireEvent.click(screen.getByRole('button'));
  
  // Check for error message
  await waitFor(() => {
    const errorMessage = screen.queryByText(/Error message/i);
    expect(errorMessage).toBeTruthy();
  });
});
```

## Fixing Common Test Errors

### 1. "Unable to find an element"

This usually means the element doesn't exist or has a different text/attribute than expected:

```javascript
// Problem: Too specific
screen.getByText('Exact Text');

// Solution: Use more flexible matching
screen.getByText(/Partial Text/i);
// Or use a data-testid attribute
screen.getByTestId('element-id');
```

### 2. "Found multiple elements"

This happens when your selector matches multiple elements:

```javascript
// Problem: Multiple elements match "User"
screen.getByText(/User/i);

// Solution: Use more specific selector
screen.getByText(/User Profile/i);
// Or use a data-testid attribute
screen.getByTestId('user-profile');
```

### 3. Async State Issues

If tests are failing with timeout errors, make sure to properly wait for async state updates:

```javascript
// Problem: Test doesn't wait for updates
fireEvent.click(button);
expect(something).toHaveChanged();

// Solution: Use waitFor
fireEvent.click(button);
await waitFor(() => {
  expect(something).toHaveChanged();
});
```

## Adding Test IDs to Components

To make tests more reliable, add `data-testid` attributes to key elements in your components:

```jsx
// Before
<button onClick={handleClick}>Submit</button>

// After
<button data-testid="submit-button" onClick={handleClick}>Submit</button>
```

Then use it in tests:

```javascript
// Finding by test ID is more reliable than text
const button = screen.getByTestId('submit-button');
fireEvent.click(button);
```

## Testing Tips

1. **Test behavior, not implementation details** - Focus on what users see and do
2. **Keep tests isolated** - Reset mocks between tests
3. **Use waitFor for async updates** - Always wait for state changes
4. **Add data-testid attributes** - Make selectors more reliable
5. **Write clear test descriptions** - Be specific about what's being tested