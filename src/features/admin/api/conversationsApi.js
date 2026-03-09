import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_CONVERSATIONS = [];

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

export const toRelativeTime = (value) => {
  if (!value) return "Just now";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Just now";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const mapConversation = (conversation = {}) => {
  const participants = Array.isArray(conversation.participants)
    ? conversation.participants
    : [];

  const agentParticipant = participants.find((p) => p.role === "agent");
  const customerParticipant =
    participants.find((p) => p.role === "client") ||
    participants.find((p) => p.role !== "admin" && p.role !== "manager") ||
    participants[0];

  const agentName = formatName(agentParticipant?.user);
  const customerName = formatName(customerParticipant?.user) || "Customer";

  const lastMessageText = conversation.lastMessage?.content || "No messages yet";
  const lastMessageTime = conversation.lastMessage?.sentAt || conversation.updatedAt;

  const tags = [];
  if (!agentName) tags.push("Unassigned");
  if (conversation.status === "active") tags.push("Pending Agent");

  return {
    id: conversation._id,
    customer: {
      name: customerName,
      phone: "N/A",
    },
    property: conversation.property?.title || "General",
    lastMsg: lastMessageText,
    time: toRelativeTime(lastMessageTime),
    status: conversation.status === "active" ? "Open" : "Closed",
    tags,
    agent: agentName,
    messages: [
      {
        id: `msg-${conversation._id}`,
        sender: "customer",
        text: lastMessageText,
        time: toRelativeTime(lastMessageTime),
      },
    ],
  };
};

export const fetchConversations = async (params = {}) => {
  const { data } = await apiClient.get("/conversations", { params });
  const conversations = data?.data?.conversations ?? [];
  return conversations.map(mapConversation);
};

export const fetchConversationById = async (conversationId, params = {}) => {
  const { data } = await apiClient.get(`/conversations/${conversationId}`, {
    params,
  });

  return data?.data?.conversation ?? null;
};

export const sendConversationMessage = async ({ conversationId, content }) => {
  const { data } = await apiClient.post(`/conversations/${conversationId}/messages`, {
    content,
  });

  return data?.data?.message ?? null;
};
