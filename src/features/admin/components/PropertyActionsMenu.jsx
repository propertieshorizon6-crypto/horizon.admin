import { Trash2, Pencil, UserPlus } from "lucide-react";

export default function PropertyActionsMenu({ property, onDeleteProperty, onEditProperty, onAssignAgent, deleteTitle = "Delete Property" }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {onDeleteProperty && (
      <button
        type="button"
        title={deleteTitle}
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
      )}

      {onAssignAgent && (
      <button
        type="button"
        title="Assign Agent"
        onClick={(e) => {
          e.stopPropagation();
          onAssignAgent?.(property);
        }}
        style={{
          padding: 6,
          borderRadius: 6,
          border: "1px solid #e2e8f0",
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#eef0fb"; e.currentTarget.style.borderColor = "#2D368E"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
      >
        <UserPlus size={15} color="#2D368E" />
      </button>
      )}

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
        onMouseEnter={(e) => { e.currentTarget.style.background = "#eef0fb"; e.currentTarget.style.borderColor = "#2D368E"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
      >
        <Pencil size={15} color="#2D368E" />
      </button>
      )}
    </div>
  );
}
