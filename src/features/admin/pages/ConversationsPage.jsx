// 📁 src/features/admin/pages/ConversationsPage.jsx

import { useState, useMemo, useRef, useEffect } from "react";
import { MessageSquare, Search, ChevronDown, Bell, Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useConversations from "../hooks/useConversations";
import {
  fetchConversationById,
  sendConversationMessage,
  toRelativeTime,
} from "../api/conversationsApi";
import { useAuthStore } from "../../../store/useAuthStore";

// ── Tag badge ────────────────────────────────────────────────────────────────
function Tag({ label }) {
  if (label === "Unassigned") return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "#dc2626", color: "#fff" }}>
      Unassigned
    </span>
  );
  if (label === "Pending Agent") return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
      Pending Agent
    </span>
  );
  if (label === "Open") return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "#1e293b", color: "#fff" }}>
      Open
    </span>
  );
  return null;
}

// ── Conversation List Item ───────────────────────────────────────────────────
function ConvItem({ conv, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid #f1f5f9",
        background: active ? "#f0f9ff" : "#fff",
        cursor: "pointer",
        borderLeft: active ? "3px solid #0ea5e9" : "3px solid transparent",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f8fafc"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#fff"; }}
    >
      {/* Name + time */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{conv.customer.name}</span>
        <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 8 }}>{conv.time}</span>
      </div>

      {/* Phone */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.83 2 2 0 0 1 3.59 2.63h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.17a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.5z"/>
        </svg>
        <span style={{ fontSize: 11, color: "#64748b" }}>{conv.customer.phone}</span>
      </div>

      {/* Property */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
        <span style={{ fontSize: 11, color: "#64748b" }}>{conv.property}</span>
      </div>

      {/* Last message */}
      <p style={{ fontSize: 12, color: "#475569", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {conv.lastMsg}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {conv.tags.map((t) => <Tag key={t} label={t} />)}
        <Tag label="Open" />
      </div>
    </div>
  );
}

// ── Chat bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ msg }) {
  const isAgent = msg.sender === "agent";
  return (
    <div style={{ display: "flex", justifyContent: isAgent ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div style={{
        maxWidth: "70%", padding: "10px 14px", borderRadius: isAgent ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isAgent ? "#1e3a5f" : "#f1f5f9",
        color: isAgent ? "#fff" : "#1e293b",
        fontSize: 13, lineHeight: 1.5,
      }}>
        <p style={{ margin: 0 }}>{msg.text}</p>
        <p style={{ margin: "4px 0 0", fontSize: 10, opacity: 0.6, textAlign: isAgent ? "right" : "left" }}>{msg.time}</p>
      </div>
    </div>
  );
}

const getSenderId = (sender) => {
  if (!sender) return null;
  if (typeof sender === "string") return sender;
  return sender._id || sender.id || null;
};

export default function ConversationsPage() {
  const { data: conversations = [], isLoading } = useConversations();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?._id || user?.id || null;

  const [selected,     setSelected]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [replyText,    setReplyText]    = useState("");
  const bottomRef = useRef(null);

  // Auto scroll to bottom when conversation selected
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected]);

  // Stats
  const stats = useMemo(() => ({
    total:      conversations.length,
    open:       conversations.filter((c) => c.status === "Open").length,
    pendingAgent: conversations.filter((c) => c.tags.includes("Pending Agent")).length,
    unassigned: conversations.filter((c) => c.tags.includes("Unassigned")).length,
  }), [conversations]);

  // Filtered list
  const filtered = useMemo(() => {
    let data = conversations;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((c) =>
        c.customer.name.toLowerCase().includes(q) ||
        c.customer.phone.includes(q)              ||
        c.property.toLowerCase().includes(q)      ||
        c.lastMsg.toLowerCase().includes(q)
      );
    }
    if (statusFilter === "Open")       data = data.filter((c) => c.status === "Open");
    if (statusFilter === "Unassigned") data = data.filter((c) => c.tags.includes("Unassigned"));
    return data;
  }, [conversations, search, statusFilter]);

  const selectedConv = conversations.find((c) => c.id === selected);

  const { data: selectedConversationDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ["conversation", selected],
    queryFn: () => fetchConversationById(selected, { messageLimit: 100 }),
    enabled: Boolean(selected),
    staleTime: 1000 * 30,
  });

  const chatMessages = useMemo(() => {
    const apiMessages = selectedConversationDetail?.messages;
    if (Array.isArray(apiMessages) && apiMessages.length > 0) {
      return apiMessages.map((message, index) => {
        const senderId = getSenderId(message.sender);
        return {
          id: message._id || `msg-${selected}-${index}`,
          sender: senderId && currentUserId && senderId === currentUserId ? "agent" : "customer",
          text: message.content || "",
          time: toRelativeTime(message.createdAt || message.sentAt),
        };
      });
    }
    return selectedConv?.messages ?? [];
  }, [selectedConversationDetail, selectedConv, selected, currentUserId]);

  const sendMessageMutation = useMutation({
    mutationFn: sendConversationMessage,
    onSuccess: async (_, variables) => {
      setReplyText("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = () => {
    const content = replyText.trim();
    if (!content || !selected || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      conversationId: selected,
      content,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MessageSquare size={20} color="#475569" />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Conversations</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={18} color="#64748b" />
            <span style={{ fontSize: 13, color: "#64748b" }}>Demo Role:</span>
            <div style={{ position: "relative" }}>
              <select style={{ appearance: "none", paddingLeft: 9, paddingRight: 24, paddingTop: 5, paddingBottom: 5, border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, fontWeight: 600, color: "#1e293b", background: "#fff", cursor: "pointer", outline: "none" }}>
                <option>Admin</option><option>Agent</option>
              </select>
              <ChevronDown size={11} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Total: {stats.total}</span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 99, background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
            Open: {stats.open}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 99, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
            Pending Agent: {stats.pendingAgent}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 99, background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" }}>
            Unassigned: {stats.unassigned}
          </span>
        </div>
      </div>

      {/* ── Split Panel ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", margin: "0 24px 24px", gap: 0, borderRadius: 14, border: "1px solid #e2e8f0", background: "#fff" }}>

        {/* Left — Conversation List */}
        <div style={{ width: 320, flexShrink: 0, borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Search */}
          <div style={{ padding: "12px 12px 8px" }}>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                style={{ width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: "#334155", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Filters */}
          <div style={{ padding: "0 12px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { value: statusFilter, set: setStatusFilter, label: "All Status", opts: ["Open","Unassigned"] },
              { label: "All", opts: ["Inquiry","Tour","Message"] },
              { label: "All Agents", opts: ["Agent Alice","Agent Bob","Agent Chipo"] },
            ].map(({ value, set, label, opts }, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <select
                  value={value ?? ""}
                  onChange={(e) => set && set(e.target.value)}
                  style={{ appearance: "none", width: "100%", paddingLeft: 10, paddingRight: 26, paddingTop: 7, paddingBottom: 7, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#475569", background: "#fff", cursor: "pointer", outline: "none", boxSizing: "border-box" }}
                >
                  <option value="">{label}</option>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              </div>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ padding: 16, borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ height: 12, background: "#f1f5f9", borderRadius: 6, marginBottom: 8, width: "60%" }} />
                  <div style={{ height: 10, background: "#f1f5f9", borderRadius: 6, width: "80%" }} />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No conversations found</div>
            ) : (
              filtered.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  active={selected === conv.id}
                  onClick={() => setSelected(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right — Detail / Empty state */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fafafa" }}>
          {!selectedConv ? (
            // Empty state matching screenshot
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#94a3b8" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Select a conversation to view details</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#fff", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{selectedConv.customer.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{selectedConv.customer.phone} · {selectedConv.property}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {selectedConv.tags.map((t) => <Tag key={t} label={t} />)}
                    <Tag label="Open" />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {isDetailLoading ? (
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Loading messages...</p>
                ) : (
                  chatMessages.map((msg) => (
                    <ChatBubble key={msg.id} msg={msg} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0 }}>
                {sendMessageMutation.isError ? (
                  <p style={{ margin: "0 0 8px", color: "#dc2626", fontSize: 12 }}>
                    {sendMessageMutation.error?.response?.data?.message || "Unable to send message."}
                  </p>
                ) : null}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type a message..."
                    rows={2}
                    style={{ flex: 1, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", resize: "none", outline: "none", fontFamily: "inherit" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!replyText.trim() || sendMessageMutation.isPending}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: sendMessageMutation.isPending ? "#94a3b8" : "#1e3a5f",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: !replyText.trim() || sendMessageMutation.isPending ? "not-allowed" : "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Send size={16} color="#fff" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
