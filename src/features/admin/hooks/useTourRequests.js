// 📁 src/features/admin/hooks/useTourRequests.js

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_TOURS, fetchTourRequests } from "../api/tourRequestsApi";

// Returns { tours, pagination }. Pass query params (status/date/agentId/search/page/limit).
export default function useTourRequests(params = {}, options = {}) {
  return useQuery({
    queryKey: ["tour-requests", params],
    queryFn:  MOCK_MODE
      ? () =>
          new Promise((res) =>
            setTimeout(
              () => res({ tours: MOCK_TOURS, pagination: { page: 1, limit: MOCK_TOURS.length, total: MOCK_TOURS.length, pages: 1 } }),
              400,
            ),
          )
      : () => fetchTourRequests(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
}
