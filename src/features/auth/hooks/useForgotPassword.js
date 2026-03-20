import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../api/forgotPassword";

export default function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}
