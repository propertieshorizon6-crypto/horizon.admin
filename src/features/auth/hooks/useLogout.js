import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../api/logout";
import { useAuthStore } from "../../../store/useAuthStore";

export default function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuthState = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const { accessToken, refreshToken } = useAuthStore.getState();
      return logoutAdmin({ accessToken, refreshToken });
    },

    onError: () => {},

    onSettled: async () => {
      clearAuthState();
      await queryClient.cancelQueries();
      queryClient.clear();
      navigate("/auth", { replace: true });
    },
  });
}
