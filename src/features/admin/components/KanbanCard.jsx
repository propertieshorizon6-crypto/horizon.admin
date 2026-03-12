// 📁 src/features/admin/components/KanbanCard.jsx

import { PRIORITY_STYLE, SOURCE_ICON, INTENT_ICON } from "../constants/leadsConfig";
import { timeAgo } from "../../../utils/timeAgo";

export default function KanbanCard({ lead }) {
  const pri = PRIORITY_STYLE[lead.priority] ?? PRIORITY_STYLE["Low"];

  return (
    <div
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 14, marginBottom: 10, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.15s, transform 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{lead.name}</p>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: pri.bg, color: pri.color, border: `1px solid ${pri.border}`, whiteSpace: "nowrap", marginLeft: 6 }}>
          {lead.priority}
        </span>
      </div>

      {lead.email && <p style={{ margin: "0 0 2px", fontSize: 11, color: "#94a3b8" }}>✉ {lead.email}</p>}
      {lead.phone && <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8" }}>📞 {lead.phone}</p>}

      <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        🏢 {lead.property}
      </p>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
          {SOURCE_ICON[lead.source] ?? "🔗"} {lead.source}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
          {INTENT_ICON[lead.intent] ?? "📌"} {lead.intent}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
        <span style={{ fontSize: 11, color: lead.assignedTo ? "#475569" : "#94a3b8", fontStyle: lead.assignedTo ? "normal" : "italic" }}>
          {lead.assignedTo ?? "Unassigned"}
        </span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{timeAgo(lead.createdAt)}</span>
      </div>
    </div>
  );
}