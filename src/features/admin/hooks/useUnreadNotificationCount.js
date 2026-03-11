import { useQuery } from "@tanstack/react-query";
import {
  MOCK_MODE,
  MOCK_NOTIFICATIONS,
  fetchUnreadNotificationCount,
} from "../api/notificationsApi";

export default function useUnreadNotificationCount(queryOptions = {}) {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: MOCK_MODE
      ? () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve(
                  MOCK_NOTIFICATIONS.filter((item) => !item.read).length,
                ),
              300,
            ),
          )
      : fetchUnreadNotificationCount,
    staleTime: 1000 * 30,
    ...queryOptions,
  });
}
