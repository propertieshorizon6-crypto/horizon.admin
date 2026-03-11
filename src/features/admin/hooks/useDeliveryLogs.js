import { useQuery } from "@tanstack/react-query";
import {
  MOCK_MODE,
  MOCK_DELIVERY_LOGS,
  fetchDeliveryLogs,
} from "../api/notificationsApi";

export default function useDeliveryLogs(params = {}) {
  return useQuery({
    queryKey: ["delivery-logs", params],
    queryFn: MOCK_MODE
      ? () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  logs: MOCK_DELIVERY_LOGS,
                  pagination: null,
                }),
              300,
            ),
          )
      : () => fetchDeliveryLogs(params),
    staleTime: 1000 * 60,
  });
}
