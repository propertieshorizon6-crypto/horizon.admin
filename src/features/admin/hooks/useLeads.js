// 📁 src/features/admin/hooks/useLeads.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_LEADS, fetchLeads } from "../api/leadsApi";

export default function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn:  MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res(MOCK_LEADS), 400))
      : fetchLeads,
    staleTime: 1000 * 60 * 2,
  });
}