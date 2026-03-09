import { useQuery } from "@tanstack/react-query";
import {
  EMPTY_DASHBOARD_DATA,
  MOCK_DASHBOARD_DATA,
  fetchDashboardData,
} from "../api/dashboardApi";

const MOCK_MODE = import.meta.env.VITE_USE_MOCK_DASHBOARD === "true";

const mockFetch = () =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_DASHBOARD_DATA), 300));

export default function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: MOCK_MODE ? mockFetch : fetchDashboardData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: EMPTY_DASHBOARD_DATA,
  });
}
