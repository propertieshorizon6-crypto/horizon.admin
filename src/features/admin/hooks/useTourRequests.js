// 📁 src/features/admin/hooks/useTourRequests.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_TOURS, fetchTourRequests } from "../api/tourRequestsApi";

export default function useTourRequests() {
  return useQuery({
    queryKey: ["tour-requests"],
    queryFn:  MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res(MOCK_TOURS), 400))
      : () => fetchTourRequests(),
    staleTime: 1000 * 60 * 2,
  });
}
