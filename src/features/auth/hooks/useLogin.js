// import { useMutation } from "@tanstack/react-query";
// import { loginUser } from "../../../services/authService";
// import { useAuthStore } from "../../../store/useAuthStore";

// export const useLogin = () => {
//   const setUser = useAuthStore((s) => s.setUser);

//   return useMutation({
//     mutationFn: loginUser,
//     onSuccess: (data) => {
//       setUser(data.user);
//     },
//   });
// };

import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../../services/authService";
import { useAuthStore } from "../../../store/useAuthStore";

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
};