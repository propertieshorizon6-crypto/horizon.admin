// 📁 src/features/admin/hooks/useInquiries.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_INQUIRIES, fetchInquiries } from "../api/inquiriesApi";

export default function useInquiries() {
  return useQuery({
    queryKey: ["inquiries"],
    queryFn:  MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res(MOCK_INQUIRIES), 400))
      : fetchInquiries,
    staleTime: 1000 * 60 * 2,
  });
}