// 📁 src/features/admin/hooks/useDeliveryLogs.js
import { useQuery } from "@tanstack/react-query";
import { fetchDeliveryLogs } from "../api/notificationsApi";

export default function useDeliveryLogs(params = {}) {
  return useQuery({
    queryKey: ["delivery-logs", params],
    queryFn:  () => fetchDeliveryLogs(params),
    staleTime: 1000 * 60,
  });
}