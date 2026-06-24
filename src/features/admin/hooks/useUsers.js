// 📁 src/features/admin/hooks/useUsers.js

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_USERS, fetchUsersPage } from "../api/usersApi";

// Returns { users, pagination }. Pass query params (role/roles/status/search/page/limit).
// Default roles keep the list scoped to admin/manager/agent.
export default function useUsers(params = {}) {
  const merged = { roles: "admin,manager,agent", limit: 10, ...params };
  return useQuery({
    queryKey: ["users", merged],
    queryFn: MOCK_MODE
      ? () =>
          new Promise((res) =>
            setTimeout(
              () =>
                res({
                  users: MOCK_USERS,
                  pagination: { page: 1, limit: MOCK_USERS.length, total: MOCK_USERS.length, pages: 1 },
                }),
              350,
            ),
          )
      : () => fetchUsersPage(merged),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}
