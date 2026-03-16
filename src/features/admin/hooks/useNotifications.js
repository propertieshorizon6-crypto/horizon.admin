// 📁 src/features/admin/hooks/useNotifications.js
import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "../api/notificationsApi";

export default function useNotifications(params = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn:  () => fetchNotifications(params),
    staleTime: 1000 * 30,
  });
}