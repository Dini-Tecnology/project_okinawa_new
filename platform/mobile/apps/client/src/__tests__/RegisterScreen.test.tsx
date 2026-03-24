/**
 * RegisterScreen Tests — Client App
 *
 * Validates rendering, field validation, registration success/error,
 * password confirmation, and navigation back to Login.
 *
 * @module apps/client/__tests__/RegisterScreen.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// ============================================================
// MOCKS
// ============================================================

const mockNavigate = vi.fn();
const mockReplace = vi.fn();

vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
    goBack: vi.fn(),
    setOptions: vi.fn(),
    addListener: vi.fn(),
  }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: vi.fn(),
}));

const mockRegister = vi.fn();
vi.mock('@/shared/services/auth', () => ({
  authService: {
    register: mockRegister,
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useAnalytics', () => ({
  useScreenTracking: vi.fn(),
  useAnalytics: () => ({
    logSignUp: vi.fn(),
    logError: vi.fn(),
  }),
}));

vi.mock('@/shared/contexts/AnalyticsContext', () => ({
  useAnalyticsContext: () => ({
    setUser: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'pt-BR',
  }),
}));

vi.mock('@okinawa/shared/contexts/ThemeContext', () => ({
  useColors: () => ({
    background: '#FFFFFF',
    foreground: '#111827',
    card: '#F9FAFB',
    primary: '#EA580C',
    border: '#E5E7EB',
  }),
}));

const mockValidateForm = vi.fn(() => ({ success: true, errors: {} }));
vi.mock('@/shared/validation/schemas', () => ({
  registerSchema: {},
  validateForm: (...args: any[]) => mockValidateForm(...args),
}));

vi.mock('@/shared/utils/haptics', () => ({
  default: {
    successNotification: vi.fn(),
    errorNotification: vi.fn(),
  },
}));

import RegisterScreen from '../screens/auth/RegisterScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client RegisterScreen', () => {
  const defaultProps = {
    navigation: {
      navigate: mockNavigate,
      replace: mockReplace,
      goBack: vi.fn(),
      setOptions: vi.fn(),
      addListener: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateForm.mockReturnValue({ success: true, errors: {} });
  });

  // ---- Rendering ----

  it('renders the create account title', () => {
    render(<RegisterScreen {...defaultProps} />);
    expect(screen.getByText('auth.createAccount')).toBeTruthy();
  });

  it('renders all four form fields', () => {
    render(<RegisterScreen {...defaultProps} />);
    expect(screen.getByLabelText('Full name')).toBeTruthy();
    expect(screen.getByLabelText('Email address')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByLabelText('Confirm password')).toBeTruthy();
  });

  it('renders register button and has-account link', () => {
    render(<RegisterScreen {...defaultProps} />);
    expect(screen.getByText('auth.register')).toBeTruthy();
    expect(screen.getByText('auth.hasAccount')).toBeTruthy();
  });

  // ---- Field interactions ----

  it('updates all field values on change', () => {
    render(<RegisterScreen {...defaultProps} />);

    const fullName = screen.getByLabelText('Full name');
    const email = screen.getByLabelText('Email address');
    const password = screen.getByLabelText('Password');
    const confirmPassword = screen.getByLabelText('Confirm password');

    fireEvent.changeText(fullName, 'John Doe');
    fireEvent.changeText(email, 'john@example.com');
    fireEvent.changeText(password, 'SecurePass1');
    fireEvent.changeText(confirmPassword, 'SecurePass1');

    expect(fullName.props.value).toBe('John Doe');
    expect(email.props.value).toBe('john@example.com');
    expect(password.props.value).toBe('SecurePass1');
    expect(confirmPassword.props.value).toBe('SecurePass1');
  });

  // ---- Validation ----

  it('shows field errors when validation fails', async () => {
    mockValidateForm.mockReturnValue({
      success: false,
      errors: { email: 'Invalid email address' },
    });

    render(<RegisterScreen {...defaultProps} />);
    fireEvent.press(screen.getByText('auth.register'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeTruthy();
    });
  });

  it('does not call authService.register when validation fails', async () => {
    mockValidateForm.mockReturnValue({
      success: false,
      errors: { fullName: 'Name must be at least 2 characters' },
    });

    render(<RegisterScreen {...defaultProps} />);
    fireEvent.press(screen.getByText('auth.register'));

    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  // ---- Registration success ----

  it('calls authService.register and navigates on success', async () => {
    mockRegister.mockResolvedValueOnce({
      user: { id: 'u2', email: 'john@test.com', role: 'customer' },
      access_token: 'new-token',
    });

    render(<RegisterScreen {...defaultProps} />);

    fireEvent.changeText(screen.getByLabelText('Full name'), 'John Doe');
    fireEvent.changeText(screen.getByLabelText('Email address'), 'john@test.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'Password1');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'Password1');
    fireEvent.press(screen.getByText('auth.register'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('john@test.com', 'Password1', 'John Doe');
    });

    await waitFor(() => {
      expect(defaultProps.navigation.replace).toHaveBeenCalledWith('Main');
    });
  });

  // ---- Registration error ----

  it('displays server error when registration fails', async () => {
    mockRegister.mockRejectedValueOnce({
      response: { data: { message: 'Email already exists' } },
    });

    render(<RegisterScreen {...defaultProps} />);

    fireEvent.changeText(screen.getByLabelText('Email address'), 'taken@test.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'Password1');
    fireEvent.press(screen.getByText('auth.register'));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeTruthy();
    });
  });

  it('shows generic error when no server message is present', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Network down'));

    render(<RegisterScreen {...defaultProps} />);
    fireEvent.press(screen.getByText('auth.register'));

    await waitFor(() => {
      expect(screen.getByText('auth.registerFailed')).toBeTruthy();
    });
  });

  // ---- Navigation ----

  it('navigates to Login screen when "has account" link is pressed', () => {
    render(<RegisterScreen {...defaultProps} />);
    fireEvent.press(screen.getByText('auth.hasAccount'));
    expect(defaultProps.navigation.navigate).toHaveBeenCalledWith('Login');
  });
});
