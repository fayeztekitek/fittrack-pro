import { create } from 'zustand';
import axios from 'axios';

interface UserProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  stepGoal: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create a configured Axios instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useAuthStore = create<AuthState>((set, get) => {
  // Set up Axios interceptor for JWT injection and token refresh
  api.interceptors.request.use((config) => {
    const token = get().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('ft_refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Attempt token refresh
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken: newAccess, refreshToken: newRefresh, user } = res.data;

          localStorage.setItem('ft_refresh_token', newRefresh);
          set({ accessToken: newAccess, user, isAuthenticated: true });

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('ft_refresh_token');
          set({ user: null, accessToken: null, isAuthenticated: false });
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.post('/auth/login', credentials);
        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem('ft_refresh_token', refreshToken);
        set({ accessToken, user, isAuthenticated: true, isLoading: false });
      } catch (err: any) {
        const message = err.response?.data?.message || 'Login failed';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.post('/auth/register', data);
        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem('ft_refresh_token', refreshToken);
        set({ accessToken, user, isAuthenticated: true, isLoading: false });
      } catch (err: any) {
        const message = err.response?.data?.message || 'Registration failed';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    logout: async () => {
      const refreshToken = localStorage.getItem('ft_refresh_token');
      try {
        if (refreshToken) {
          await axios.post('/api/auth/logout', { refreshToken });
        }
      } catch (err) {
        console.error('Logout request failed', err);
      } finally {
        localStorage.removeItem('ft_refresh_token');
        set({ user: null, accessToken: null, isAuthenticated: false });
      }
    },

    checkAuth: async () => {
      const refreshToken = localStorage.getItem('ft_refresh_token');
      if (!refreshToken) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      set({ isLoading: true });
      try {
        const res = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh, user } = res.data;

        localStorage.setItem('ft_refresh_token', newRefresh);
        set({ accessToken, user, isAuthenticated: true, isLoading: false });
      } catch (err) {
        localStorage.removeItem('ft_refresh_token');
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    },
  };
});
