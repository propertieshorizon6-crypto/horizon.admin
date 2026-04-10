// 📁 src/features/admin/components/ChangePriorityModal.jsx

import { useState } from "react";
import { PRIORITIES, PRIORITY_COLOR } from "../constants/leadsConfig";

export default function ChangePriorityModal({ lead, onClose, onSave }) {
  const [priority, setPriority] = useState(lead?.priority ?? "Medium");

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 14, padding: 28, minWidth: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16, color: "#000000" }}>Change Priority</p>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#94a3b8" }}>{lead?.name}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {PRIORITIES.map((opt) => {
            const color = PRIORITY_COLOR[opt];
            return (
              <label
                key={opt}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: `2px solid ${priority === opt ? color : "#e2e8f0"}`, cursor: "pointer", background: priority === opt ? `${color}12` : "#fff", transition: "all 0.15s" }}
              >
                <input
                  type="radio" name="priority" value={opt}
                  checked={priority === opt}
                  onChange={() => setPriority(opt)}
                  style={{ accentColor: color }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: priority === opt ? color : "#000000" }}>
                  {opt}
                </span>
              </label>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b" }}>
            Cancel
          </button>
          <button
            onClick={() => { onSave(priority); onClose(); }}
            style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#2D368E", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 600 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
