// 📁 src/features/admin/components/KanbanColumn.jsx

import KanbanCard from "./KanbanCard";

export default function KanbanColumn({ col, leads }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: col.color, display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {col.label}
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: col.bg, color: col.color, border: `1px solid ${col.border}` }}>
          {leads.length}
        </span>
      </div>

      <div style={{ flex: 1, borderRadius: 12, padding: "10px 8px", background: col.bg, border: `1.5px dashed ${col.border}`, minHeight: 120 }}>
        {leads.length === 0
          ? <div style={{ textAlign: "center", padding: "24px 0", color: "#cbd5e1", fontSize: 12 }}>No leads</div>
          : leads.map((lead) => <KanbanCard key={lead.id} lead={lead} />)
        }
      </div>
    </div>
  );
}