// 📁 src/features/admin/pages/NotificationsPage.jsx

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Search, CheckCircle, AlertCircle } from "lucide-react";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationsApi";
import useNotifications from "../hooks/useNotifications";

// ── Icons ─────────────────────────────────────────────────────────────────────
const BellSVG  = ({ color="#64748b", size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const EmailSVG = ({ color="#64748b", size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const PushSVG  = ({ color="#64748b", size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;

function ChannelIcon({ channel }) {
  if (channel === "email") return <EmailSVG />;
  if (channel === "push")  return <PushSVG />;
  return <BellSVG />;
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

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [chanFilter, setChanFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [toast,      setToast]      = useState(null);

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

  const notifParams = useMemo(() => ({ page: 1, limit: 100 }), []);

  const { data: notifsResult, isLoading: isNotifsLoading, error: notifsError } =
    useNotifications(notifParams);

  const notifications = useMemo(() => notifsResult?.notifications ?? [], [notifsResult]);
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

  // ── Filters ───────────────────────────────────────────────────────────────
  const typeOptions = useMemo(
    () => [...new Set(notifications.map((n) => n.type).filter(Boolean))].sort(),
    [notifications],
  );

  const filteredNotifs = useMemo(() => {
    let data = notifications;
    if (typeFilter)               data = data.filter((n) => n.type    === typeFilter);
    if (chanFilter)               data = data.filter((n) => n.channel === chanFilter);
    if (readFilter === "Unread")  data = data.filter((n) => !n.read);
    if (readFilter === "Read")    data = data.filter((n) =>  n.read);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((n) =>
        n.title.toLowerCase().includes(q) || (n.desc || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [notifications, typeFilter, chanFilter, readFilter, search]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 min-h-full" style={{ background:"#f8fafc", fontFamily:"system-ui,sans-serif" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, color:"#000000" }}>
            Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
          </h1>
          <p style={{ margin:"4px 0 0", fontSize:12, color:"#64748b" }}>All your notifications in one place</p>
        </div>
        <button
          type="button"
          onClick={() => { if (unreadCount === 0 || markAllReadMutation.isPending) return; markAllReadMutation.mutate(); }}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          style={{ border:"1px solid #e2e8f0", background:"#f8fafc", color:"#475569", borderRadius:8, padding:"7px 12px", fontSize:12, cursor:unreadCount===0?"not-allowed":"pointer" }}>
          Mark all read
        </button>
      </div>

      {/* Notification list */}
      <section style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12 }}>

        {/* Filters */}
        <div style={{ display:"flex", gap:8, padding:14, borderBottom:"1px solid #f1f5f9", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <Search size={13} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              style={{ width:"100%", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 10px 8px 28px", fontSize:12, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          {[
            { value:typeFilter, set:setTypeFilter, label:"All Types",    opts:typeOptions },
            { value:chanFilter, set:setChanFilter, label:"All Channels", opts:["bell","email","push"] },
            { value:readFilter, set:setReadFilter, label:"All",          opts:["Unread","Read"] },
          ].map(({ value, set, label, opts }) => (
            <div key={label} style={{ position:"relative" }}>
              <select value={value} onChange={(e) => set(e.target.value)}
                style={{ appearance:"none", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 26px 8px 10px", fontSize:12, color:"#475569", minWidth:120, background:"#fff" }}>
                <option value="">{label}</option>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={11} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
            </div>
          ))}
        </div>

        {notifsError && (
          <p style={{ margin:0, padding:"12px 14px", color:"#dc2626", fontSize:12 }}>
            {getErrorMessage(notifsError, "Unable to load notifications")}
          </p>
        )}

        <div>
          {isNotifsLoading ? (
            <p style={{ margin:0, padding:24, color:"#64748b", fontSize:13, textAlign:"center" }}>Loading notifications...</p>
          ) : filteredNotifs.length === 0 ? (
            <p style={{ margin:0, padding:24, color:"#64748b", fontSize:13, textAlign:"center" }}>No notifications found.</p>
          ) : (
            filteredNotifs.map((item, idx) => (
              <div key={item.id}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:item.read?"#fff":"#fffbeb", borderTop:idx===0?"none":"1px solid #f8fafc" }}>

                {/* Channel icon */}
                <div style={{ width:36, height:36, borderRadius:9, border:"1px solid #e2e8f0", display:"grid", placeItems:"center", background:"#f8fafc", flexShrink:0 }}>
                  <ChannelIcon channel={item.channel} />
                </div>

                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:2 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#000000" }}>{item.title}</p>
                    {item.type && (
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99, background:"#eff6ff", color:"#2563eb" }}>
                        {item.type}
                      </span>
                    )}
                    {!item.read && (
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99, background:"#fef9c3", color:"#a16207" }}>
                        Unread
                      </span>
                    )}
                  </div>
                  {item.desc && (
                    <p style={{ margin:"0 0 2px", fontSize:12, color:"#64748b" }}>{item.desc}</p>
                  )}
                  <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{item.date || "Unknown time"}</p>
                </div>

                {/* Mark read */}
                <button
                  type="button"
                  onClick={() => { if (!item.read && !markReadMutation.isPending) markReadMutation.mutate(item.id); }}
                  disabled={item.read || markReadMutation.isPending}
                  title={item.read ? "Already read" : "Mark as read"}
                  style={{ border:"1px solid #e2e8f0", width:32, height:32, borderRadius:8, display:"grid", placeItems:"center", background:"#fff", color:item.read?"#cbd5e1":"#475569", cursor:item.read?"not-allowed":"pointer", flexShrink:0 }}>
                  <Check size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
