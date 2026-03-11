import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_NOTIFICATIONS, fetchNotifications } from "../api/notificationsApi";

export default function useNotifications(params = {}, queryOptions = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: MOCK_MODE
      ? () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  notifications: MOCK_NOTIFICATIONS,
                  unreadCount: MOCK_NOTIFICATIONS.filter((item) => !item.read)
                    .length,
                  pagination: null,
                }),
              300,
            ),
          )
      : () => fetchNotifications(params),
    staleTime: 1000 * 60,
    ...queryOptions,
  });
}
