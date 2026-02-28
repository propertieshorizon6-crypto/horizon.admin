// 📁 src/features/admin/pages/AuditLogsPage.jsx

import { useState, useMemo } from "react";
import { Search, ChevronDown, Calendar, Eye } from "lucide-react";

// ── Mock Data ─────────────────────────────────────────────────────────────────
const LOGS = [
  { id: "log_1",  timestamp: "Jan 29, 20:00", actor: "Admin One",   actorRole: "Admin",   action: "LEAD CREATED",           entity: "Lead",        entityId: "l_9199",    summary: "New lead created from app contact",         color: "dark"   },
  { id: "log_2",  timestamp: "Jan 29, 20:01", actor: "System",      actorRole: "Admin",   action: "NOTIFICATION TRIGGERED", entity: "Notification", entityId: "n_101",     summary: "Admin notified of new lead contact",         color: "dark"   },
  { id: "log_3",  timestamp: "Jan 29, 15:45", actor: "Agent Alice", actorRole: "Agent",   action: "INQUIRY STATUS UPDATED", entity: "Inquiry",     entityId: "inq_3003",  summary: "Inquiry status changed to In Progress",     color: "outline"},
  { id: "log_4",  timestamp: "Jan 28, 22:15", actor: "Manager One", actorRole: "Manager", action: "LEAD ASSIGNED",          entity: "Lead",        entityId: "l_9101",    summary: "Lead assigned to Agent Alice",              color: "outline"},
  { id: "log_5",  timestamp: "Jan 28, 17:30", actor: "Admin One",   actorRole: "Admin",   action: "PROPERTY CREATED",       entity: "Property",    entityId: "p_1004",    summary: "New property listing added",                color: "dark"   },
  { id: "log_6",  timestamp: "Jan 28, 15:00", actor: "Agent Brian", actorRole: "Agent",   action: "TOUR CONFIRMED",         entity: "TourRequest", entityId: "tr_7003",   summary: "Tour request confirmed for slot 2",         color: "outline"},
  { id: "log_7",  timestamp: "Jan 27, 20:50", actor: "Admin One",   actorRole: "Admin",   action: "USER CREATED",           entity: "User",        entityId: "u_agent_3", summary: "New agent account created",                 color: "dark"   },
  { id: "log_8",  timestamp: "Jan 27, 16:30", actor: "Admin One",   actorRole: "Admin",   action: "DATA EXPORTED",          entity: "Export",      entityId: "exp_001",   summary: "Leads data exported to CSV",                color: "outline"},
  { id: "log_9",  timestamp: "Jan 26, 19:30", actor: "Manager One", actorRole: "Manager", action: "INQUIRY ARCHIVED",       entity: "Inquiry",     entityId: "inq_2999",  summary: "Inquiry archived after resolution",          color: "red"    },
  { id: "log_10", timestamp: "Jan 25, 16:00", actor: "System",      actorRole: "Admin",   action: "MESSAGE SENT",           entity: "Message",     entityId: "m_7",       summary: "Customer initiated contact via message",    color: "outline"},
];

// ── Action badge ──────────────────────────────────────────────────────────────
function ActionBadge({ label, color }) {
  const styles = {
    dark:    { background: "#1e293b", color: "#fff",     border: "none"                     },
    outline: { background: "transparent", color: "#475569", border: "1px solid #cbd5e1"    },
    red:     { background: "#ef4444", color: "#fff",     border: "none"                     },
    green:   { background: "#22c55e", color: "#fff",     border: "none"                     },
  };
  const s = styles[color] ?? styles.outline;
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 700,
      padding: "4px 12px", borderRadius: 7, letterSpacing: "0.03em",
      whiteSpace: "nowrap", ...s,
    }}>
      {label}
    </span>
  );
}

// ── Unique values for dropdowns ───────────────────────────────────────────────
const ACTIONS  = [...new Set(LOGS.map((l) => l.action))];
const ENTITIES = [...new Set(LOGS.map((l) => l.entity))];
const ROLES    = [...new Set(LOGS.map((l) => l.actorRole))];

export default function AuditLogsPage() {
  const [search,       setSearch]       = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filtered data
  const filteredLogs = useMemo(() => {
    let data = LOGS;
    if (actionFilter) data = data.filter((l) => l.action === actionFilter);
    if (entityFilter) data = data.filter((l) => l.entity === entityFilter);
    if (roleFilter)   data = data.filter((l) => l.actorRole === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((l) =>
        l.entityId.toLowerCase().includes(q)  ||
        l.entity.toLowerCase().includes(q)    ||
        l.actor.toLowerCase().includes(q)     ||
        l.summary.toLowerCase().includes(q)   ||
        l.action.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, actionFilter, entityFilter, roleFilter]);

  const DD = ({ value, set, label, opts }) => (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => set(e.target.value)} style={{ appearance: "none", paddingLeft: 14, paddingRight: 32, paddingTop: 10, paddingBottom: 10, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: value ? "#1e293b" : "#64748b", background: "#fff", cursor: "pointer", outline: "none", minWidth: 140 }}>
        <option value="">{label}</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif", padding: "28px 28px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Audit Logs</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Track all system activities and changes</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button style={{ fontSize: 13, fontWeight: 600, color: "#475569", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            Simulate Contact Initiated
          </button>
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

      {/* Search + Filters */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, entity, actor, summary..."
            style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box", background: "#fafafa" }}
          />
        </div>

        <DD value={actionFilter} set={setActionFilter} label="All Actions"  opts={ACTIONS}  />
        <DD value={entityFilter} set={setEntityFilter} label="All Entities" opts={ENTITIES} />
        <DD value={roleFilter}   set={setRoleFilter}   label="All Roles"    opts={ROLES}    />

        {/* Date range picker */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDatePicker((s) => !s)}
            style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, paddingRight: 14, paddingTop: 10, paddingBottom: 10, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: (dateFrom || dateTo) ? "#1e293b" : "#64748b", background: "#fff", cursor: "pointer", outline: "none", whiteSpace: "nowrap" }}
          >
            <Calendar size={14} color="#94a3b8" />
            {dateFrom || dateTo ? `${dateFrom || "Start"} – ${dateTo || "End"}` : "From – To"}
          </button>
          {showDatePicker && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", display: "flex", gap: 10, alignItems: "center" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>FROM</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 13, outline: "none", color: "#334155" }} />
              </div>
              <span style={{ color: "#94a3b8", marginTop: 16 }}>–</span>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 4 }}>TO</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 13, outline: "none", color: "#334155" }} />
              </div>
              <button onClick={() => { setDateFrom(""); setDateTo(""); setShowDatePicker(false); }} style={{ marginTop: 16, padding: "6px 10px", border: "none", borderRadius: 7, background: "#f1f5f9", fontSize: 12, color: "#64748b", cursor: "pointer" }}>Clear</button>
              <button onClick={() => setShowDatePicker(false)} style={{ marginTop: 16, padding: "6px 12px", border: "none", borderRadius: 7, background: "#1e293b", fontSize: 12, color: "#fff", cursor: "pointer" }}>Apply</button>
            </div>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>

        {/* Log count */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {filteredLogs.length} Log {filteredLogs.length === 1 ? "Entry" : "Entries"}
          </h2>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {["Timestamp","Actor","Action","Entity","Summary","Details"].map((h) => (
                <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No log entries found</td></tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: idx < filteredLogs.length - 1 ? "1px solid #f8fafc" : "none", background: "#fff", transition: "background 0.1s", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  {/* Timestamp */}
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>
                    {log.timestamp}
                  </td>

                  {/* Actor */}
                  <td style={{ padding: "16px 20px" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{log.actor}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{log.actorRole}</p>
                  </td>

                  {/* Action badge */}
                  <td style={{ padding: "16px 20px" }}>
                    <ActionBadge label={log.action} color={log.color} />
                  </td>

                  {/* Entity */}
                  <td style={{ padding: "16px 20px" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{log.entity}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{log.entityId}</p>
                  </td>

                  {/* Summary */}
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569" }}>
                    {log.summary}
                  </td>

                  {/* Details eye icon */}
                  <td style={{ padding: "16px 20px" }}>
                    <button
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}