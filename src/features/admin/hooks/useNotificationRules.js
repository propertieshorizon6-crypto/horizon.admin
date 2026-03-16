// 📁 src/features/admin/hooks/useNotificationRules.js
import { useQuery } from "@tanstack/react-query";
import { fetchNotificationRules } from "../api/notificationsApi";

export default function useNotificationRules(params = {}) {
  return useQuery({
    queryKey: ["notification-rules", params],
    queryFn:  () => fetchNotificationRules(params),
    staleTime: 1000 * 60 * 5,
  });
}