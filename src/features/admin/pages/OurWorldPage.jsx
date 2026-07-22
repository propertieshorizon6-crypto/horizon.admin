// 📁 src/features/admin/pages/OurWorldPage.jsx

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, ExternalLink } from "lucide-react";
import useOurWorld from "../hooks/useOurWorld";
import { createOurWorld, editOurWorld, deleteOurWorld } from "../api/ourWorldApi";

const EMPTY_FORM = { label: "", link: "", bg: "#ECEAE5", order: 0, isActive: true };

const btnPrimary = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
  padding: "9px 18px", borderRadius: 9, border: "1px solid #2D368E",
  background: "#2D368E", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
};
const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5e1",
  fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", color: "#64748b", marginBottom: 6,
};

export default function OurWorldPage() {
  const queryClient = useQueryClient();
  const { data: logos = [], isLoading } = useOurWorld();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["ourWorld"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        label: form.label.trim(),
        link: form.link.trim(),
        bg: form.bg,
        order: Number(form.order) || 0,
        isActive: form.isActive,
      };
      return editing
        ? editOurWorld(editing._id, body, imageFile)
        : createOurWorld({ body, imageFile });
    },
    onSuccess: async () => {
      await invalidate();
      setModalOpen(false);
      showToast("success", editing ? "Logo updated" : "Logo added");
    },
    onError: (err) =>
      setFormError(err?.response?.data?.message || err?.message || "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteOurWorld(id),
    onSuccess: async () => {
      await invalidate();
      showToast("success", "Logo deleted");
    },
    onError: (err) =>
      showToast("error", err?.response?.data?.message || err?.message || "Delete failed"),
  });

  // Next order value = one past the current highest, so each new logo gets a
  // distinct position by default instead of everything defaulting to 0.
  const nextOrder = logos.length
    ? Math.max(...logos.map((l) => l.order ?? 0)) + 1
    : 0;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, order: nextOrder });
    setImageFile(null);
    setPreview(null);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (logo) => {
    setEditing(logo);
    setForm({
      label: logo.label || "",
      link: logo.link || "",
      bg: logo.bg || "#ECEAE5",
      order: logo.order || 0,
      isActive: logo.isActive !== false,
    });
    setImageFile(null);
    setPreview(logo.image?.url || null);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saveMutation.isPending) return;
    setModalOpen(false);
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.label.trim()) return setFormError("Label is required");
    if (!form.link.trim()) return setFormError("Link is required");
    if (!editing && !imageFile) return setFormError("Please choose a logo image");
    saveMutation.mutate();
  };

  const handleDelete = (logo) => {
    if (deleteMutation.isPending) return;
    if (window.confirm(`Delete the "${logo.label}" logo? This cannot be undone.`)) {
      deleteMutation.mutate(logo._id);
    }
  };

  return (
    <div style={{ padding: "4px 2px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#000" }}>Our World</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Manage the brand logos shown on the client Explore page and where they link.
          </p>
        </div>
        <button onClick={openCreate} style={btnPrimary}>
          <Plus size={15} /> Add Logo
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <p style={{ fontSize: 13, color: "#94a3b8" }}>Loading…</p>
      ) : logos.length === 0 ? (
        <div style={{
          border: "1px dashed #cbd5e1", borderRadius: 12, padding: "40px 20px",
          textAlign: "center", color: "#94a3b8", fontSize: 13,
        }}>
          No logos yet. Click “Add Logo” to create the first one.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {logos.map((logo) => (
            <div key={logo._id} style={{
              border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#fff",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%", background: logo.bg || "#ECEAE5",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 8, flexShrink: 0,
                }}>
                  <img src={logo.image?.url} alt={logo.label}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{logo.label}</div>
                  <a href={logo.link} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11, color: "#2D368E", display: "flex", alignItems: "center", gap: 4, wordBreak: "break-all" }}>
                    <ExternalLink size={11} /> {logo.link}
                  </a>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    order {logo.order ?? 0} · {logo.isActive !== false ? "active" : "hidden"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => openEdit(logo)} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8,
                  border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(logo)} disabled={deleteMutation.isPending} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8,
                  border: "1px solid #fecaca", background: "#fff", color: "#dc2626", fontSize: 12, fontWeight: 600,
                  cursor: deleteMutation.isPending ? "not-allowed" : "pointer",
                }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div onClick={closeModal} style={{
          position: "fixed", inset: 0, zIndex: 3000, background: "rgba(15,23,42,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{
            width: "100%", maxWidth: 480, background: "#fff", borderRadius: 14, overflow: "hidden",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#000" }}>
                {editing ? "Edit Logo" : "Add Logo"}
              </p>
              <button type="button" onClick={closeModal} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Image */}
              <div>
                <label style={labelStyle}>Logo image</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", background: form.bg || "#ECEAE5",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 8, flexShrink: 0,
                    border: "1px solid #e2e8f0",
                  }}>
                    {preview
                      ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : <span style={{ fontSize: 10, color: "#94a3b8" }}>none</span>}
                  </div>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} style={{ fontSize: 12 }} />
                </div>
                {editing && <p style={{ fontSize: 11, color: "#94a3b8", margin: "6px 0 0" }}>Leave empty to keep the current image.</p>}
              </div>

              <div>
                <label style={labelStyle}>Label</label>
                <input style={inputStyle} value={form.label}
                  onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="AUCTION" maxLength={60} />
              </div>

              <div>
                <label style={labelStyle}>Link</label>
                <input style={inputStyle} value={form.link}
                  onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                  placeholder="https://example.com  or  /search?type=land" />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: "0 0 90px" }}>
                  <label style={labelStyle}>Bg color</label>
                  <input type="color" value={form.bg}
                    onChange={(e) => setForm((p) => ({ ...p, bg: e.target.value }))}
                    style={{ width: "100%", height: 38, border: "1px solid #cbd5e1", borderRadius: 9, cursor: "pointer", background: "#fff" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Order</label>
                  <input type="number" min={0} style={inputStyle} value={form.order}
                    onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#0f172a", cursor: "pointer" }}>
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active (visible on the client)
              </label>

              {formError && <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{formError}</p>}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 16px 16px" }}>
              <button type="button" onClick={closeModal} disabled={saveMutation.isPending} style={{
                padding: "9px 16px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff",
                color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
              <button type="submit" disabled={saveMutation.isPending} style={{
                ...btnPrimary, opacity: saveMutation.isPending ? 0.6 : 1,
                cursor: saveMutation.isPending ? "not-allowed" : "pointer",
              }}>
                {saveMutation.isPending ? "Saving…" : editing ? "Save changes" : "Add logo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999, padding: "12px 18px", borderRadius: 12,
          background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          color: toast.type === "error" ? "#b91c1c" : "#166534",
          fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxWidth: 380,
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
