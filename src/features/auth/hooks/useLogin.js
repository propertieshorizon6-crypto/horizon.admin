
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginAdmin }  from "../api/login";
import { useAuthStore } from "../../../store/useAuthStore";

export default function useLogin() {
  const setAuth    = useAuthStore((s) => s.setAuth);
  const navigate   = useNavigate();

  return useMutation({
    mutationFn: loginAdmin,

    onSuccess: (data, variables) => {
      const authData = data?.data || {};

      // Store user + token in Zustand
      setAuth({
        user: authData.user,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });

      // If "Remember me" is unchecked, remove persisted auth so session clears on browser close
      if (!variables.rememberMe) {
        localStorage.removeItem("horizon-auth-store");
      }

      navigate("/admin/dashboard", { replace: true });
    },

  });
}
