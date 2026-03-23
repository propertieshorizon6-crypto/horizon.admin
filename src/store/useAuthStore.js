import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
      storage: createJSONStorage(() => localStorage),
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
