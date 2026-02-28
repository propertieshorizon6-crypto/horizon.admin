// 📁 src/features/admin/hooks/useProperties.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_PROPERTIES, fetchProperties } from "../api/propertiesApi";

export default function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn:  MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res(MOCK_PROPERTIES), 400))
      : fetchProperties,
    staleTime: 1000 * 60 * 5,
  });
}