// 📁 src/features/admin/hooks/useProperties.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_PROPERTIES, fetchProperties } from "../api/propertiesApi";

export default function useProperties(params = {}) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res({
          properties: MOCK_PROPERTIES,
          meta: {},
          pagination: { total: MOCK_PROPERTIES.length, page: 1, limit: 20, totalPages: 1 },
        }), 400))
      : () => fetchProperties(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}
