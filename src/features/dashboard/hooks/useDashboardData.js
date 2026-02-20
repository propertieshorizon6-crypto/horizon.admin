import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../api/dashboardApi";

export default function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });
}