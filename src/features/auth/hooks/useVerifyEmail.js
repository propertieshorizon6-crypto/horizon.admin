import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "../api/verifyEmail";

export default function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}
