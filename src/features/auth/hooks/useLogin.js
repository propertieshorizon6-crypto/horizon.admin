
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginAdmin }  from "../api/login";
import { useAuthStore } from "../../../store/useAuthStore";

export default function useLogin() {
  const setAuth    = useAuthStore((s) => s.setAuth);
  const navigate   = useNavigate();

  return useMutation({
    mutationFn: loginAdmin,

    onSuccess: (data) => {
      // Store user + token in Zustand
      setAuth({
        user:        data.user,
        accessToken: data.accessToken,
      });

      // Admin dashboard pe redirect
      navigate("/admin/dashboard", { replace: true });
    },

    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
}
