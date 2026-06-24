// 📁 src/features/admin/hooks/useConversations.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_CONVERSATIONS, fetchConversations } from "../api/conversationsApi";

// Pass query params (status/search/page/limit). Wrapping fetchConversations in an
// arrow keeps React Query's context object ({ queryKey, signal, client }) out of
// the request params — passing it directly produced ?client=[object Object] URLs.
export default function useConversations(params = {}) {
  return useQuery({
    queryKey: ["conversations", params],
    queryFn:  MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res(MOCK_CONVERSATIONS), 300))
      : () => fetchConversations(params),
    staleTime: 1000 * 60 * 2,
  });
}