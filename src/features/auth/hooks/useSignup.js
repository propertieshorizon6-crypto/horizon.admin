import { useMutation } from "@tanstack/react-query";
import { signupAdmin } from "../api/signup";

export const useSignup = (onSuccess) => {
  return useMutation({
    mutationFn: signupAdmin,
    onSuccess,
  });
};
