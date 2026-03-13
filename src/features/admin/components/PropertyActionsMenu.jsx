// 📁 src/features/admin/components/PropertyActionsMenu.jsx

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Eye } from "lucide-react";

export default function PropertyActionsMenu({ property, onViewDetails }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>

      {/* 3-dot trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((prev) => !prev); }}
        style={{
          padding: "6px 8px",
          borderRadius: 8,
          border: "none",
          background: open ? "#f1f5f9" : "transparent",
          cursor: "pointer",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        <MoreHorizontal size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 4px)",
          zIndex: 1000,
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          border: "1px solid #e2e8f0",
          minWidth: 172,
          overflow: "hidden",
        }}>
          {/* Header label */}
          <div style={{
            padding: "8px 14px 6px",
            fontSize: 11,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: "1px solid #f1f5f9",
          }}>
            Actions
          </div>

          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onViewDetails?.(property);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 14px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#334155",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Eye size={15} color="#64748b" />
            View Details
          </button>
        </div>
      )}
    </div>
  );
}