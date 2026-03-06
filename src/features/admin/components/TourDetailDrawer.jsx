// 📁 src/features/admin/components/TourDetailDrawer.jsx
//
// 🧠 CONCEPT:
// Yeh ek "Drawer" component hai — right side se slide-in hota hai
// Jab user kisi tour row par click karta hai, yeh panel open hota hai
// Backdrop (dark overlay) par click karne se band ho jaata hai
//
// 📦 DATA FLOW:
// TourRequestsPage → row click → selectedTour state set →
// TourDetailDrawer ko tour data pass hota hai → drawer render hota hai
//
// 🔑 KEY PROPS:
// - tour       : selected tour ka data object
// - onClose    : drawer band karne ka function
// - onUpdate   : tour data update karne ka function (status change, agent change)

import { useState, useEffect } from "react";
import { X, User, Calendar, MapPin, Phone, Mail, CheckCircle, XCircle, Clock } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK AGENTS LIST — Reassign Agent modal mein use hoga
// Real app mein yeh API se aayega
// ─────────────────────────────────────────────────────────────────────────────
const AGENTS = ["Agent Demo", "Agent Alice", "Agent Bob", "Agent Chipo", "Agent Brian"];

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE — Tour ka current status dikhata hai
// color coding: Requested=blue, Confirmed=green, Cancelled=red, etc.
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Requested: { bg: "#dbeafe", color: "#1d4ed8" },
    Proposed:  { bg: "#f1f5f9", color: "#475569"  },
    Confirmed: { bg: "#dcfce7", color: "#15803d"  },
    Completed: { bg: "#dcfce7", color: "#15803d"  },
    Cancelled: { bg: "#fee2e2", color: "#dc2626"  },
  };
  const s = map[status] ?? map.Proposed;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION TITLE — Drawer ke andar sections ka heading
// ─────────────────────────────────────────────────────────────────────────────
function SectionTitle({ title }) {
  return (
    <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
      {title}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE ICON — Same as TourRequestsPage mein hai
// ─────────────────────────────────────────────────────────────────────────────
function SourceIcon({ source }) {
  if (source === "app") return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    </div>
  );
  if (source === "website") return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </div>
  );
  return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.83 2 2 0 0 1 3.59 2.63h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.17a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.5z"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REASSIGN AGENT MODAL
// 🧠 Concept: Ek small modal jo drawer ke upar aata hai
//    agent select karo → confirm karo → tour.agent update ho jaata hai
// ─────────────────────────────────────────────────────────────────────────────
function ReassignModal({ currentAgent, onConfirm, onClose }) {
  const [selected, setSelected] = useState(currentAgent ?? "");
  return (
    // Backdrop
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      {/* Modal box — stopPropagation so backdrop click na close kare modal */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 340, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Reassign Agent</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><X size={16} /></button>
        </div>

        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>Select a new agent for this tour</p>

        {/* Agent list — radio style */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {AGENTS.map((agent) => (
            <label key={agent} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${selected === agent ? "#1e293b" : "#e2e8f0"}`, cursor: "pointer", background: selected === agent ? "#f8fafc" : "#fff", transition: "all 0.1s" }}>
              <input type="radio" name="agent" value={agent} checked={selected === agent} onChange={() => setSelected(agent)} style={{ accentColor: "#1e293b" }} />
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#475569" }}>
                {agent.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{agent}</span>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", background: "#fff", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(selected)} disabled={!selected} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: selected ? "#1e293b" : "#e2e8f0", cursor: selected ? "pointer" : "not-allowed" }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPOSE SCHEDULE MODAL
// 🧠 Concept: Next 3 days ke time slots suggest karo
//    Admin 3 slots choose karta hai → tour pe save ho jaate hain
//    Customer baad mein inme se ek confirm kar sakta hai
// ─────────────────────────────────────────────────────────────────────────────
function ProposeScheduleModal({ onConfirm, onClose }) {
  // 🔑 State: 3 slots ka array — har slot ek datetime string hai
  const [slots, setSlots] = useState(["", "", ""]);

  // Helper: slot value update karo
  const updateSlot = (idx, value) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? value : s)));
  };

  // Minimum date: aaj ka date
  const today = new Date().toISOString().slice(0, 16);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Propose Schedule</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><X size={16} /></button>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>Suggest up to 3 available time slots for the customer</p>

        {/* 3 slot inputs */}
        {slots.map((slot, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>
              Slot {idx + 1} {idx === 0 && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            <div style={{ position: "relative" }}>
              <Calendar size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <input
                type="datetime-local"
                value={slot}
                min={today}
                onChange={(e) => updateSlot(idx, e.target.value)}
                style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: `1.5px solid ${slot ? "#1e293b" : "#e2e8f0"}`, borderRadius: 9, fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box", background: slot ? "#f8fafc" : "#fff" }}
              />
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", background: "#fff", cursor: "pointer" }}>Cancel</button>
          <button
            onClick={() => onConfirm(slots.filter(Boolean))}
            disabled={!slots[0]}
            style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: slots[0] ? "#1e293b" : "#e2e8f0", cursor: slots[0] ? "pointer" : "not-allowed" }}
          >
            Send Proposal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL CONFIRM MODAL
// 🧠 Concept: Destructive action hai — confirm karna zaroori hai
//    "Are you sure?" pattern — galti se cancel na ho jaye
// ─────────────────────────────────────────────────────────────────────────────
function CancelConfirmModal({ tourId, onConfirm, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 340, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <XCircle size={24} color="#dc2626" />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: "#0f172a", textAlign: "center" }}>Cancel Tour?</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b", textAlign: "center" }}>
          Are you sure you want to cancel <strong>{tourId}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", background: "#fff", cursor: "pointer" }}>Keep Tour</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: "#dc2626", cursor: "pointer" }}>Yes, Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DRAWER COMPONENT
// 🧠 Concept:
//   - `tour` prop null hai → drawer hidden (translateX(100%) = right side pe)
//   - `tour` prop set hai → drawer visible (translateX(0) = screen pe)
//   - CSS transition se smooth slide animation aata hai
//
// 📦 Data Flow:
//   TourRequestsPage
//     → row click → setSelectedTour(tour)
//     → TourDetailDrawer ko tour pass hota hai
//     → user action → onUpdate(updatedTour) call hota hai
//     → TourRequestsPage mein state update hoti hai
// ─────────────────────────────────────────────────────────────────────────────
export default function TourDetailDrawer({ tour, onClose, onUpdate }) {
  // 🔑 Modal states — konsa modal open hai
  const [showReassign,  setShowReassign]  = useState(false);
  const [showSchedule,  setShowSchedule]  = useState(false);
  const [showCancel,    setShowCancel]    = useState(false);
  const [actionSuccess, setActionSuccess] = useState(""); // success message

  // 🔑 Escape key se drawer band ho
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── ACTION HANDLERS ──────────────────────────────────────────────────────
  // 🧠 Har handler:
  //   1. Tour object ko update karta hai (status/agent change)
  //   2. onUpdate() se parent ko batata hai
  //   3. Modal close karta hai
  //   4. Success message dikhata hai (2 sec ke liye)

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 2500);
  };

  // Reassign Agent
  const handleReassign = (newAgent) => {
    onUpdate({ ...tour, agent: newAgent });
    setShowReassign(false);
    showSuccess(`Agent reassigned to ${newAgent}`);
  };

  // Propose Schedule — slots save karo
  const handleProposeSchedule = (slots) => {
    onUpdate({ ...tour, proposedSlots: slots, status: "Proposed" });
    setShowSchedule(false);
    showSuccess("Schedule proposed successfully");
  };

  // Mark Confirmed
  const handleConfirm = () => {
    onUpdate({ ...tour, status: "Confirmed" });
    showSuccess("Tour marked as Confirmed ✓");
  };

  // Mark Completed
  const handleComplete = () => {
    onUpdate({ ...tour, status: "Completed" });
    showSuccess("Tour marked as Completed ✓");
  };

  // Cancel Tour
  const handleCancel = () => {
    onUpdate({ ...tour, status: "Cancelled" });
    setShowCancel(false);
    showSuccess("Tour has been cancelled");
  };

  // ── open = tour exists, closed = null ────────────────────────────────────
  const isOpen = !!tour;

  return (
    <>
      {/* ── BACKDROP ──────────────────────────────────────────────────────
          🧠 Semi-transparent dark overlay
          Click karo → drawer band ho jata hai
          opacity transition se smooth fade in/out hota hai
      ── */}
      <div
        onClick={onClose}
        style={{
          position:   "fixed",
          inset:      0,
          background: "rgba(0,0,0,0.45)",
          zIndex:     90,
          // 🔑 Visibility trick: opacity + pointerEvents se toggle karo
          //    display:none se transition kaam nahi karta
          opacity:        isOpen ? 1 : 0,
          pointerEvents:  isOpen ? "auto" : "none",
          transition:     "opacity 0.25s ease",
        }}
      />

      {/* ── DRAWER PANEL ──────────────────────────────────────────────────
          🔑 transform: translateX() se slide animation:
            - Closed: translateX(100%)  → pura right side pe hide
            - Open:   translateX(0)     → screen pe aa jaata hai
          transition: smooth 0.3s slide
      ── */}
      <div style={{
        position:   "fixed",
        top:        0,
        right:      0,
        bottom:     0,
        width:      380,
        background: "#fff",
        zIndex:     100,
        boxShadow:  "-4px 0 24px rgba(0,0,0,0.12)",
        transform:  isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display:    "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
      }}>

        {/* Early return — agar tour nahi hai to kuch render mat karo */}
        {!tour ? null : (
          <>
            {/* ── HEADER ────────────────────────────────────────────────── */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>{tour.id}</span>
                  <StatusBadge status={tour.status} />
                </div>
                {/* Close button */}
                <button onClick={onClose} style={{ padding: 6, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", borderRadius: 7, display: "flex", alignItems: "center" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <X size={18} />
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Created {tour.createdAt}</p>
            </div>

            {/* ── SCROLLABLE CONTENT ────────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

              {/* Success toast */}
              {actionSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, marginBottom: 16 }}>
                  <CheckCircle size={14} color="#16a34a" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>{actionSuccess}</span>
                </div>
              )}

              {/* ── PROPERTY SECTION ──────────────────────────────────── */}
              <div style={{ marginBottom: 20 }}>
                <SectionTitle title="Property" />
                <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{tour.property.name}</p>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={10} /> {tour.property.location}
                  </p>
                  {tour.property.price && (
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#475569" }}>{tour.property.price}</p>
                  )}
                </div>
              </div>

              {/* ── CUSTOMER SECTION ──────────────────────────────────── */}
              <div style={{ marginBottom: 20 }}>
                <SectionTitle title="Customer" />
                <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={14} color="#64748b" />
                    </div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{tour.customer.name}</p>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    <Phone size={11} color="#94a3b8" /> {tour.customer.phone}
                  </p>
                  {tour.customer.email && (
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                      <Mail size={11} color="#94a3b8" /> {tour.customer.email}
                    </p>
                  )}
                </div>
              </div>

              {/* ── ASSIGNED AGENT ──────────────────────────────────────── */}
              <div style={{ marginBottom: 20 }}>
                <SectionTitle title="Assigned Agent" />
                <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                  {tour.agent ? (
                    <>
                      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{tour.agent}</p>
                      {tour.agentPhone && (
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                          <Phone size={11} color="#94a3b8" /> {tour.agentPhone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>No agent assigned</p>
                  )}
                </div>
              </div>

              {/* ── PREFERRED SLOTS ─────────────────────────────────────── */}
              <div style={{ marginBottom: 20 }}>
                <SectionTitle title="Preferred Slots" />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(tour.preferredSlots ?? [tour.preferredSlot]).filter(Boolean).map((slot, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fafafa", borderRadius: 9, border: "1px solid #f1f5f9" }}>
                      <Calendar size={12} color="#94a3b8" />
                      <span style={{ fontSize: 12, color: "#475569" }}>Slot {idx + 1}: {slot}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── FINAL SCHEDULED SLOT ────────────────────────────────── */}
              <div style={{ marginBottom: 20 }}>
                <SectionTitle title="Final Scheduled Slot" />
                {tour.finalSlot ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                    <Calendar size={13} color="#16a34a" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>{tour.finalSlot}</span>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontStyle: "italic", padding: "8px 0" }}>Not set yet</p>
                )}
              </div>

              {/* ── VISIT TYPE + SOURCE ─────────────────────────────────── */}
              <div style={{ marginBottom: 20 }}>
                <SectionTitle title="Visit Type" />
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
                    {tour.visitType === "virtual"
                      ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> virtual</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> physical</>
                    }
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SOURCE</span>
                    <SourceIcon source={tour.source} />
                  </div>
                </div>
              </div>

              {/* ── STATUS HISTORY ──────────────────────────────────────── */}
              <div style={{ marginBottom: 8 }}>
                <SectionTitle title="Status History" />
                {/* 🧠 Timeline pattern:
                    Vertical line + dots + text
                    Har history item ek event hai */}
                <div style={{ position: "relative", paddingLeft: 20 }}>
                  {/* Vertical line */}
                  <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: "#e2e8f0", borderRadius: 2 }} />
                  {(tour.statusHistory ?? [
                    { label: `Created: ${tour.createdAt}`, color: "#1e293b" },
                    tour.status === "Confirmed" && { label: `Confirmed: ${tour.finalSlot ?? "—"}`, color: "#16a34a" },
                    { label: `Last updated: ${tour.createdAt}`, color: "#94a3b8" },
                  ]).filter(Boolean).map((h, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, position: "relative" }}>
                      {/* Dot */}
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: h.color, border: "2px solid #fff", boxShadow: `0 0 0 1px ${h.color}`, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: "#475569" }}>{h.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ACTION BUTTONS (Fixed at bottom) ─────────────────────────
                🧠 Concept: Fixed bottom section — scroll se affect nahi hota
                   Har button ek action trigger karta hai
                   Disabled state: already us status pe hai to button disable
            ─── */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, background: "#fff" }}>

              {/* 1. Reassign Agent — outline button */}
              <button
                onClick={() => setShowReassign(true)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", border: "1.5px solid #e2e8f0", borderRadius: 11, fontSize: 13, fontWeight: 700, color: "#334155", background: "#fff", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#1e293b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <User size={15} /> Reassign Agent
              </button>

              {/* 2. Propose Schedule — outline button */}
              <button
                onClick={() => setShowSchedule(true)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", border: "1.5px solid #e2e8f0", borderRadius: 11, fontSize: 13, fontWeight: 700, color: "#334155", background: "#fff", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#1e293b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <Calendar size={15} /> Propose Schedule
              </button>

              {/* 3. Mark Confirmed — dark filled button
                  Disabled agar already Confirmed ya Completed ya Cancelled hai */}
              <button
                onClick={handleConfirm}
                disabled={["Confirmed","Completed","Cancelled"].includes(tour.status)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", border: "none", borderRadius: 11, fontSize: 13, fontWeight: 700, color: "#fff", background: ["Confirmed","Completed","Cancelled"].includes(tour.status) ? "#94a3b8" : "#1e3a5f", cursor: ["Confirmed","Completed","Cancelled"].includes(tour.status) ? "not-allowed" : "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { if (!["Confirmed","Completed","Cancelled"].includes(tour.status)) e.currentTarget.style.background = "#0f2a4a"; }}
                onMouseLeave={(e) => { if (!["Confirmed","Completed","Cancelled"].includes(tour.status)) e.currentTarget.style.background = "#1e3a5f"; }}
              >
                <CheckCircle size={15} /> Mark Confirmed
              </button>

              {/* 4. Mark Completed — ghost/text button */}
              <button
                onClick={handleComplete}
                disabled={["Completed","Cancelled"].includes(tour.status)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px", border: "none", borderRadius: 11, fontSize: 13, fontWeight: 600, color: ["Completed","Cancelled"].includes(tour.status) ? "#cbd5e1" : "#475569", background: "transparent", cursor: ["Completed","Cancelled"].includes(tour.status) ? "not-allowed" : "pointer" }}
                onMouseEnter={(e) => { if (!["Completed","Cancelled"].includes(tour.status)) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Mark Completed
              </button>

              {/* 5. Cancel Tour — red destructive button
                  🧠 Destructive actions ke liye red color — user ko warning milti hai */}
              <button
                onClick={() => setShowCancel(true)}
                disabled={["Completed","Cancelled"].includes(tour.status)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", border: "none", borderRadius: 11, fontSize: 13, fontWeight: 700, color: "#fff", background: ["Completed","Cancelled"].includes(tour.status) ? "#fca5a5" : "#ef4444", cursor: ["Completed","Cancelled"].includes(tour.status) ? "not-allowed" : "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { if (!["Completed","Cancelled"].includes(tour.status)) e.currentTarget.style.background = "#dc2626"; }}
                onMouseLeave={(e) => { if (!["Completed","Cancelled"].includes(tour.status)) e.currentTarget.style.background = "#ef4444"; }}
              >
                <XCircle size={15} /> Cancel Tour
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── MODALS ───────────────────────────────────────────────────────────
          🧠 Modals drawer ke bahar render hote hain (zIndex: 200 > drawer: 100)
          Taki drawer ke upar dikhein
      ─── */}
      {showReassign && (
        <ReassignModal
          currentAgent={tour?.agent}
          onConfirm={handleReassign}
          onClose={() => setShowReassign(false)}
        />
      )}
      {showSchedule && (
        <ProposeScheduleModal
          onConfirm={handleProposeSchedule}
          onClose={() => setShowSchedule(false)}
        />
      )}
      {showCancel && (
        <CancelConfirmModal
          tourId={tour?.id}
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
        />
      )}
    </>
  );
}