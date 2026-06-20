import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupForm } from '../SignupForm';
import { Gender } from '../../../users/entities/user-profile.entity';

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

describe('SignupForm Component', () => {
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
  });

  it('renders all signup fields and components successfully', () => {
    render(<SignupForm onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getAllByText('auth.signup')[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Fayez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('auth.weight')).toBeInTheDocument();
    expect(screen.getByText('auth.height')).toBeInTheDocument();
    expect(screen.getByText('auth.age')).toBeInTheDocument();
    expect(screen.getByText('auth.gender')).toBeInTheDocument();
    expect(screen.getByText('auth.stepGoal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.signup' })).toBeInTheDocument();
  });

  it('validates password min length on sign up', async () => {
    render(<SignupForm onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByPlaceholderText('Fayez');
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'auth.signup' });

    fireEvent.change(nameInput, { target: { value: 'Fayez' } });
    fireEvent.change(emailInput, { target: { value: 'fayez@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } }); // Short password
    fireEvent.click(submitButton);

    expect(screen.getByText('auth.errorMinPassword')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register API on correct credentials', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    render(<SignupForm onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByPlaceholderText('Fayez');
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'auth.signup' });

    // Set values
    fireEvent.change(nameInput, { target: { value: 'Fayez' } });
    fireEvent.change(emailInput, { target: { value: 'fayez@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Choose gender
    const femaleButton = screen.getByRole('button', { name: 'F' });
    fireEvent.click(femaleButton);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Fayez',
        email: 'fayez@example.com',
        password: 'password123',
        weightKg: 70,
        heightCm: 175,
        age: 30,
        gender: Gender.FEMALE,
        stepGoal: 10000,
      });
    });
  });

  it('switches to login form', () => {
    render(<SignupForm onSwitchToLogin={mockOnSwitchToLogin} />);

    const loginButton = screen.getByRole('button', { name: 'auth.login' });
    fireEvent.click(loginButton);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });
});
