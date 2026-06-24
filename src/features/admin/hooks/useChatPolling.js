import { useQuery } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchThreads,
  fetchMessages,
} from "../api/conversationsApi";

const MSG_POLL_MS   = 5_000;
const THREAD_POLL_MS = 15_000;
const CONV_POLL_MS   = 30_000;

export default function useChatPolling({ conversationId, threadId, statusFilter = "", search = "" }) {
  const { data: convsData, isLoading: isConvsLoading } = useQuery({
    queryKey: ["conversations", statusFilter, search],
    queryFn:  () => fetchConversations({ status: statusFilter || undefined, search: search || undefined, limit: 50 }),
    staleTime: CONV_POLL_MS,
    refetchInterval: CONV_POLL_MS,
    refetchIntervalInBackground: false,
  });

  const { data: threads = [], isLoading: isThreadsLoading } = useQuery({
    queryKey: ["threads", conversationId],
    queryFn:  () => fetchThreads(conversationId),
    enabled:  Boolean(conversationId),
    staleTime: THREAD_POLL_MS,
    refetchInterval: THREAD_POLL_MS,
    refetchIntervalInBackground: false,
  });

  const { data: messages = [], isLoading: isMsgsLoading } = useQuery({
    queryKey: ["messages", conversationId, threadId],
    queryFn:  () => fetchMessages(conversationId, threadId),
    enabled:  Boolean(conversationId && threadId),
    staleTime: MSG_POLL_MS,
    refetchInterval: MSG_POLL_MS,
    refetchIntervalInBackground: false,
  });

  return {
    convsData,
    isConvsLoading,
    threads,
    isThreadsLoading,
    messages,
    isMsgsLoading,
  };
}
