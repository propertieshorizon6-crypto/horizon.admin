import { useQuery } from "@tanstack/react-query";
import { MOCK_DASHBOARD_DATA, fetchDashboardData } from "../api/dashboardApi";

const MOCK_MODE = true; // set false when backend ready

const mockFetch = () =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_DASHBOARD_DATA), 500));

export default function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn:  MOCK_MODE ? mockFetch : fetchDashboardData,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}


