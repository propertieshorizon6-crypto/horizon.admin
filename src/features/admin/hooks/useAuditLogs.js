import { useQuery } from "@tanstack/react-query";
import { MOCK_AUDIT_LOGS, MOCK_MODE, fetchAuditLogs } from "../api/auditLogsApi";

export default function useAuditLogs(params = {}, queryOptions = {}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: MOCK_MODE
      ? () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  logs: MOCK_AUDIT_LOGS,
                  pagination: null,
                }),
              300,
            ),
          )
      : () => fetchAuditLogs(params),
    staleTime: 1000 * 60,
    ...queryOptions,
  });
}

