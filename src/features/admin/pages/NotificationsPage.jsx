import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import {
  createTestNotification,
  deleteNotificationRule,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  resendDeliveryLogEmail,
  updateNotificationRule,
} from "../api/notificationsApi";
import useDeliveryLogs from "../hooks/useDeliveryLogs";
import useNotificationRules from "../hooks/useNotificationRules";
import useNotifications from "../hooks/useNotifications";

const BellSVG = ({ color = "#64748b", size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const EmailSVG = ({ color = "#64748b", size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PushSVG = ({ color = "#64748b", size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const TABS = [
  { id: "center", label: "Notification Center" },
  { id: "rules", label: "Rules" },
  { id: "logs", label: "Delivery Logs" },
];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

function ChannelIcon({ channel }) {
  if (channel === "email") return <EmailSVG />;
  if (channel === "push") return <PushSVG />;
  return <BellSVG />;
}

function Toggle({ enabled, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 36,
        height: 20,
        border: "none",
        borderRadius: 99,
        background: enabled ? "#22c55e" : "#e2e8f0",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 3,
          left: enabled ? 19 : 3,
          transition: "left .15s",
        }}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const invalidateNotificationQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] }),
    ]);
  };

  const [activeTab, setActiveTab] = useState("center");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [chanFilter, setChanFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [logStatus, setLogStatus] = useState("");
  const [logChan, setLogChan] = useState("");

  const notificationParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const rulesParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const deliveryLogParams = useMemo(() => {
    const params = { page: 1, limit: 100 };
    if (logStatus) params.status = logStatus;
    if (logChan) params.channel = logChan === "bell" ? "in_app" : logChan;
    return params;
  }, [logStatus, logChan]);

  const {
    data: notificationsResult,
    isLoading: isNotificationsLoading,
    error: notificationsError,
  } = useNotifications(notificationParams);

  const {
    data: rulesResult,
    isLoading: isRulesLoading,
    error: rulesError,
  } = useNotificationRules(rulesParams);

  const {
    data: logsResult,
    isLoading: isLogsLoading,
    error: logsError,
  } = useDeliveryLogs(deliveryLogParams);

  const notifications = useMemo(
    () => notificationsResult?.notifications ?? [],
    [notificationsResult],
  );
  const rules = useMemo(() => rulesResult?.rules ?? [], [rulesResult]);
  const logs = useMemo(() => logsResult?.logs ?? [], [logsResult]);

  const unreadCount =
    notificationsResult?.unreadCount ??
    notifications.filter((notification) => !notification.read).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: invalidateNotificationQueries,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: invalidateNotificationQueries,
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, enabled }) => updateNotificationRule(id, { isActive: !enabled }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-rules"] });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deleteNotificationRule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-rules"] });
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendDeliveryLogEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["delivery-logs"] });
    },
  });

  const createTestNotificationMutation = useMutation({
    mutationFn: createTestNotification,
    onSuccess: invalidateNotificationQueries,
  });

  const typeOptions = useMemo(
    () => [...new Set(notifications.map((item) => item.type).filter(Boolean))].sort(),
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    let data = notifications;

    if (typeFilter) data = data.filter((item) => item.type === typeFilter);
    if (chanFilter) data = data.filter((item) => item.channel === chanFilter);
    if (readFilter === "Unread") data = data.filter((item) => !item.read);
    if (readFilter === "Read") data = data.filter((item) => item.read);

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q),
      );
    }

    return data;
  }, [notifications, typeFilter, chanFilter, readFilter, search]);

  const filteredLogs = useMemo(() => {
    let data = logs;
    if (logStatus) data = data.filter((item) => item.status === logStatus);
    if (logChan) data = data.filter((item) => item.channel === logChan);
    return data;
  }, [logs, logStatus, logChan]);

  const handleMarkRead = (id, isRead) => {
    if (isRead || markReadMutation.isPending) return;
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0 || markAllReadMutation.isPending) return;
    markAllReadMutation.mutate();
  };

  const handleToggleRule = (id, enabled) => {
    if (updateRuleMutation.isPending) return;
    updateRuleMutation.mutate({ id, enabled });
  };

  const handleDeleteRule = (id) => {
    if (deleteRuleMutation.isPending) return;
    if (!window.confirm("Delete this notification rule?")) return;
    deleteRuleMutation.mutate(id);
  };

  const handleResend = (id) => {
    if (resendMutation.isPending) return;
    resendMutation.mutate(id);
  };

  const handleSimulateNotification = () => {
    if (createTestNotificationMutation.isPending) return;

    createTestNotificationMutation.mutate({
      title: "Manual Test Notification",
      message: `Created at ${new Date().toLocaleString()}`,
      type: "system_alert",
      priority: "normal",
    });
  };

  return (
    <div style={{ padding: 24, minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Notifications</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Manage your notifications and delivery settings</p>
        </div>
        <button
          type="button"
          onClick={handleSimulateNotification}
          style={{
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#334155",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: createTestNotificationMutation.isPending ? "not-allowed" : "pointer",
            opacity: createTestNotificationMutation.isPending ? 0.65 : 1,
          }}
          disabled={createTestNotificationMutation.isPending}
        >
          {createTestNotificationMutation.isPending
            ? "Creating..."
            : "Simulate Contact Initiated"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: active ? "1px solid #0f172a" : "1px solid #e2e8f0",
                background: active ? "#0f172a" : "#fff",
                color: active ? "#fff" : "#334155",
                borderRadius: 8,
                padding: "7px 12px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {tab.label}
              {tab.id === "center" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          );
        })}
      </div>

      {createTestNotificationMutation.isError && (
        <p style={{ margin: "0 0 12px", color: "#dc2626", fontSize: 12 }}>
          {getErrorMessage(
            createTestNotificationMutation.error,
            "Unable to create test notification",
          )}
        </p>
      )}

      {activeTab === "center" && (
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottom: "1px solid #f1f5f9" }}>
            <strong style={{ fontSize: 14, color: "#0f172a" }}>Your Notifications</strong>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              style={{
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#475569",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 12,
                cursor: unreadCount === 0 || markAllReadMutation.isPending ? "not-allowed" : "pointer",
              }}
            >
              Mark all read
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, padding: 14, borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={13} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications..."
                style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px 8px 28px", fontSize: 12 }}
              />
            </div>
            {[
              { value: typeFilter, set: setTypeFilter, label: "All Types", opts: typeOptions },
              { value: chanFilter, set: setChanFilter, label: "All Channels", opts: ["bell", "email", "push"] },
              { value: readFilter, set: setReadFilter, label: "All", opts: ["Unread", "Read"] },
            ].map(({ value, set, label, opts }) => (
              <div key={label} style={{ position: "relative" }}>
                <select
                  value={value}
                  onChange={(event) => set(event.target.value)}
                  style={{
                    appearance: "none",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "8px 26px 8px 10px",
                    fontSize: 12,
                    color: "#475569",
                    minWidth: 120,
                    background: "#fff",
                  }}
                >
                  <option value="">{label}</option>
                  {opts.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              </div>
            ))}
          </div>

          {notificationsError && <p style={{ margin: 0, padding: "12px 14px", color: "#dc2626", fontSize: 12 }}>{getErrorMessage(notificationsError, "Unable to load notifications")}</p>}
          {markReadMutation.isError && <p style={{ margin: 0, padding: "0 14px 12px", color: "#dc2626", fontSize: 12 }}>{getErrorMessage(markReadMutation.error, "Unable to mark as read")}</p>}
          {markAllReadMutation.isError && <p style={{ margin: 0, padding: "0 14px 12px", color: "#dc2626", fontSize: 12 }}>{getErrorMessage(markAllReadMutation.error, "Unable to mark all as read")}</p>}

          <div>
            {isNotificationsLoading ? (
              <p style={{ margin: 0, padding: 14, color: "#64748b", fontSize: 13 }}>Loading notifications...</p>
            ) : filteredNotifications.length === 0 ? (
              <p style={{ margin: 0, padding: 14, color: "#64748b", fontSize: 13 }}>No notifications found.</p>
            ) : (
              filteredNotifications.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 14,
                    background: item.read ? "#fff" : "#fffbeb",
                    borderTop: index === 0 ? "none" : "1px solid #f8fafc",
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", display: "grid", placeItems: "center", background: "#f8fafc" }}>
                    <ChannelIcon channel={item.channel} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{item.desc}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8" }}>{item.date || "Unknown time"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMarkRead(item.id, item.read)}
                    disabled={item.read || markReadMutation.isPending}
                    style={{
                      border: "1px solid #e2e8f0",
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      background: "#fff",
                      color: item.read ? "#cbd5e1" : "#475569",
                      cursor: item.read || markReadMutation.isPending ? "not-allowed" : "pointer",
                    }}
                  >
                    <Check size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "rules" && (
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottom: "1px solid #f1f5f9" }}>
            <strong style={{ fontSize: 14, color: "#0f172a" }}>Notification Rules</strong>
            <button
              type="button"
              disabled
              title="Create form not implemented"
              style={{ border: "none", background: "#94a3b8", color: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "not-allowed", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} />
              Add Rule
            </button>
          </div>

          {rulesError && <p style={{ margin: 0, padding: "12px 14px", color: "#dc2626", fontSize: 12 }}>{getErrorMessage(rulesError, "Unable to load rules")}</p>}
          {updateRuleMutation.isError && <p style={{ margin: 0, padding: "0 14px 12px", color: "#dc2626", fontSize: 12 }}>{getErrorMessage(updateRuleMutation.error, "Unable to update rule")}</p>}
          {deleteRuleMutation.isError && <p style={{ margin: 0, padding: "0 14px 12px", color: "#dc2626", fontSize: 12 }}>{getErrorMessage(deleteRuleMutation.error, "Unable to delete rule")}</p>}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderTop: "1px solid #f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["Name", "Trigger", "Recipients", "Channels", "Status", "Actions"].map((head) => (
                  <th key={head} style={{ textAlign: "left", fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", padding: "10px 14px" }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isRulesLoading ? (
                <tr><td colSpan={6} style={{ padding: 14, fontSize: 13, color: "#64748b" }}>Loading rules...</td></tr>
              ) : rules.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 14, fontSize: 13, color: "#64748b" }}>No rules found.</td></tr>
              ) : (
                rules.map((rule, index) => (
                  <tr key={rule.id} style={{ borderTop: index === 0 ? "none" : "1px solid #f8fafc" }}>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{rule.name}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>{rule.trigger}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>{rule.recipients.join(", ")}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {rule.channels.map((channel) => (
                          <span key={channel}><ChannelIcon channel={channel} /></span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Toggle
                        enabled={rule.enabled}
                        disabled={updateRuleMutation.isPending}
                        onClick={() => handleToggleRule(rule.id, rule.enabled)}
                      />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        disabled={deleteRuleMutation.isPending}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#ef4444",
                          cursor: deleteRuleMutation.isPending ? "not-allowed" : "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "logs" && (
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
          <div style={{ padding: 14, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 14, color: "#0f172a" }}>Delivery Logs</strong>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: logStatus, set: setLogStatus, label: "All Statuses", opts: ["pending", "sent", "delivered", "failed", "bounced"] },
                { value: logChan, set: setLogChan, label: "All Channels", opts: ["email", "push", "bell"] },
              ].map(({ value, set, label, opts }) => (
                <div key={label} style={{ position: "relative" }}>
                  <select
                    value={value}
                    onChange={(event) => set(event.target.value)}
                    style={{ appearance: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 24px 7px 10px", fontSize: 12, minWidth: 120, background: "#fff", color: "#475569" }}
                  >
                    <option value="">{label}</option>
                    {opts.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              ))}
            </div>
          </div>

          {logsError && <p style={{ margin: 0, padding: "12px 14px", color: "#dc2626", fontSize: 12 }}>{getErrorMessage(logsError, "Unable to load logs")}</p>}
          {resendMutation.isError && <p style={{ margin: 0, padding: "0 14px 12px", color: "#dc2626", fontSize: 12 }}>{getErrorMessage(resendMutation.error, "Unable to resend")}</p>}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderTop: "1px solid #f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["Timestamp", "Notification", "Channel", "Recipient", "Status", "Actions"].map((head) => (
                  <th key={head} style={{ textAlign: "left", fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", padding: "10px 14px" }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLogsLoading ? (
                <tr><td colSpan={6} style={{ padding: 14, fontSize: 13, color: "#64748b" }}>Loading logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 14, fontSize: 13, color: "#64748b" }}>No logs found.</td></tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const canResend = log.status === "failed" && log.rawChannel === "email";
                  return (
                    <tr key={log.id} style={{ borderTop: index === 0 ? "none" : "1px solid #f8fafc" }}>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>{log.timestamp || "-"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569", fontFamily: "monospace" }}>{log.notifId || "-"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569", display: "flex", gap: 6, alignItems: "center" }}><ChannelIcon channel={log.channel} />{log.channel}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>{log.recipient}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: log.status === "failed" ? "#dc2626" : "#475569", fontWeight: 600 }}>{log.status}</td>
                      <td style={{ padding: "12px 14px" }}>
                        {canResend && (
                          <button
                            type="button"
                            onClick={() => handleResend(log.id)}
                            disabled={resendMutation.isPending}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: 8,
                              padding: "6px 10px",
                              fontSize: 12,
                              background: "#fff",
                              color: "#475569",
                              cursor: resendMutation.isPending ? "not-allowed" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <RefreshCw size={12} />
                            Resend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
