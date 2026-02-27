import { create }   from "zustand";
import { persist }  from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken = null }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      // ✅ Sirf yeh ek action add kiya — name, phone update ke liye
      updateUser: (updatedFields) =>
        set((state) => ({
          user: { ...state.user, ...updatedFields },
        })),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: "horizon-auth-store",
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);