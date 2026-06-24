// 📁 src/features/admin/hooks/useLeads.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_LEADS, fetchLeads } from "../api/leadsApi";

// Returns { leads, pagination }. Pass query params (status/search/agentId/archived/page/limit).
export default function useLeads(params = {}, options = {}) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn:  MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res({
          leads: MOCK_LEADS,
          pagination: { total: MOCK_LEADS.length, page: 1, limit: 20, pages: 1 },
        }), 400))
      : () => fetchLeads(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
    ...options,
  });
}
