// 📁 src/features/admin/pages/NotificationsPage.jsx

import { useState, useMemo } from "react";
import { Check, Search, ChevronDown, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: "New Lead Contact",           desc: "Ravi K. initiated contact for Modern 2BR Apartment",   date: "Jan 29, 15:51", channel: "bell",  type: "Lead",    read: false },
  { id: 2, title: "Export Ready",               desc: "Your leads data export is ready for download",          date: "Jan 27, 16:35", channel: "bell",  type: "System",  read: true  },
  { id: 3, title: "SLA Alert: Inquiry Overdue", desc: "Inquiry inq_3003 is past SLA deadline",                date: "Jan 29, 13:30", channel: "email", type: "SLA",     read: false },
  { id: 4, title: "Daily Summary",              desc: "5 new leads, 3 tours scheduled, 2 inquiries resolved",  date: "Jan 29, 11:30", channel: "email", type: "Summary", read: false },
  { id: 5, title: "Customer Call Initiated",    desc: "Brian L. initiated a call for Modern 2BR Apartment",    date: "Jan 28, 11:31", channel: "bell",  type: "Lead",    read: false },
];

const RULES = [
  { id: "r1", name: "Notify Admin on Lead Contact", trigger: "lead contact initiated", recipients: ["Admin"],            channels: ["bell","email"], enabled: true },
  { id: "r2", name: "Tour Reminder 1 Hour Before",  trigger: "tour reminder",          recipients: ["Agent"],            channels: ["push","bell"],  enabled: true },
  { id: "r3", name: "SLA Overdue Alert",            trigger: "inquiry overdue",        recipients: ["Admin","Manager"],  channels: ["email"],        enabled: true },
];

const DELIVERY_LOGS = [
  { id: "l1", timestamp: "Jan 29, 13:30", notifId: "n_006", channel: "email", recipient: "admin@horizon.com",   status: "sent",   error: null },
  { id: "l2", timestamp: "Jan 29, 15:30", notifId: "n_007", channel: "push",  recipient: "device_agent2_ios",   status: "sent",   error: null },
  { id: "l3", timestamp: "Jan 29, 11:30", notifId: "n_008", channel: "email", recipient: "admin@horizon.com",   status: "failed", error: "SMTP connection timeout" },
  { id: "l4", timestamp: "Jan 26, 14:30", notifId: "n_009", channel: "email", recipient: "manager@horizon.com", status: "sent",   error: null },
];

const BellSVG  = ({ color = "#94a3b8", size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const EmailSVG = ({ color = "#94a3b8", size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const PushSVG  = ({ color = "#94a3b8", size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;

function ChannelIcon({ channel }) {
  if (channel === "email") return <EmailSVG />;
  if (channel === "push")  return <PushSVG />;
  return <BellSVG />;
}

function Toggle({ enabled, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 36, height: 20, borderRadius: 99, background: enabled ? "#22c55e" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: enabled ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

const TABS = [
  { id: "center", label: "Notification Center", icon: <BellSVG /> },
  { id: "rules",  label: "Rules",               icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
  { id: "logs",   label: "Delivery Logs",        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> },
];

export default function NotificationsPage() {
  const [activeTab,     setActiveTab]     = useState("center");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [rules,         setRules]         = useState(RULES);
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState("");
  const [chanFilter,    setChanFilter]    = useState("");
  const [readFilter,    setReadFilter]    = useState("");
  const [logStatus,     setLogStatus]     = useState("");
  const [logChan,       setLogChan]       = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markRead    = (id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()   => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const toggleRule  = (id) => setRules((p) => p.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const filteredNotifs = useMemo(() => {
    let data = notifications;
    if (typeFilter) data = data.filter((n) => n.type === typeFilter);
    if (chanFilter) data = data.filter((n) => n.channel === chanFilter);
    if (readFilter === "Unread") data = data.filter((n) => !n.read);
    if (readFilter === "Read")   data = data.filter((n) => n.read);
    if (search) { const q = search.toLowerCase(); data = data.filter((n) => n.title.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q)); }
    return data;
  }, [notifications, typeFilter, chanFilter, readFilter, search]);

  const filteredLogs = useMemo(() => {
    let data = DELIVERY_LOGS;
    if (logStatus) data = data.filter((l) => l.status === logStatus);
    if (logChan)   data = data.filter((l) => l.channel === logChan);
    return data;
  }, [logStatus, logChan]);

  const thStyle = { padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" };

  return (
    <div style={{ minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Notifications</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage your notifications and delivery settings</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button style={{ fontSize: 13, fontWeight: 600, color: "#475569", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Simulate Contact Initiated</button>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#64748b" }}>
            <span>Demo Role:</span>
            <div style={{ position: "relative" }}>
              <select style={{ appearance: "none", paddingLeft: 9, paddingRight: 24, paddingTop: 5, paddingBottom: 5, border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, fontWeight: 600, color: "#1e293b", background: "#fff", cursor: "pointer", outline: "none" }}>
                <option>Admin</option><option>Agent</option>
              </select>
              <ChevronDown size={11} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "16px 28px 0", display: "flex", borderBottom: "1px solid #e2e8f0" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "none", border: "none", fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#0f172a" : "#64748b", cursor: "pointer", borderBottom: isActive ? "2px solid #0f172a" : "2px solid transparent", marginBottom: -1, transition: "all 0.15s" }}>
              {tab.icon}{tab.label}
              {tab.id === "center" && unreadCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#ef4444", color: "#fff" }}>{unreadCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "20px 28px" }}>

        {/* ── NOTIFICATION CENTER ── */}
        {activeTab === "center" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Your Notifications</h2>
              <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                <Check size={13} /> Mark all read
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, padding: "14px 20px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications..." style={{ width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: "#334155", outline: "none", boxSizing: "border-box" }} />
              </div>
              {[
                { value: typeFilter, set: setTypeFilter, label: "All Types",    opts: ["Lead","SLA","Summary","System"] },
                { value: chanFilter, set: setChanFilter, label: "All Channels", opts: ["bell","email"] },
                { value: readFilter, set: setReadFilter, label: "All",          opts: ["Unread","Read"] },
              ].map(({ value, set, label, opts }) => (
                <div key={label} style={{ position: "relative" }}>
                  <select value={value} onChange={(e) => set(e.target.value)} style={{ appearance: "none", paddingLeft: 12, paddingRight: 28, paddingTop: 8, paddingBottom: 8, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: "#64748b", background: "#fff", cursor: "pointer", outline: "none", minWidth: 130 }}>
                    <option value="">{label}</option>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              ))}
            </div>
            <div>
              {filteredNotifs.map((n, idx) => (
                <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", background: n.read ? "#fff" : "#fef9ee", borderBottom: idx < filteredNotifs.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: n.read ? "#f8fafc" : "#fef3c7", border: `1px solid ${n.read ? "#e2e8f0" : "#fde68a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BellSVG color={n.read ? "#94a3b8" : "#92400e"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{n.title}</span>
                      <ChannelIcon channel={n.channel} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{n.desc}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{n.date}</p>
                  </div>
                  <button onClick={() => markRead(n.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: n.read ? "#cbd5e1" : "#64748b" }}>
                    <Check size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RULES ── */}
        {activeTab === "rules" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px 16px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Notification Rules</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Configure when and how notifications are sent</p>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#fff", background: "#1e293b", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer" }}>
                <Plus size={15} /> Add Rule
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
                  {["Name","Trigger Event","Recipients","Channels","Status","Actions"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, idx) => (
                  <tr key={rule.id} style={{ borderBottom: idx < rules.length - 1 ? "1px solid #f8fafc" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{rule.name}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ fontSize: 12, color: "#475569", background: "#f1f5f9", padding: "3px 10px", borderRadius: 7, border: "1px solid #e2e8f0" }}>{rule.trigger}</span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {rule.recipients.map((r) => (
                          <span key={r} style={{ fontSize: 12, color: "#475569", background: "#f1f5f9", padding: "3px 10px", borderRadius: 7, border: "1px solid #e2e8f0" }}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {rule.channels.map((c) => <span key={c}><ChannelIcon channel={c} /></span>)}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <Toggle enabled={rule.enabled} onChange={() => toggleRule(rule.id)} />
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4, borderRadius: 6, display: "flex" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        ><Pencil size={15} /></button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 6, display: "flex" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        ><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── DELIVERY LOGS ── */}
        {activeTab === "logs" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 16px" }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Delivery Logs</h2>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Track notification delivery status</p>
            </div>
            <div style={{ display: "flex", gap: 12, padding: "0 24px 16px" }}>
              {[
                { value: logStatus, set: setLogStatus, label: "All Statuses", opts: ["sent","failed"] },
                { value: logChan,   set: setLogChan,   label: "All Channels", opts: ["email","push","bell"] },
              ].map(({ value, set, label, opts }) => (
                <div key={label} style={{ position: "relative", flex: 1 }}>
                  <select value={value} onChange={(e) => set(e.target.value)} style={{ appearance: "none", width: "100%", paddingLeft: 12, paddingRight: 28, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#64748b", background: "#f8fafc", cursor: "pointer", outline: "none", boxSizing: "border-box" }}>
                    <option value="">{label}</option>
                    {opts.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                  <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              ))}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
                  {["Timestamp","Notification ID","Channel","Recipient","Status","Actions"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id} style={{ borderBottom: idx < filteredLogs.length - 1 ? "1px solid #f8fafc" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{log.timestamp}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "monospace", color: "#475569" }}>{log.notifId}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
                        <ChannelIcon channel={log.channel} />
                        {log.channel.charAt(0).toUpperCase() + log.channel.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{log.recipient}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 99, background: log.status === "sent" ? "#1e293b" : "#ef4444", color: "#fff", display: "inline-block" }}>
                        {log.status}
                      </span>
                      {log.error && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#ef4444" }}>{log.error}</p>}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {log.status === "failed" && (
                        <button style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                        >
                          <RefreshCw size={12} /> Resend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}