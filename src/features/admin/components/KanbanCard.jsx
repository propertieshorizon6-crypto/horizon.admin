// 📁 src/features/admin/components/KanbanCard.jsx

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Mail, Phone, Building2 } from "lucide-react";
import { PRIORITY_STYLE, SOURCE_ICON, INTENT_ICON, SOURCE_ICON_FALLBACK, INTENT_ICON_FALLBACK } from "../constants/leadsConfig";
import { timeAgo } from "../../../utils/timeAgo";

export default function KanbanCard({ lead }) {
  const pri = PRIORITY_STYLE[lead.priority] ?? PRIORITY_STYLE["Low"];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
        padding: 14, marginBottom: 10, cursor: isDragging ? "grabbing" : "grab",
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.15s, opacity 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#000000" }}>{lead.name}</p>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: pri.bg, color: pri.color, border: `1px solid ${pri.border}`, whiteSpace: "nowrap", marginLeft: 6 }}>
          {lead.priority}
        </span>
      </div>

      {lead.email && <p style={{ margin: "0 0 2px", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}><Mail size={10} /> {lead.email}</p>}
      {lead.phone && <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}><Phone size={10} /> {lead.phone}</p>}

      <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3 }}>
        <Building2 size={10} /> {lead.property}
      </p>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {(() => { const SrcIcon = SOURCE_ICON[lead.source] ?? SOURCE_ICON_FALLBACK; return (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
            <SrcIcon size={10} /> {lead.source}
          </span>
        ); })()}
        {(() => { const IntIcon = INTENT_ICON[lead.intent] ?? INTENT_ICON_FALLBACK; return (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
            <IntIcon size={10} /> {lead.intent}
          </span>
        ); })()}
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
