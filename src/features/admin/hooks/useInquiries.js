// 📁 src/features/admin/hooks/useInquiries.js

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_INQUIRIES, fetchInquiries } from "../api/inquiriesApi";

// Pass real query params (status/search/propertyId/agentId/page/limit). Wrapping
// the queryFn in an arrow keeps React Query's context object out of the request
// params. Returns { inquiries, pagination } for server-side paging.
export default function useInquiries(params = {}) {
  return useQuery({
    queryKey: ["inquiries", params],
    queryFn:  MOCK_MODE
      ? () =>
          new Promise((res) =>
            setTimeout(
              () =>
                res({
                  inquiries: MOCK_INQUIRIES,
                  pagination: {
                    page: 1,
                    limit: MOCK_INQUIRIES.length,
                    total: MOCK_INQUIRIES.length,
                    pages: 1,
                  },
                }),
              400,
            ),
          )
      : () => fetchInquiries(params),
    placeholderData: keepPreviousData, // keep current page visible while next loads
    staleTime: 1000 * 60 * 2,
  });
}
