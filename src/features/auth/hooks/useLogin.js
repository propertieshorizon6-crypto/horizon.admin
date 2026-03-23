
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginAdmin }  from "../api/login";
import { useAuthStore } from "../../../store/useAuthStore";

function getLoginErrorMessage(err) {
  if (!err.response) return "Network error. Please check your connection.";
  const { status } = err.response;
  if (status === 401) return "Invalid email or password.";
  if (status === 403) return "You don't have permission to access this portal.";
  if (status === 429) return "Too many login attempts. Please try again later.";
  const details = err?.response?.data?.error?.details;
  if (details?.length) return details[0].message;
  const serverMsg = err?.response?.data?.error?.message;
  if (serverMsg && serverMsg !== "Validation failed") return serverMsg;
  return "Login failed. Please check your credentials and try again.";
}

export default function useLogin() {
  const setAuth    = useAuthStore((s) => s.setAuth);
  const navigate   = useNavigate();

  return useMutation({
    mutationFn: async (credentials) => {
      try {
        return await loginAdmin(credentials);
      } catch (err) {
        throw new Error(getLoginErrorMessage(err));
      }
    },

    onSuccess: (data, variables) => {
      const authData = data?.data || {};

      // Store user + token in Zustand
      setAuth({
        user: authData.user,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });

      // If "Remember me" is unchecked, move auth to sessionStorage so it
      // survives page reloads but clears when the browser tab/window closes.
      if (!variables.rememberMe) {
        const stored = localStorage.getItem("horizon-auth-store");
        if (stored) {
          sessionStorage.setItem("horizon-auth-store", stored);
          localStorage.removeItem("horizon-auth-store");
        }
      }

      navigate("/admin/dashboard", { replace: true });
    },

  });
}
