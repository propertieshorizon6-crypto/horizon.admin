import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../api/resetPassword";

export default function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}
