import { setAuthToken } from "#/lib/api";
import type { UserResponse } from "#/lib/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: UserResponse | null;
  setUser: (user: UserResponse | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null as UserResponse | null,
      setUser: (user) => set({ user }),
      logout: () => {
        setAuthToken(null);
        set({ user: null });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
