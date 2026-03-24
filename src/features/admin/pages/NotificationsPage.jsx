// 📁 src/features/admin/pages/NotificationsPage.jsx

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Plus, RefreshCw, Search, Trash2, AlertTriangle, X, CheckCircle, AlertCircle } from "lucide-react";
import {
  deleteNotificationRule,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  resendDeliveryLogEmail,
  updateNotificationRule,
} from "../api/notificationsApi";
import useDeliveryLogs        from "../hooks/useDeliveryLogs";
import useNotificationRules   from "../hooks/useNotificationRules";
import useNotifications       from "../hooks/useNotifications";

// ── Icons ─────────────────────────────────────────────────────────────────────
const BellSVG  = ({ color="#64748b", size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const EmailSVG = ({ color="#64748b", size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const PushSVG  = ({ color="#64748b", size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;

function ChannelIcon({ channel }) {
  if (channel === "email") return <EmailSVG />;
  if (channel === "push")  return <PushSVG />;
  return <BellSVG />;
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ enabled, disabled, onClick }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      style={{ width:36, height:20, border:"none", borderRadius:99, background:enabled?"#22c55e":"#e2e8f0", position:"relative", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.65:1 }}>
      <span style={{ width:14, height:14, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:enabled?19:3, transition:"left .15s" }} />
    </button>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, padding:"11px 16px", borderRadius:10, background:toast.type==="error"?"#fef2f2":"#f0fdf4", border:`1px solid ${toast.type==="error"?"#fecaca":"#bbf7d0"}`, color:toast.type==="error"?"#b91c1c":"#166534", fontSize:13, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.1)", display:"flex", alignItems:"center", gap:8, fontFamily:"system-ui,sans-serif" }}>
      {toast.type==="error" ? <AlertCircle size={14}/> : <CheckCircle size={14}/>}
      {toast.message}
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteRuleModal({ rule, onConfirm, onCancel, isDeleting }) {
  return (
    <div onClick={isDeleting ? undefined : onCancel}
      style={{ position:"fixed", inset:0, zIndex:4000, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={(e)=>e.stopPropagation()}
        style={{ width:"100%", maxWidth:400, background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", overflow:"hidden", fontFamily:"system-ui,sans-serif" }}>
        <div style={{ padding:"20px 20px 0", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"#fef2f2", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
            <AlertTriangle size={24} color="#dc2626"/>
          </div>
          <h3 style={{ margin:"0 0 6px", fontSize:16, fontWeight:800, color:"#0f172a" }}>Delete Rule?</h3>
          <p style={{ margin:"0 0 6px", fontSize:13, color:"#64748b" }}>Are you sure you want to delete</p>
          <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:700, color:"#0f172a", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"5px 14px" }}>
            {rule?.name}
          </p>
          <p style={{ margin:"0 0 4px", fontSize:12, color:"#94a3b8" }}>This action <strong style={{ color:"#dc2626" }}>cannot be undone</strong>.</p>
        </div>
        <div style={{ padding:20, display:"flex", gap:10 }}>
          <button type="button" onClick={onCancel} disabled={isDeleting}
            style={{ flex:1, padding:"10px", borderRadius:9, border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isDeleting}
            style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:700, cursor:isDeleting?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <Trash2 size={13}/> {isDeleting?"Deleting...":"Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "center", label: "Notification Center" },
  { id: "rules",  label: "Rules"               },
  { id: "logs",   label: "Delivery Logs"       },
];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const [activeTab,    setActiveTab]    = useState("center");
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [chanFilter,   setChanFilter]   = useState("");
  const [readFilter,   setReadFilter]   = useState("");
  const [logStatus,    setLogStatus]    = useState("");
  const [logChan,      setLogChan]      = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // rule to delete
  const [toast,        setToast]        = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const invalidateNotifs = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] }),
    ]);
  };

  // ── Params ──────────────────────────────────────────────────────────────
  const notifParams   = useMemo(() => ({ page:1, limit:100 }), []);
  const rulesParams   = useMemo(() => ({ page:1, limit:100 }), []);
  const logsParams    = useMemo(() => {
    const p = { page:1, limit:100 };
    if (logStatus) p.status  = logStatus;
    if (logChan)   p.channel = logChan === "bell" ? "in_app" : logChan;
    return p;
  }, [logStatus, logChan]);

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: notifsResult,  isLoading: isNotifsLoading,  error: notifsError  } = useNotifications(notifParams);
  const { data: rulesResult,   isLoading: isRulesLoading,   error: rulesError   } = useNotificationRules(rulesParams);
  const { data: logsResult,    isLoading: isLogsLoading,    error: logsError    } = useDeliveryLogs(logsParams);

  const notifications = useMemo(() => notifsResult?.notifications ?? [], [notifsResult]);
  const rules         = useMemo(() => rulesResult?.rules ?? [],           [rulesResult]);
  const logs          = useMemo(() => logsResult?.logs  ?? [],            [logsResult]);
  const unreadCount   = notifsResult?.unreadCount ?? notifications.filter((n) => !n.read).length;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: invalidateNotifs,
    onError: (e) => showToast("error", getErrorMessage(e, "Unable to mark as read")),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: invalidateNotifs,
    onError: (e) => showToast("error", getErrorMessage(e, "Unable to mark all as read")),
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, enabled }) => updateNotificationRule(id, { isActive: !enabled }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-rules"] });
      showToast("success", "Rule updated");
    },
    onError: (e) => showToast("error", getErrorMessage(e, "Unable to update rule")),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deleteNotificationRule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-rules"] });
      setDeleteTarget(null);
      showToast("success", "Rule deleted");
    },
    onError: (e) => {
      setDeleteTarget(null);
      showToast("error", getErrorMessage(e, "Unable to delete rule"));
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendDeliveryLogEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["delivery-logs"] });
      showToast("success", "Email resent");
    },
    onError: (e) => showToast("error", getErrorMessage(e, "Unable to resend")),
  });

  // ── Filtered ──────────────────────────────────────────────────────────────
  const typeOptions = useMemo(
    () => [...new Set(notifications.map((n) => n.type).filter(Boolean))].sort(),
    [notifications],
  );

  const filteredNotifs = useMemo(() => {
    let data = notifications;
    if (typeFilter)       data = data.filter((n) => n.type    === typeFilter);
    if (chanFilter)       data = data.filter((n) => n.channel === chanFilter);
    if (readFilter === "Unread") data = data.filter((n) => !n.read);
    if (readFilter === "Read")   data = data.filter((n) => n.read);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((n) => n.title.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q));
    }
    return data;
  }, [notifications, typeFilter, chanFilter, readFilter, search]);

  const filteredLogs = useMemo(() => {
    let data = logs;
    if (logStatus) data = data.filter((l) => l.status  === logStatus);
    if (logChan)   data = data.filter((l) => l.channel === logChan);
    return data;
  }, [logs, logStatus, logChan]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 min-h-full" style={{ background:"#f8fafc", fontFamily:"system-ui,sans-serif" }}>
      <Toast toast={toast} />

      {/* Delete rule modal */}
      {deleteTarget && (
        <DeleteRuleModal
          rule={deleteTarget}
          isDeleting={deleteRuleMutation.isPending}
          onConfirm={() => deleteRuleMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, color:"#0f172a" }}>Notifications</h1>
          <p style={{ margin:"4px 0 0", fontSize:12, color:"#64748b" }}>Manage your notifications and delivery settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              style={{ border:active?"1px solid #0f172a":"1px solid #e2e8f0", background:active?"#0f172a":"#fff", color:active?"#fff":"#334155", borderRadius:8, padding:"7px 12px", fontSize:13, cursor:"pointer" }}>
              {tab.label}{tab.id==="center" && unreadCount>0 ? ` (${unreadCount})` : ""}
            </button>
          );
        })}
      </div>

      {/* ── Notification Center ── */}
      {activeTab === "center" && (
        <section style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:14, borderBottom:"1px solid #f1f5f9" }}>
            <strong style={{ fontSize:14, color:"#0f172a" }}>Your Notifications</strong>
            <button type="button" onClick={() => { if (unreadCount===0 || markAllReadMutation.isPending) return; markAllReadMutation.mutate(); }}
              disabled={unreadCount===0 || markAllReadMutation.isPending}
              style={{ border:"1px solid #e2e8f0", background:"#f8fafc", color:"#475569", borderRadius:8, padding:"6px 10px", fontSize:12, cursor:unreadCount===0?"not-allowed":"pointer" }}>
              Mark all read
            </button>
          </div>

          {/* Filters */}
          <div style={{ display:"flex", gap:8, padding:14, borderBottom:"1px solid #f1f5f9", flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex:1, minWidth:200 }}>
              <Search size={13} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search notifications..."
                style={{ width:"100%", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 10px 8px 28px", fontSize:12, outline:"none" }} />
            </div>
            {[
              { value:typeFilter, set:setTypeFilter, label:"All Types",    opts:typeOptions },
              { value:chanFilter, set:setChanFilter, label:"All Channels", opts:["bell","email","push"] },
              { value:readFilter, set:setReadFilter, label:"All",          opts:["Unread","Read"] },
            ].map(({ value, set, label, opts }) => (
              <div key={label} style={{ position:"relative" }}>
                <select value={value} onChange={(e)=>set(e.target.value)}
                  style={{ appearance:"none", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 26px 8px 10px", fontSize:12, color:"#475569", minWidth:120, background:"#fff" }}>
                  <option value="">{label}</option>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={11} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
              </div>
            ))}
          </div>

          {notifsError && <p style={{ margin:0, padding:"12px 14px", color:"#dc2626", fontSize:12 }}>{getErrorMessage(notifsError, "Unable to load notifications")}</p>}

          <div>
            {isNotifsLoading ? (
              <p style={{ margin:0, padding:14, color:"#64748b", fontSize:13 }}>Loading notifications...</p>
            ) : filteredNotifs.length === 0 ? (
              <p style={{ margin:0, padding:14, color:"#64748b", fontSize:13 }}>No notifications found.</p>
            ) : (
              filteredNotifs.map((item, idx) => (
                <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:14, background:item.read?"#fff":"#fffbeb", borderTop:idx===0?"none":"1px solid #f8fafc" }}>
                  <div style={{ width:34, height:34, borderRadius:8, border:"1px solid #e2e8f0", display:"grid", placeItems:"center", background:"#f8fafc" }}>
                    <ChannelIcon channel={item.channel} />
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#0f172a" }}>{item.title}</p>
                    <p style={{ margin:"2px 0 0", fontSize:12, color:"#64748b" }}>{item.desc}</p>
                    <p style={{ margin:"3px 0 0", fontSize:11, color:"#94a3b8" }}>{item.date || "Unknown time"}</p>
                  </div>
                  <button type="button" onClick={() => { if (!item.read && !markReadMutation.isPending) markReadMutation.mutate(item.id); }}
                    disabled={item.read || markReadMutation.isPending}
                    style={{ border:"1px solid #e2e8f0", width:30, height:30, borderRadius:8, display:"grid", placeItems:"center", background:"#fff", color:item.read?"#cbd5e1":"#475569", cursor:item.read?"not-allowed":"pointer" }}>
                    <Check size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ── Rules ── */}
      {activeTab === "rules" && (
        <section style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:14, borderBottom:"1px solid #f1f5f9" }}>
            <strong style={{ fontSize:14, color:"#0f172a" }}>Notification Rules</strong>
            <button type="button" disabled title="Create form not implemented"
              style={{ border:"none", background:"#94a3b8", color:"#fff", borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"not-allowed", display:"flex", alignItems:"center", gap:6 }}>
              <Plus size={14} /> Add Rule
            </button>
          </div>

          {rulesError && <p style={{ margin:0, padding:"12px 14px", color:"#dc2626", fontSize:12 }}>{getErrorMessage(rulesError, "Unable to load rules")}</p>}

          <div style={{ overflowX: "auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                {["Name","Trigger","Recipients","Channels","Status","Actions"].map((h) => (
                  <th key={h} style={{ textAlign:"left", fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.04em", padding:"10px 14px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isRulesLoading ? (
                <tr><td colSpan={6} style={{ padding:14, fontSize:13, color:"#64748b" }}>Loading rules...</td></tr>
              ) : rules.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:14, fontSize:13, color:"#64748b" }}>No rules found.</td></tr>
              ) : (
                rules.map((rule, idx) => (
                  <tr key={rule.id} style={{ borderTop:idx===0?"none":"1px solid #f8fafc" }}>
                    <td style={{ padding:"12px 14px", fontSize:13, color:"#0f172a", fontWeight:600 }}>{rule.name}</td>
                    <td style={{ padding:"12px 14px", fontSize:12, color:"#475569" }}>{rule.trigger}</td>
                    <td style={{ padding:"12px 14px", fontSize:12, color:"#475569" }}>{rule.recipients.join(", ")}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        {rule.channels.map((ch) => <span key={ch}><ChannelIcon channel={ch} /></span>)}
                      </div>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <Toggle enabled={rule.enabled} disabled={updateRuleMutation.isPending} onClick={() => updateRuleMutation.mutate({ id:rule.id, enabled:rule.enabled })} />
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <button type="button" onClick={() => setDeleteTarget(rule)}
                        style={{ border:"none", background:"transparent", color:"#ef4444", cursor:"pointer", padding:4 }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </section>
      )}

      {/* ── Delivery Logs ── */}
      {activeTab === "logs" && (
        <section style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12 }}>
          <div style={{ padding:14, borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <strong style={{ fontSize:14, color:"#0f172a" }}>Delivery Logs</strong>
            <div style={{ display:"flex", gap:8 }}>
              {[
                { value:logStatus, set:setLogStatus, label:"All Statuses", opts:["pending","sent","delivered","failed","bounced"] },
                { value:logChan,   set:setLogChan,   label:"All Channels", opts:["email","push","bell"] },
              ].map(({ value, set, label, opts }) => (
                <div key={label} style={{ position:"relative" }}>
                  <select value={value} onChange={(e)=>set(e.target.value)}
                    style={{ appearance:"none", border:"1px solid #e2e8f0", borderRadius:8, padding:"7px 24px 7px 10px", fontSize:12, minWidth:120, background:"#fff", color:"#475569" }}>
                    <option value="">{label}</option>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={11} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
                </div>
              ))}
            </div>
          </div>

          {logsError && <p style={{ margin:0, padding:"12px 14px", color:"#dc2626", fontSize:12 }}>{getErrorMessage(logsError, "Unable to load logs")}</p>}

          <div style={{ overflowX: "auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                {["Timestamp","Notification","Channel","Recipient","Status","Actions"].map((h) => (
                  <th key={h} style={{ textAlign:"left", fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.04em", padding:"10px 14px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLogsLoading ? (
                <tr><td colSpan={6} style={{ padding:14, fontSize:13, color:"#64748b" }}>Loading logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:14, fontSize:13, color:"#64748b" }}>No logs found.</td></tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const canResend = log.status === "failed" && log.rawChannel === "email";
                  return (
                    <tr key={log.id} style={{ borderTop:idx===0?"none":"1px solid #f8fafc" }}>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"#475569" }}>{log.timestamp || "-"}</td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"#475569", fontFamily:"monospace" }}>{log.notifId || "-"}</td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"#475569" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <ChannelIcon channel={log.channel} />{log.channel}
                        </div>
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"#475569" }}>{log.recipient}</td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:log.status==="failed"?"#dc2626":"#475569", fontWeight:600 }}>{log.status}</td>
                      <td style={{ padding:"12px 14px" }}>
                        {canResend && (
                          <button type="button" onClick={() => resendMutation.mutate(log.id)} disabled={resendMutation.isPending}
                            style={{ border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 10px", fontSize:12, background:"#fff", color:"#475569", cursor:resendMutation.isPending?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:5 }}>
                            <RefreshCw size={12} /> Resend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </section>
      )}
    </div>
  );
}