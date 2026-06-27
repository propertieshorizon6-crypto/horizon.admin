// 📁 src/features/admin/pages/ConversationsPage.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare, Search, Send, X, ChevronDown,
  Archive, XCircle, CheckCircle, AlertCircle,
} from "lucide-react";
import {
  sendMessage,
  closeThread,
  closeConversation,
  archiveConversation,
  unarchiveConversation,
} from "../api/conversationsApi";
import { useAuthStore } from "../../../store/useAuthStore";
import useChatPolling from "../hooks/useChatPolling";

// ── Brand color ───────────────────────────────────────────────────────────────
const NAVY = "#2D368E";
const EMPTY = [];

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:   { bg: "#dcfce7", color: "#15803d", label: "Active"   },
    closed:   { bg: "#f1f5f9", color: "#475569", label: "Closed"   },
    archived: { bg: "#fef9c3", color: "#a16207", label: "Archived" },
  };
  const s = map[status?.toLowerCase()] ?? map.active;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ── Thread status badge ───────────────────────────────────────────────────────
function ThreadBadge({ status }) {
  const active = status === "active";
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: active ? "#dbeafe" : "#f1f5f9", color: active ? "#1d4ed8" : "#64748b" }}>
      {active ? "Open" : "Closed"}
    </span>
  );
}

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ name = "", size = 36, bg = "#e2e8f0", color = "#475569" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, padding: "11px 16px", borderRadius: 10, background: toast.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`, color: toast.type === "error" ? "#b91c1c" : "#166534", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 8, fontFamily: "system-ui,sans-serif" }}>
      {toast.type === "error" ? <AlertCircle size={14}/> : <CheckCircle size={14}/>}
      {toast.message}
    </div>
  );
}

// ── Chat message bubble ───────────────────────────────────────────────────────
function MessageBubble({ msg, currentUserId }) {
  const isSystem = msg.type === "system";
  const isMine   = msg.senderId && currentUserId && msg.senderId === currentUserId;
  const isAdmin  = ["admin", "manager"].includes(msg.senderRole);

  if (isSystem) {
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
        <span style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", padding: "4px 14px", borderRadius: 99, fontStyle: "italic" }}>
          {msg.content}
        </span>
      </div>
    );
  }

  const side = isMine || isAdmin ? "right" : "left";

  return (
    <div style={{ display: "flex", justifyContent: side === "right" ? "flex-end" : "flex-start", marginBottom: 14, gap: 8, alignItems: "flex-end" }}>
      {side === "left" && <Avatar name={msg.senderName || "?"} size={28} />}
      <div style={{ maxWidth: "68%" }}>
        {side === "left" && (
          <p style={{ margin: "0 0 3px", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
            {msg.senderName || "Customer"}
          </p>
        )}
        <div style={{
          padding: "10px 14px", borderRadius: side === "right" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: side === "right" ? NAVY : "#f1f5f9",
          color: side === "right" ? "#fff" : "#000000",
          fontSize: 13, lineHeight: 1.55,
        }}>
          {msg.content}
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 10, color: "#94a3b8", textAlign: side === "right" ? "right" : "left" }}>
          {msg.time}
        </p>
      </div>
      {side === "right" && <Avatar name={msg.senderName || "Me"} size={28} bg={NAVY} color="#fff" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ConversationsPage() {
  const queryClient   = useQueryClient();
  const user          = useAuthStore((s) => s.user);
  const currentUserId = user?._id || user?.id || null;

  const [search,          setSearch]          = useState("");
  const [searchQuery,     setSearchQuery]     = useState(""); // debounced → server
  const [statusFilter,    setStatusFilter]    = useState("");
  const [selectedConvId,  setSelectedConvId]  = useState(null);
  const [selectedThreadId,setSelectedThreadId]= useState(null);
  const [replyText,       setReplyText]       = useState("");
  const [toast,           setToast]           = useState(null);
  const bottomRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search before it hits the server.
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Polling (messages every 5 s, threads every 15 s, convs every 30 s) ──
  const {
    convsData,
    isConvsLoading,
    threads,
    isThreadsLoading,
    messages,
    isMsgsLoading,
  } = useChatPolling({
    conversationId: selectedConvId,
    threadId:       selectedThreadId,
    statusFilter,
    search:         searchQuery,
  });

  const conversations = convsData?.conversations ?? EMPTY;

  // ── Auto scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Reset thread + reply when the conversation changes. Done during render with
  // a previous-value guard (React's "adjust state when a prop/state changes"
  // pattern) instead of an effect, which avoids set-state-in-effect.
  const [prevConvId, setPrevConvId] = useState(selectedConvId);
  if (selectedConvId !== prevConvId) {
    setPrevConvId(selectedConvId);
    setSelectedThreadId(null);
    setReplyText("");
  }

  // Auto-select the first thread once threads load and none is chosen.
  if (threads.length > 0 && !selectedThreadId) {
    setSelectedThreadId(threads[0].id);
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  // Search + status are filtered server-side; we only re-order here so archived
  // conversations sink to the bottom when no status filter is active.
  const sortedConvs = useMemo(() => {
    if (statusFilter !== "") return conversations;
    const archived = conversations.filter((c) => c.status === "archived");
    const others   = conversations.filter((c) => c.status !== "archived");
    return [...archived, ...others];
  }, [conversations, statusFilter]);

  const selectedConv   = conversations.find((c) => c.id === selectedConvId);
  const selectedThread = threads.find((t)  => t.id === selectedThreadId);

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: () => sendMessage(selectedConvId, selectedThreadId, replyText.trim()),
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConvId, selectedThreadId] });
      queryClient.invalidateQueries({ queryKey: ["threads", selectedConvId] });
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not send message"),
  });

  // ── Close thread ─────────────────────────────────────────────────────────
  const closeThreadMutation = useMutation({
    mutationFn: () => closeThread(selectedConvId, selectedThreadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads", selectedConvId] });
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConvId, selectedThreadId] });
      showToast("success", "Thread closed");
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not close thread"),
  });

  // ── Close conversation ───────────────────────────────────────────────────
  const closeConvMutation = useMutation({
    mutationFn: () => closeConversation(selectedConvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      showToast("success", "Conversation closed");
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not close conversation"),
  });

  // ── Archive conversation ─────────────────────────────────────────────────
  const archiveMutation = useMutation({
    mutationFn: () => archiveConversation(selectedConvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConvId(null);
      showToast("success", "Conversation archived");
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not archive conversation"),
  });

  // ── Unarchive conversation ───────────────────────────────────────────────
  const unarchiveMutation = useMutation({
    mutationFn: () => unarchiveConversation(selectedConvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      showToast("success", "Conversation unarchived");
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not unarchive conversation"),
  });

  const handleSend = () => {
    if (!replyText.trim() || !selectedConvId || !selectedThreadId) return;
    if (selectedThread?.status === "closed") {
      showToast("error", "This thread is closed — cannot send messages");
      return;
    }
    sendMutation.mutate();
  };

  const stats = useMemo(() => ({
    total:    conversations.length,
    active:   conversations.filter((c) => c.status === "active").length,
    closed:   conversations.filter((c) => c.status === "closed").length,
    archived: conversations.filter((c) => c.status === "archived").length,
  }), [conversations]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      <Toast toast={toast} />

      {/* ── Header ── */}
      <div style={{ padding: "18px 24px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MessageSquare size={20} color="#475569" />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#000000" }}>Conversations</h1>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: `Total: ${stats.total}`,       bg: "#f1f5f9", color: "#475569" },
              { label: `Active: ${stats.active}`,     bg: "#dcfce7", color: "#15803d" },
              { label: `Closed: ${stats.closed}`,     bg: "#f1f5f9", color: "#64748b" },
              { label: `Archived: ${stats.archived}`, bg: "#fef9c3", color: "#a16207" },
            ].map(({ label, bg, color }) => (
              <span key={label} style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: bg, color }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3-panel layout ── */}
      <div className="flex flex-col md:flex-row" style={{ flex: 1, overflow: "hidden", margin: "0 24px 24px", gap: 0, borderRadius: 14, border: "1px solid #e2e8f0", background: "#fff" }}>

        {/* ── Panel 1: Conversation list ── */}
        <div className="w-full max-h-[45vh] md:max-h-none md:w-70 md:shrink-0" style={{ borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Search + filter */}
          <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid #f8fafc" }}>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                style={{ width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#000000", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ position: "relative" }}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                style={{ appearance: "none", width: "100%", paddingLeft: 10, paddingRight: 26, paddingTop: 7, paddingBottom: 7, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#475569", background: "#fff", cursor: "pointer", outline: "none", boxSizing: "border-box" }}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {isConvsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} style={{ padding: 16, borderBottom: "1px solid #f8fafc" }}>
                  <div style={{ height: 12, background: "#f1f5f9", borderRadius: 6, marginBottom: 8, width: "60%" }} />
                  <div style={{ height: 10, background: "#f1f5f9", borderRadius: 6, width: "80%" }} />
                </div>
              ))
            ) : sortedConvs.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>No conversations found</div>
            ) : (
              sortedConvs.map((conv) => {
                const active = selectedConvId === conv.id;
                return (
                  <React.Fragment key={conv.id}>
                    <div onClick={() => setSelectedConvId(conv.id)}
                      style={{ padding: "12px 14px", borderBottom: "1px solid #f8fafc", background: active ? "#f0f9ff" : "#fff", cursor: "pointer", borderLeft: `3px solid ${active ? NAVY : "transparent"}`, transition: "all 0.1s" }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#fff"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={conv.clientName} size={36} bg={active ? NAVY : "#e2e8f0"} color={active ? "#fff" : "#475569"} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#000000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.clientName}</span>
                            <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0, marginLeft: 4 }}>{conv.time}</span>
                          </div>
                          {conv.clientEmail && (
                            <p style={{ margin: "2px 0 4px", fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.clientEmail}</p>
                          )}
                          <StatusBadge status={conv.status} />
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* ── Panel 2: Thread list ── */}
        <div className="hidden md:flex md:w-60 md:shrink-0" style={{ borderRight: "1px solid #f1f5f9", flexDirection: "column", overflow: "hidden", background: "#fafafa" }}>
          {!selectedConv ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: 12, padding: 16, textAlign: "center" }}>
              Select a conversation to see threads
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#000000" }}>{selectedConv.clientName}</span>
                  <StatusBadge status={selectedConv.status} />
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  {selectedConv.status === "active" && (
                    <>
                      <button type="button" onClick={() => closeConvMutation.mutate()} disabled={closeConvMutation.isPending}
                        title="Close conversation"
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "5px 8px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        <XCircle size={12} /> Close
                      </button>
                      <button type="button" onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending}
                        title="Archive conversation"
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "5px 8px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        <Archive size={12} /> Archive
                      </button>
                    </>
                  )}
                  {selectedConv.status === "archived" && (
                    <button type="button" onClick={() => unarchiveMutation.mutate()} disabled={unarchiveMutation.isPending}
                      title="Unarchive conversation"
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "5px 8px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      <Archive size={12} /> Unarchive
                    </button>
                  )}
                </div>
              </div>

              {/* Thread list */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                <p style={{ margin: 0, padding: "10px 14px 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Threads ({threads.length})
                </p>
                {isThreadsLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ height: 11, background: "#f1f5f9", borderRadius: 5, marginBottom: 6, width: "70%" }} />
                      <div style={{ height: 9, background: "#f1f5f9", borderRadius: 5, width: "50%" }} />
                    </div>
                  ))
                ) : threads.length === 0 ? (
                  <div style={{ padding: "24px 14px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>No threads yet</div>
                ) : (
                  threads.map((thread) => {
                    const active = selectedThreadId === thread.id;
                    return (
                      <div key={thread.id} onClick={() => setSelectedThreadId(thread.id)}
                        style={{ padding: "11px 14px", borderBottom: "1px solid #f1f5f9", background: active ? "#eff6ff" : "transparent", cursor: "pointer", borderLeft: `3px solid ${active ? NAVY : "transparent"}`, transition: "all 0.1s" }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f1f5f9"; }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#000000", lineHeight: 1.4, flex: 1 }}>{thread.subject}</span>
                          <ThreadBadge status={thread.status} />
                        </div>
                        {thread.property && (
                          <p style={{ margin: "0 0 4px", fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            🏠 {thread.property}
                          </p>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>{thread.messageCount} messages</span>
                          {thread.unreadCount > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#dc2626", color: "#fff" }}>{thread.unreadCount}</span>
                          )}
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>{thread.time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Panel 3: Messages ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selectedThread ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#94a3b8" }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Select a thread to view messages</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", background: "#fff", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#000000" }}>{selectedThread.subject}</span>
                      <ThreadBadge status={selectedThread.status} />
                    </div>
                    {selectedThread.property && (
                      <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>🏠 {selectedThread.property}</p>
                    )}
                  </div>
                  {/* Close thread button */}
                  {selectedThread.status === "active" && (
                    <button type="button" onClick={() => closeThreadMutation.mutate()} disabled={closeThreadMutation.isPending}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <X size={13} /> Close Thread
                    </button>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {isMsgsLoading ? (
                  <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, paddingTop: 32 }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, paddingTop: 48 }}>
                    <MessageSquare size={36} color="#cbd5e1" style={{ marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0 }}>
                {selectedThread.status === "closed" ? (
                  <div style={{ padding: "10px 14px", borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                    This thread is closed — no new messages can be sent
                  </div>
                ) : (
                  <>
                    {sendMutation.isError && (
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#dc2626" }}>
                        {sendMutation.error?.response?.data?.message || "Unable to send message"}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                        rows={2}
                        style={{ flex: 1, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#000000", resize: "none", outline: "none", fontFamily: "inherit" }}
                      />
                      <button onClick={handleSend} disabled={!replyText.trim() || sendMutation.isPending}
                        style={{ width: 42, height: 42, borderRadius: 11, background: !replyText.trim() || sendMutation.isPending ? "#94a3b8" : NAVY, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: !replyText.trim() || sendMutation.isPending ? "not-allowed" : "pointer", flexShrink: 0, transition: "background 0.15s" }}>
                        <Send size={16} color="#fff" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}