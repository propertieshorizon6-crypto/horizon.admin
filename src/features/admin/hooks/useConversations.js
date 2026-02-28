// 📁 src/features/admin/hooks/useConversations.js

import { useQuery } from "@tanstack/react-query";
import { MOCK_MODE, MOCK_CONVERSATIONS, fetchConversations } from "../api/conversationsApi";

export default function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn:  MOCK_MODE
      ? () => new Promise((res) => setTimeout(() => res(MOCK_CONVERSATIONS), 300))
      : fetchConversations,
    staleTime: 1000 * 60 * 2,
  });
}