// 📁 src/features/admin/components/TourDetailDrawer.jsx

import { useState, useEffect } from "react";
import { X, User, Calendar, MapPin, Phone, Mail, CheckCircle, XCircle } from "lucide-react";
import {
  cancelTourRequest,
  completeTourRequest,
  confirmTourRequest,
  rescheduleTourRequest,
} from "../api/tourRequestsApi";

// ── Status badge ──────────────────────────────────────────────────────────────
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
    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:s.bg, color:s.color }}>
      {status}
    </span>
  );
}

function SectionTitle({ title }) {
  return (
    <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>
      {title}
    </p>
  );
}

function SourceIcon({ source }) {
  if (source === "app") return (
    <div style={{ width:28, height:28, borderRadius:6, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    </div>
  );
  if (source === "website") return (
    <div style={{ width:28, height:28, borderRadius:6, background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    </div>
  );
  return (
    <div style={{ width:28, height:28, borderRadius:6, background:"#fce7f3", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.83 2 2 0 0 1 3.59 2.63h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.17a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.5z"/></svg>
    </div>
  );
}

// ── Propose Schedule Modal ────────────────────────────────────────────────────
function ProposeScheduleModal({ onConfirm, onClose }) {
  const [slots, setSlots] = useState(["", "", ""]);
  const updateSlot = (idx, val) => setSlots((prev) => prev.map((s, i) => i === idx ? val : s));
  const today = new Date().toISOString().slice(0, 16);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:24, width:380, boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e)=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#0f172a" }}>Propose Schedule</h3>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", padding:4 }}><X size={16}/></button>
        </div>
        <p style={{ margin:"0 0 16px", fontSize:12, color:"#64748b" }}>Suggest up to 3 available time slots</p>

        {slots.map((slot, idx) => (
          <div key={idx} style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:5 }}>
              Slot {idx + 1} {idx === 0 && <span style={{ color:"#ef4444" }}>*</span>}
            </label>
            <div style={{ position:"relative" }}>
              <Calendar size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }}/>
              <input type="datetime-local" value={slot} min={today} onChange={(e) => updateSlot(idx, e.target.value)}
                style={{ width:"100%", paddingLeft:32, paddingRight:12, paddingTop:9, paddingBottom:9, border:`1.5px solid ${slot?"#1e293b":"#e2e8f0"}`, borderRadius:9, fontSize:13, color:"#334155", outline:"none", boxSizing:"border-box" }}/>
            </div>
          </div>
        ))}

        <div style={{ display:"flex", gap:8, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:13, fontWeight:600, color:"#475569", background:"#fff", cursor:"pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(slots.filter(Boolean))} disabled={!slots[0]}
            style={{ flex:1, padding:"10px", border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", background:slots[0]?"#1e293b":"#e2e8f0", cursor:slots[0]?"pointer":"not-allowed" }}>
            Send Proposal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
function CancelConfirmModal({ tourId, onConfirm, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:24, width:340, boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e)=>e.stopPropagation()}>
        <div style={{ width:48, height:48, borderRadius:"50%", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <XCircle size={24} color="#dc2626"/>
        </div>
        <h3 style={{ margin:"0 0 8px", fontSize:15, fontWeight:800, color:"#0f172a", textAlign:"center" }}>Cancel Tour?</h3>
        <p style={{ margin:"0 0 20px", fontSize:13, color:"#64748b", textAlign:"center" }}>
          This action cannot be undone.
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:13, fontWeight:600, color:"#475569", background:"#fff", cursor:"pointer" }}>Keep Tour</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"10px", border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", background:"#dc2626", cursor:"pointer" }}>Yes, Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Drawer ───────────────────────────────────────────────────────────────
export default function TourDetailDrawer({ tour, onClose, onUpdate }) {
  const [showSchedule,  setShowSchedule]  = useState(false);
  const [showCancel,    setShowCancel]    = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError,   setActionError]   = useState("");
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const showSuccess = (msg) => { setActionError(""); setActionSuccess(msg); setTimeout(() => setActionSuccess(""), 2500); };
  const showError   = (msg) => { setActionSuccess(""); setActionError(msg); setTimeout(() => setActionError(""), 3500); };

  const runAction = async (fn) => {
    if (!tour || isSubmitting) return;
    setIsSubmitting(true);
    try { await fn(); }
    catch (err) { showError(err?.response?.data?.message || err?.message || "Unable to update tour."); }
    finally { setIsSubmitting(false); }
  };

  // ── Propose Schedule ──────────────────────────────────────────────────────
  const handleProposeSchedule = (slots) => {
    const primarySlot = slots?.[0];
    if (!primarySlot) { showError("Please choose at least one slot"); return; }
    const [preferredDate, preferredTimeRaw] = primarySlot.split("T");
    const preferredTime = preferredTimeRaw?.slice(0, 5);
    if (!preferredDate || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(preferredTime || "")) { showError("Invalid slot selected"); return; }

    runAction(async () => {
      const updatedTour = await rescheduleTourRequest(tour.id, {
        preferredDate,
        preferredTime,
        reason: "Schedule proposed from admin panel",
      });
      onUpdate({ ...updatedTour, proposedSlots: slots, status: "Proposed" });
      setShowSchedule(false);
      showSuccess("Schedule proposed successfully");
    });
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    runAction(async () => {
      const updatedTour = await confirmTourRequest(tour.id, {});
      onUpdate(updatedTour);
      showSuccess("Tour marked as Confirmed");
    });
  };

  // ── Complete ──────────────────────────────────────────────────────────────
  const handleComplete = () => {
    runAction(async () => {
      const updatedTour = await completeTourRequest(tour.id);
      onUpdate(updatedTour);
      showSuccess("Tour marked as Completed");
    });
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    runAction(async () => {
      const updatedTour = await cancelTourRequest(tour.id, "Cancelled by admin panel");
      onUpdate(updatedTour);
      setShowCancel(false);
      showSuccess("Tour has been cancelled");
    });
  };

  const isOpen = !!tour;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:90, opacity:isOpen?1:0, pointerEvents:isOpen?"auto":"none", transition:"opacity 0.25s ease" }} />

      {/* Drawer panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:380, background:"#fff", zIndex:100, boxShadow:"-4px 0 24px rgba(0,0,0,0.12)", transform:isOpen?"translateX(0)":"translateX(100%)", transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)", display:"flex", flexDirection:"column", fontFamily:"system-ui,sans-serif" }}>

        {!tour ? null : (
          <>
            {/* Header */}
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #f1f5f9", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:13, fontWeight:800, color:"#0f172a", fontFamily:"monospace" }}>{tour.id}</span>
                  <StatusBadge status={tour.status} />
                </div>
                <button onClick={onClose} style={{ padding:6, border:"none", background:"none", cursor:"pointer", color:"#94a3b8", borderRadius:7, display:"flex", alignItems:"center" }}
                  onMouseEnter={(e)=>(e.currentTarget.style.background="#f1f5f9")}
                  onMouseLeave={(e)=>(e.currentTarget.style.background="none")}>
                  <X size={18}/>
                </button>
              </div>
              <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>Created {tour.createdAt}</p>
            </div>

            {/* Scrollable content */}
            <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>

              {/* Toasts */}
              {actionSuccess && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, marginBottom:16 }}>
                  <CheckCircle size={14} color="#16a34a"/>
                  <span style={{ fontSize:12, fontWeight:600, color:"#15803d" }}>{actionSuccess}</span>
                </div>
              )}
              {actionError && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, marginBottom:16 }}>
                  <XCircle size={14} color="#dc2626"/>
                  <span style={{ fontSize:12, fontWeight:600, color:"#b91c1c" }}>{actionError}</span>
                </div>
              )}

              {/* Property */}
              <div style={{ marginBottom:20 }}>
                <SectionTitle title="Property"/>
                <div style={{ padding:"12px 14px", background:"#fafafa", borderRadius:12, border:"1px solid #f1f5f9" }}>
                  <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:700, color:"#0f172a" }}>{tour.property.name}</p>
                  <p style={{ margin:0, fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:4 }}>
                    <MapPin size={10}/> {tour.property.location}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div style={{ marginBottom:20 }}>
                <SectionTitle title="Customer"/>
                <div style={{ padding:"12px 14px", background:"#fafafa", borderRadius:12, border:"1px solid #f1f5f9" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <User size={14} color="#64748b"/>
                    </div>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#0f172a" }}>{tour.customer.name}</p>
                  </div>
                  <p style={{ margin:"0 0 4px", fontSize:12, color:"#64748b", display:"flex", alignItems:"center", gap:6 }}>
                    <Phone size={11} color="#94a3b8"/> {tour.customer.phone}
                  </p>
                  {tour.customer.email && (
                    <p style={{ margin:0, fontSize:12, color:"#64748b", display:"flex", alignItems:"center", gap:6 }}>
                      <Mail size={11} color="#94a3b8"/> {tour.customer.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Preferred Slots */}
              <div style={{ marginBottom:20 }}>
                <SectionTitle title="Preferred Slots"/>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {(tour.preferredSlots ?? [tour.preferredSlot]).filter(Boolean).map((slot, idx) => (
                    <div key={idx} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"#fafafa", borderRadius:9, border:"1px solid #f1f5f9" }}>
                      <Calendar size={12} color="#94a3b8"/>
                      <span style={{ fontSize:12, color:"#475569" }}>Slot {idx+1}: {slot}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Slot */}
              <div style={{ marginBottom:20 }}>
                <SectionTitle title="Final Scheduled Slot"/>
                {tour.finalSlot ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"#f0fdf4", borderRadius:10, border:"1px solid #bbf7d0" }}>
                    <Calendar size={13} color="#16a34a"/>
                    <span style={{ fontSize:13, fontWeight:700, color:"#16a34a" }}>{tour.finalSlot}</span>
                  </div>
                ) : (
                  <p style={{ margin:0, fontSize:13, color:"#94a3b8", fontStyle:"italic", padding:"8px 0" }}>Not set yet</p>
                )}
              </div>

              {/* Visit Type + Source */}
              <div style={{ marginBottom:20 }}>
                <SectionTitle title="Visit Type"/>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, padding:"5px 12px", borderRadius:8, background:"#f1f5f9", color:"#475569", border:"1px solid #e2e8f0" }}>
                    {tour.visitType === "virtual"
                      ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> virtual</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> physical</>
                    }
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>SOURCE</span>
                    <SourceIcon source={tour.source}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ padding:"14px 20px", borderTop:"1px solid #f1f5f9", display:"flex", flexDirection:"column", gap:8, flexShrink:0, background:"#fff" }}>

              {/* Propose Schedule */}
              <button onClick={() => setShowSchedule(true)} disabled={isSubmitting}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", border:"1.5px solid #e2e8f0", borderRadius:11, fontSize:13, fontWeight:700, color:"#334155", background:"#fff", cursor:isSubmitting?"not-allowed":"pointer", opacity:isSubmitting?0.6:1 }}
                onMouseEnter={(e)=>{ e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.borderColor="#1e293b"; }}
                onMouseLeave={(e)=>{ e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e2e8f0"; }}>
                <Calendar size={15}/> Propose Schedule
              </button>

              {/* Mark Confirmed */}
              <button onClick={handleConfirm}
                disabled={isSubmitting || ["Confirmed","Completed","Cancelled"].includes(tour.status)}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", border:"none", borderRadius:11, fontSize:13, fontWeight:700, color:"#fff", background:isSubmitting||["Confirmed","Completed","Cancelled"].includes(tour.status)?"#94a3b8":"#1e3a5f", cursor:isSubmitting||["Confirmed","Completed","Cancelled"].includes(tour.status)?"not-allowed":"pointer" }}>
                <CheckCircle size={15}/> Mark Confirmed
              </button>

              {/* Mark Completed */}
              <button onClick={handleComplete}
                disabled={isSubmitting || ["Completed","Cancelled"].includes(tour.status)}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"9px", border:"none", borderRadius:11, fontSize:13, fontWeight:600, color:isSubmitting||["Completed","Cancelled"].includes(tour.status)?"#cbd5e1":"#475569", background:"transparent", cursor:isSubmitting||["Completed","Cancelled"].includes(tour.status)?"not-allowed":"pointer" }}>
                Mark Completed
              </button>

              {/* Cancel Tour */}
              <button onClick={() => setShowCancel(true)}
                disabled={isSubmitting || ["Completed","Cancelled"].includes(tour.status)}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", border:"none", borderRadius:11, fontSize:13, fontWeight:700, color:"#fff", background:isSubmitting||["Completed","Cancelled"].includes(tour.status)?"#fca5a5":"#ef4444", cursor:isSubmitting||["Completed","Cancelled"].includes(tour.status)?"not-allowed":"pointer" }}>
                <XCircle size={15}/> Cancel Tour
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
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