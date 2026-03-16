import { Trash2, Pencil } from "lucide-react";

export default function PropertyActionsMenu({ property, onDeleteProperty, onEditProperty }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        type="button"
        title="Delete Property"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteProperty?.(property);
        }}
        style={{
          padding: 6,
          borderRadius: 6,
          border: "1px solid #e2e8f0",
          background: "#fff",
          cursor: "pointer",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
      >
        <Trash2 size={15} color="#ef4444" />
      </button>

      {onEditProperty && (
      <button
        type="button"
        title="Edit Property"
        onClick={(e) => {
          e.stopPropagation();
          onEditProperty?.(property);
        }}
        style={{
          padding: 6,
          borderRadius: 6,
          border: "1px solid #e2e8f0",
          background: "#fff",
          cursor: "pointer",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
      >
        <Pencil size={15} />
      </button>
      )}
    </div>
  );
}
