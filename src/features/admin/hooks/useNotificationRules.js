import { useQuery } from "@tanstack/react-query";
import {
  MOCK_MODE,
  MOCK_NOTIFICATION_RULES,
  fetchNotificationRules,
} from "../api/notificationsApi";

export default function useNotificationRules(params = {}) {
  return useQuery({
    queryKey: ["notification-rules", params],
    queryFn: MOCK_MODE
      ? () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  rules: MOCK_NOTIFICATION_RULES,
                  pagination: null,
                }),
              300,
            ),
          )
      : () => fetchNotificationRules(params),
    staleTime: 1000 * 60 * 2,
  });
}
