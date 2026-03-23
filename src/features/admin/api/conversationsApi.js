// 📁 src/features/admin/api/conversationsApi.js

import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_CONVERSATIONS = [];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

export const toRelativeTime = (value) => {
  if (!value) return "Just now";
  const diff    = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ── Mappers ───────────────────────────────────────────────────────────────────
const mapConversation = (conv = {}) => {
  const client = conv.client ?? {};
  return {
    id:          conv._id,
    clientId:    client._id || client.id || null,
    clientName:  formatName(client) || "Customer",
    clientEmail: client.email || null,
    clientPhone: client.phone || null,
    status:      conv.status ?? "active",   // active | archived | closed
    createdAt:   conv.createdAt,
    updatedAt:   conv.updatedAt,
    time:        toRelativeTime(conv.updatedAt || conv.createdAt),
  };
};

const mapThread = (thread = {}) => ({
  id:           thread._id,
  conversationId: thread.conversation,
  subject:      thread.subject || "Thread",
  property:     thread.property?.title || null,
  propertyId:   thread.property?._id  || thread.property || null,
  status:       thread.status ?? "active",   // active | closed
  messageCount: thread.messageCount ?? 0,
  unreadCount:  thread.unreadCounts?.admin ?? thread.unreadCounts?.manager ?? 0,
  lastMessage:  thread.lastMessage?.content || null,
  lastMessageAt: thread.lastMessage?.sentAt || thread.updatedAt || null,
  time:         toRelativeTime(thread.lastMessage?.sentAt || thread.updatedAt),
  createdAt:    thread.createdAt,
});

const mapMessage = (msg = {}) => ({
  id:        msg._id,
  content:   msg.content || "",
  type:      msg.type ?? "text",   // text | system
  sender:    msg.sender,           // raw — resolve in component
  senderId:  msg.sender?._id || msg.sender?.id || (typeof msg.sender === "string" ? msg.sender : null),
  senderName: formatName(msg.sender) || null,
  senderRole: msg.sender?.role || null,
  sentAt:    msg.sentAt || msg.createdAt,
  time:      toRelativeTime(msg.sentAt || msg.createdAt),
});

// ── Conversation APIs ─────────────────────────────────────────────────────────

// GET /api/v1/conversations
export const fetchConversations = async (params = {}) => {
  const { data } = await apiClient.get("/conversations", { params });
  const conversations = data?.data?.conversations ?? [];
  return {
    conversations: conversations.map(mapConversation),
    total:      data?.data?.total ?? conversations.length,
    page:       data?.data?.page  ?? 1,
    totalPages: data?.data?.totalPages ?? 1,
  };
};

// GET /api/v1/conversations/:id
export const fetchConversationById = async (conversationId) => {
  if (!conversationId) return null;
  const { data } = await apiClient.get(`/conversations/${conversationId}`);
  const conv = data?.data?.conversation;
  return conv ? mapConversation(conv) : null;
};

// PATCH /api/v1/conversations/:id/close
export const closeConversation = async (conversationId) => {
  const { data } = await apiClient.patch(`/conversations/${conversationId}/close`);
  return data;
};

// PATCH /api/v1/conversations/:id/archive
export const archiveConversation = async (conversationId) => {
  const { data } = await apiClient.patch(`/conversations/${conversationId}/archive`);
  return data;
};

// PATCH /api/v1/conversations/:id/unarchive
export const unarchiveConversation = async (conversationId) => {
  const { data } = await apiClient.patch(`/conversations/${conversationId}/unarchive`);
  return data;
};

// PATCH /api/v1/conversations/:id/read
export const markConversationRead = async (conversationId) => {
  const { data } = await apiClient.patch(`/conversations/${conversationId}/read`);
  return data;
};

// GET /api/v1/conversations/unread
export const fetchUnreadCount = async () => {
  const { data } = await apiClient.get("/conversations/unread");
  return data?.data ?? { count: 0 };
};

// ── Thread APIs ───────────────────────────────────────────────────────────────

// GET /api/v1/conversations/:conversationId/threads
export const fetchThreads = async (conversationId) => {
  if (!conversationId) return [];
  const { data } = await apiClient.get(`/conversations/${conversationId}/threads`);
  const threads = data?.data?.threads ?? [];
  return threads.map(mapThread);
};

// PATCH /api/v1/conversations/:conversationId/threads/:threadId/close
export const closeThread = async (conversationId, threadId) => {
  const { data } = await apiClient.patch(
    `/conversations/${conversationId}/threads/${threadId}/close`
  );
  return data;
};

// ── Message APIs ──────────────────────────────────────────────────────────────

// GET /api/v1/conversations/:conversationId/threads/:threadId/messages
export const fetchMessages = async (conversationId, threadId, params = {}) => {
  if (!conversationId || !threadId) return [];
  const { data } = await apiClient.get(
    `/conversations/${conversationId}/threads/${threadId}/messages`,
    { params: { limit: 100, ...params } }
  );
  const messages = data?.data?.messages ?? [];
  return messages.map(mapMessage);
};

// POST /api/v1/conversations/:conversationId/threads/:threadId/messages
export const sendMessage = async (conversationId, threadId, content) => {
  const { data } = await apiClient.post(
    `/conversations/${conversationId}/threads/${threadId}/messages`,
    { content }
  );
  const message = data?.data?.message;
  return message ? mapMessage(message) : null;
};