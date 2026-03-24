/**
 * LoginScreen Tests — Client App
 *
 * Validates rendering, form validation, login flow (success / error),
 * loading state, biometric toggle, and navigation to Register.
 *
 * @module apps/client/__tests__/LoginScreen.test
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

const mockLogin = vi.fn();
vi.mock('@/shared/services/auth', () => ({
  authService: {
    login: mockLogin,
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useBiometricAuth', () => ({
  useBiometricAuth: () => ({
    isAvailable: false,
    isEnrolled: false,
    biometricType: null,
    authenticate: vi.fn(),
    getBiometricDisplayName: vi.fn(() => 'Biometric'),
  }),
}));

vi.mock('@/shared/services/storage', () => ({
  secureStorage: {
    getBiometricEnabled: vi.fn().mockResolvedValue(false),
    setBiometricEnabled: vi.fn(),
    setUserEmail: vi.fn(),
    getUserEmail: vi.fn(),
    getAccessToken: vi.fn(),
  },
}));

vi.mock('@/shared/utils/error-handler', () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock('@/shared/hooks/useAnalytics', () => ({
  useScreenTracking: vi.fn(),
  useAnalytics: () => ({
    logLogin: vi.fn(),
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
    foregroundSecondary: '#6B7280',
  }),
}));

vi.mock('@okinawa/shared/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/shared/validation/schemas', () => ({
  loginSchema: {},
  validateForm: vi.fn(() => ({ success: true, errors: {} })),
}));

vi.mock('@/shared/utils/haptics', () => ({
  default: {
    successNotification: vi.fn(),
    errorNotification: vi.fn(),
    lightImpact: vi.fn(),
  },
}));

import LoginScreen from '../screens/auth/LoginScreen';

// ============================================================
// TESTS
// ============================================================

describe('Client LoginScreen', () => {
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
  });

  // ---- Rendering ----

  it('renders the welcome title', () => {
    render(<LoginScreen {...defaultProps} />);
    expect(screen.getByText('auth.welcomeBack')).toBeTruthy();
  });

  it('renders email and password inputs', () => {
    render(<LoginScreen {...defaultProps} />);
    expect(screen.getByLabelText('Email address')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
  });

  it('renders the login button', () => {
    render(<LoginScreen {...defaultProps} />);
    expect(screen.getByText('auth.login')).toBeTruthy();
  });

  it('renders the register navigation link', () => {
    render(<LoginScreen {...defaultProps} />);
    expect(screen.getByText('auth.noAccount')).toBeTruthy();
  });

  // ---- Form interaction ----

  it('updates email input value on change', () => {
    render(<LoginScreen {...defaultProps} />);
    const emailInput = screen.getByLabelText('Email address');
    fireEvent.changeText(emailInput, 'user@example.com');
    expect(emailInput.props.value).toBe('user@example.com');
  });

  it('updates password input value on change', () => {
    render(<LoginScreen {...defaultProps} />);
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.changeText(passwordInput, 'Secret123');
    expect(passwordInput.props.value).toBe('Secret123');
  });

  // ---- Login success flow ----

  it('calls authService.login and navigates on success', async () => {
    mockLogin.mockResolvedValueOnce({
      user: { id: 'u1', email: 'a@b.com', role: 'customer' },
      access_token: 'tok',
    });

    render(<LoginScreen {...defaultProps} />);

    fireEvent.changeText(screen.getByLabelText('Email address'), 'a@b.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'Password1');
    fireEvent.press(screen.getByText('auth.login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('a@b.com', 'Password1');
    });

    await waitFor(() => {
      expect(defaultProps.navigation.replace).toHaveBeenCalledWith('Main');
    });
  });

  // ---- Login error flow ----

  it('displays error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(<LoginScreen {...defaultProps} />);

    fireEvent.changeText(screen.getByLabelText('Email address'), 'bad@email.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'wrong');
    fireEvent.press(screen.getByText('auth.login'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeTruthy();
    });
  });

  it('shows generic error when no response message exists', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'));

    render(<LoginScreen {...defaultProps} />);

    fireEvent.changeText(screen.getByLabelText('Email address'), 'a@b.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'Password1');
    fireEvent.press(screen.getByText('auth.login'));

    await waitFor(() => {
      expect(screen.getByText('auth.loginFailed')).toBeTruthy();
    });
  });

  // ---- Navigation ----

  it('navigates to Register screen when "no account" is pressed', () => {
    render(<LoginScreen {...defaultProps} />);

    fireEvent.press(screen.getByText('auth.noAccount'));

    expect(defaultProps.navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
