// 📁 src/features/settings/components/EditProfileDrawer.jsx
// Props: isOpen, onClose

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

export default function EditProfileDrawer({ isOpen, onClose }) {
  const { user, updateUser } = useAuthStore();

  const [form, setForm] = useState({
    name:  user?.name  ?? "",
    phone: user?.phone ?? "",
  });
  const [saved, setSaved] = useState(false);

  // Sync form when user changes
  useEffect(() => {
    setForm({ name: user?.name ?? "", phone: user?.phone ?? "" });
  }, [user]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = () => {
    updateUser({ name: form.name, phone: form.phone });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position:   "fixed",
          inset:      0,
          background: "rgba(0,0,0,0.45)",
          zIndex:     100,
          opacity:    isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* ── Drawer ── */}
      <div
        style={{
          position:   "fixed",
          top:        0,
          right:      0,
          height:     "100vh",
          width:      380,
          background: "#fff",
          zIndex:     101,
          display:    "flex",
          flexDirection: "column",
          transform:  isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow:  "-8px 0 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div style={{
          display:       "flex",
          alignItems:    "flex-start",
          justifyContent:"space-between",
          padding:       "24px 24px 20px",
          borderBottom:  "1px solid #f1f5f9",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              Edit Profile
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
              Update your profile information
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#64748b", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>

          {/* Display Name */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
              Display Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{
                width: "100%", padding: "10px 14px",
                border: "2px solid #6366f1",  // purple-blue like screenshot
                borderRadius: 10, fontSize: 14,
                color: "#0f172a", outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e)  => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e)   => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
              Phone Number
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+971 50 XXX XXXX"
              style={{
                width: "100%", padding: "10px 14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10, fontSize: 14,
                color: "#0f172a", outline: "none",
                boxSizing: "border-box",
                background: "#fff",
                transition: "border-color 0.15s",
              }}
              onFocus={(e)  => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e)   => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Email — read only */}
          <div style={{ marginBottom: 6 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
              Email
            </label>
            <input
              value={user?.email ?? "akash@gmail.com"}
              readOnly
              style={{
                width: "100%", padding: "10px 14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10, fontSize: 14,
                color: "#94a3b8", outline: "none",
                boxSizing: "border-box",
                background: "#f8fafc",
                cursor: "not-allowed",
              }}
            />
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
              Email cannot be changed
            </p>
          </div>

          {/* Role — read only */}
          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
              Role
            </label>
            <input
              value={user?.role ?? "Agent"}
              readOnly
              style={{
                width: "100%", padding: "10px 14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10, fontSize: 14,
                color: "#94a3b8", outline: "none",
                boxSizing: "border-box",
                background: "#f8fafc",
                cursor: "not-allowed",
                textTransform: "capitalize",
              }}
            />
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
              Role is managed by administrators
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={handleSave}
            style={{
              width: "100%", padding: "13px",
              background: saved ? "#22c55e" : "#1e3a5f",
              color: "#fff", border: "none",
              borderRadius: 12, fontSize: 15,
              fontWeight: 700, cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { if (!saved) e.currentTarget.style.background = "#162d4a"; }}
            onMouseLeave={(e) => { if (!saved) e.currentTarget.style.background = "#1e3a5f"; }}
          >
            {saved ? "✅ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}