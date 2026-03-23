import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogById } from "../api/auditLogsApi";

export default function useAuditLog(id) {
  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: () => fetchAuditLogById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}
