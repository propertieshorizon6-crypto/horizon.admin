import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { loginAdmin } from "../../../services/authService";

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      const { user, accessToken } = data;

      setAuth({
        user,
        accessToken,
      });
    },
  });
};