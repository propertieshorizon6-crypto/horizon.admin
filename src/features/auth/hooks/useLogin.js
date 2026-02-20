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
import { loginAdmin } from "../../../services/authService";
import { useAuthStore } from "../../../store/useAuthStore";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      const { user, accessToken } = data;
      setAuth({ user, accessToken });
    },
  });
};
