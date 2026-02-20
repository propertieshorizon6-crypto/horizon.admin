import { useMutation } from "@tanstack/react-query";
import { signupAdmin } from "../api/signup";

export const useSignup = () => {
  return useMutation({
    mutationFn: signupAdmin,
  });
};  