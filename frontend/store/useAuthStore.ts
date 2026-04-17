import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  hasOnboardingCompleted: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          if (res.data.success) {
            const { token } = res.data;
            set({ token, isLoading: false });
            // Token is now in state, api interceptor (to be added) will use it
            // After login, fetch the user profile
            const authStore = useAuthStore.getState();
            await authStore.fetchMe();
          }
        } catch (err: any) {
          set({ 
            isLoading: false, 
            error: err.response?.data?.message || 'Login failed' 
          });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', { name, email, password });
          if (res.data.success) {
            const { token } = res.data;
            set({ token, isLoading: false });
            const authStore = useAuthStore.getState();
            await authStore.fetchMe();
          }
        } catch (err: any) {
          set({ 
            isLoading: false, 
            error: err.response?.data?.message || 'Registration failed' 
          });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            set({ user: res.data.data });
          }
        } catch (err) {
          set({ user: null, token: null });
        }
      },

      completeOnboarding: async () => {
        try {
          await api.put('/auth/onboarding/complete');
          const authStore = useAuthStore.getState();
          await authStore.fetchMe();
        } catch (err) {
          console.error('Failed to complete onboarding', err);
        }
      }
    }),

    {
      name: 'lifeos-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
