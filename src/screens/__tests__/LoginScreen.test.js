import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { AuthContext } from '../../context/AuthContext';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock Feather icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Icon',
}));

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  const renderLoginScreen = (authValue = {}) => {
    return render(
      <AuthContext.Provider
        value={{
          login: mockLogin,
          isLoading: false,
          authError: null,
          clearError: mockClearError,
          ...authValue,
        }}
      >
        <LoginScreen navigation={mockNavigation} />
      </AuthContext.Provider>
    );
  };

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = renderLoginScreen();
    
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('updates username and password input values', () => {
    const { getByPlaceholderText } = renderLoginScreen();
    
    const usernameInput = getByPlaceholderText('Enter your username');
    const passwordInput = getByPlaceholderText('Enter your password');
    
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');
    
    expect(usernameInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls login function on button press', async () => {
    const { getByText, getByPlaceholderText } = renderLoginScreen();
    
    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('shows error message if authError is present', () => {
    const { getByText } = renderLoginScreen({ authError: 'Invalid credentials' });
    
    expect(getByText('Invalid credentials')).toBeTruthy();
  });

  it('shows activity indicator when loading', () => {
    const { getByTestId, queryByText } = renderLoginScreen({ isLoading: true });
    
    // Sign In text should be replaced by ActivityIndicator
    expect(queryByText('Sign In')).toBeNull();
  });

  it('navigates to SignUp screen on press', () => {
    const { getByText } = renderLoginScreen();
    
    fireEvent.press(getByText('Create an Account'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUp');
    expect(mockClearError).toHaveBeenCalled();
  });
});
