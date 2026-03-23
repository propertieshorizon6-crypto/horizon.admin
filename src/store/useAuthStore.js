import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Raw string storage: reads localStorage first, falls back to sessionStorage.
// This lets "remember me" use localStorage and session-only use sessionStorage.
const rawHybridStorage = {
  getItem: (name) =>
    localStorage.getItem(name) ?? sessionStorage.getItem(name),
  setItem: (name, value) => {
    // Write to whichever storage already holds this key; default to localStorage.
    if (sessionStorage.getItem(name) !== null) {
      sessionStorage.setItem(name, value);
    } else {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,
      _hasHydrated:    false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      setAuth: ({ user, accessToken, refreshToken = null }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      updateUser: (updatedFields) =>
        set((state) => ({
          user: { ...state.user, ...updatedFields },
        })),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: "horizon-auth-store",
      storage: createJSONStorage(() => rawHybridStorage),
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
