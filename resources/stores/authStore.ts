import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  logout: () => void;
  setToken: (token: string | null) => void;
  token: string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      logout: () => {
        set({ token: null });
      },
      setToken: token => {
        set({ token });
      },
    }),
    {
      name: 'flight-logger-token',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getIsLoggedIn = ({ token }: AuthState): boolean => token !== null;
