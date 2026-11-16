import { setAuthToken } from "#/lib/api";
import type { UserResponse } from "#/lib/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: UserResponse | null;
  hasHydrated: boolean;
  setUser: (user: UserResponse | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null as UserResponse | null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: () => {
        setAuthToken(null);
        set({ user: null });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
