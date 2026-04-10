// 📁 src/features/settings/components/EditProfileDrawer.jsx

import { useState, useEffect } from "react";
import { X }                   from "lucide-react";
import { useMutation }         from "@tanstack/react-query";
import { useAuthStore }        from "../../../store/useAuthStore";
import { updateBasicInfo }     from "../api/settingsApi";

export default function EditProfileDrawer({ isOpen, onClose }) {
  const { user, updateUser } = useAuthStore();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    phone:     user?.phone     ?? "",
  });
  const [error, setError] = useState("");

  // Sync form when drawer opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        firstName: user?.firstName ?? "",
        lastName:  user?.lastName  ?? "",
        phone:     user?.phone     ?? "",
      });
      setError("");
    }
  }, [isOpen, user]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: updateBasicInfo,
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        updateUser({
          firstName: updatedUser.firstName,
          lastName:  updatedUser.lastName,
          phone:     updatedUser.phone,
          name:      `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
        });
      }
      setTimeout(onClose, 800);
    },
    onError: (err) => {
      const apiErr   = err?.response?.data?.error;
      const detail   = apiErr?.details?.[0]?.message;
      const fallback = apiErr?.message ?? "Failed to save changes. Please try again.";
      setError(detail ?? fallback);
    },
  });

  // Normalize phone to E.164 — strips spaces/dashes/parens, keeps leading +
  const normalizePhone = (raw) => raw.replace(/[\s\-().]/g, "");

  const handleSave = () => {
    setError("");
    if (!form.firstName.trim()) { setError("First name is required."); return; }

    const phone = normalizePhone(form.phone);
    if (phone && !/^\+[1-9]\d{1,14}$/.test(phone)) {
      setError("Phone must be in international format, e.g. +919876543210");
      return;
    }

    mutation.mutate({
      firstName: form.firstName.trim(),
      lastName:  form.lastName.trim(),
      phone:     phone || undefined,
    });
  };

  const saved = mutation.isSuccess;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 100,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed", top: 0, right: 0,
          height: "100vh", width: 400,
          background: "#fff", zIndex: 101,
          display: "flex", flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "24px 24px 20px", borderBottom: "1px solid #f1f5f9",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#000000" }}>
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
              cursor: "pointer", color: "#64748b",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>

          {/* Error banner */}
          {error && (
            <div style={{
              marginBottom: 20, padding: "10px 14px",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, fontSize: 13, color: "#dc2626",
            }}>
              {error}
            </div>
          )}

          {/* First Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000000", marginBottom: 8 }}>
              First Name
            </label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="First name"
              style={inputStyle}
              onFocus={(e)  => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e)   => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Last Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000000", marginBottom: 8 }}>
              Last Name
            </label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Last name"
              style={inputStyle}
              onFocus={(e)  => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e)   => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000000", marginBottom: 8 }}>
              Phone Number
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+919876543210 (international format)"
              style={inputStyle}
              onFocus={(e)  => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e)   => (e.target.style.borderColor = "#e2e8f0")}
            />
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
              Include country code, e.g. +91 for India
            </p>
          </div>

          {/* Email — read-only */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000000", marginBottom: 8 }}>
              Email
            </label>
            <input
              value={user?.email ?? ""}
              readOnly
              style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed", borderColor: "#e2e8f0" }}
            />
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Email cannot be changed</p>
          </div>

          {/* Role — read-only */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000000", marginBottom: 8 }}>
              Role
            </label>
            <input
              value={user?.role ?? ""}
              readOnly
              style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed", borderColor: "#e2e8f0", textTransform: "capitalize" }}
            />
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Role is managed by administrators</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={handleSave}
            disabled={mutation.isPending || saved}
            style={{
              width: "100%", padding: "13px",
              background: saved ? "#22c55e" : "#1e3a5f",
              color: "#fff", border: "none",
              borderRadius: 12, fontSize: 15,
              fontWeight: 700,
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              opacity: mutation.isPending ? 0.75 : 1,
              transition: "background 0.2s",
            }}
          >
            {saved ? "✅ Saved!" : mutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10, fontSize: 14,
  color: "#000000", outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  transition: "border-color 0.15s",
};
