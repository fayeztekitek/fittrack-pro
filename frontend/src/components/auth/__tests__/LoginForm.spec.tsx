import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

// Mock Translation Hook
vi.mock('../../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: vi.fn(),
  }),
}));

// Setup mock functions for the auth store
const mockLogin = vi.fn();
const mockRegister = vi.fn();
let mockIsLoading = false;
let mockError: string | null = null;

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    register: mockRegister,
    isLoading: mockIsLoading,
    error: mockError,
  }),
  api: {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('LoginForm Component', () => {
  const mockOnSwitchToSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
  });

  it('renders login form items successfully', () => {
    render(<LoginForm onSwitchToSignup={mockOnSwitchToSignup} />);

    expect(screen.getAllByText('auth.login')[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.demoLogin' })).toBeInTheDocument();
  });

  it('validates minimum password length', async () => {
    render(<LoginForm onSwitchToSignup={mockOnSwitchToSignup} />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'auth.login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } }); // Less than 6 chars
    fireEvent.click(submitButton);

    expect(screen.getByText('auth.errorMinPassword')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function on successful form submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginForm onSwitchToSignup={mockOnSwitchToSignup} />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'auth.login' });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  it('triggers demo login when clicked', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginForm onSwitchToSignup={mockOnSwitchToSignup} />);

    const demoButton = screen.getByRole('button', { name: 'auth.demoLogin' });
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'demo@fit.com',
        password: 'demo123',
      });
    });
  });

  it('switches to signup page', () => {
    render(<LoginForm onSwitchToSignup={mockOnSwitchToSignup} />);

    const signupButton = screen.getByRole('button', { name: 'auth.signup' });
    fireEvent.click(signupButton);

    expect(mockOnSwitchToSignup).toHaveBeenCalled();
  });
});
