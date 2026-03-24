// 📁 src/features/admin/hooks/useUsers.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_USERS, fetchUsers } from "../api/usersApi";

export default function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res(MOCK_USERS), 350))
      : () => fetchUsers({ roles: "admin,manager,agent", limit: 200 }),
    staleTime: 1000 * 60 * 5,
  });
}