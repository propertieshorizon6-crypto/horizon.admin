// 📁 src/features/admin/components/LeadDetailView.jsx

import { useState } from "react";
import { MoreHorizontal, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ChangePriorityModal from "./ChangePriorityModal";
import { PRIORITY_STYLE, STATUS_STYLE, STATUSES } from "../constants/leadsConfig";
import { timeAgo } from "../../../utils/timeAgo";
import { updateLeadPriority, updateLeadStatus, addLeadNote, fetchLeadNotes, archiveLead, unarchiveLead } from "../api/leadsApi";

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, padding:"11px 16px", borderRadius:10, background:toast.type==="error"?"#fef2f2":"#f0fdf4", border:`1px solid ${toast.type==="error"?"#fecaca":"#bbf7d0"}`, color:toast.type==="error"?"#b91c1c":"#166534", fontSize:13, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.1)", display:"flex", alignItems:"center", gap:8, fontFamily:"system-ui,sans-serif" }}>
      {toast.type==="error" ? <AlertCircle size={14}/> : <CheckCircle size={14}/>}
      {toast.message}
    </div>
  );
}

export default function LeadDetailView({ lead: initialLead, onBack }) {
  const [lead,              setLead]              = useState(initialLead);
  const [activeTab,         setActiveTab]         = useState("Details");
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [toast,             setToast]             = useState(null);
  const queryClient = useQueryClient();

  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 3500); };

  const priStyle = PRIORITY_STYLE[lead.priority] ?? PRIORITY_STYLE["Low"];
  const stsStyle = STATUS_STYLE[lead.status]     ?? STATUS_STYLE["New"];

  const priorityMutation = useMutation({
    mutationFn: (newPriority) => updateLeadPriority(lead.id, newPriority),
    onSuccess: (_, newPriority) => {
      setLead((p) => ({ ...p, priority: newPriority }));
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      showToast("success", `Priority changed to ${newPriority}`);
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not update priority"),
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus) => updateLeadStatus(lead.id, newStatus),
    onSuccess: (_, newStatus) => {
      setLead((p) => ({ ...p, status: newStatus }));
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      showToast("success", `Status changed to ${newStatus}`);
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not update status"),
  });

  const archiveMutation = useMutation({
    mutationFn: () => lead.status === "Archived" ? unarchiveLead(lead.id) : archiveLead(lead.id),
    onSuccess: () => {
      const nowArchived = lead.status !== "Archived";
      setLead((p) => ({ ...p, status: nowArchived ? "Archived" : "New" }));
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      showToast("success", nowArchived ? "Lead archived" : "Lead unarchived");
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not update archive status"),
  });

  const handlePrioritySave = (newPriority) => {
    setShowPriorityModal(false);
    if (newPriority === lead.priority) return;
    priorityMutation.mutate(newPriority);
  };

  return (
    <div style={{ padding:"24px 28px", minHeight:"100%", background:"#f8fafc", fontFamily:"system-ui,sans-serif" }}>
      <Toast toast={toast} />

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
          <button onClick={onBack} style={{ marginTop:5, padding:"6px 8px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#000000" }}>{lead.name}</h1>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:stsStyle.bg, color:stsStyle.color }}>{lead.status}</span>
              <button onClick={() => setShowPriorityModal(true)} title="Click to change priority"
                style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:priStyle.bg, color:priStyle.color, border:`1px solid ${priStyle.border}`, cursor:"pointer", opacity:priorityMutation.isPending?0.6:1 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15" strokeWidth="2"/></svg>
                {priorityMutation.isPending ? "Saving..." : lead.priority}
              </button>
            </div>
            <p style={{ margin:0, fontSize:12, color:"#94a3b8", display:"flex", alignItems:"center", gap:6 }}>
              via {(lead.source ?? "website").toLowerCase()}
              <span style={{ color:"#e2e8f0" }}>·</span>
              {(lead.intent ?? "inquiry").toLowerCase()}
              <span style={{ color:"#e2e8f0" }}>·</span>
              {timeAgo(lead.createdAt)}
            </p>
          </div>
        </div>
        <button style={{ padding:"6px 8px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", cursor:"pointer", color:"#64748b", display:"flex" }}>
          <MoreHorizontal size={18}/>
        </button>
      </div>

      <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>
          <ContactCard lead={lead} />
          <TabsCard lead={lead} activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast} />
        </div>
        <div style={{ width:280, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>
          <QuickActionsCard lead={lead} priStyle={priStyle}
            onStatusChange={(s) => { if (s !== lead.status) statusMutation.mutate(s); }}
            onPriorityClick={() => setShowPriorityModal(true)}
            isStatusLoading={statusMutation.isPending}
            onArchiveClick={() => archiveMutation.mutate()}
            isArchiveLoading={archiveMutation.isPending} />
          <AssignedAgentCard lead={lead} />
          <TimelineCard lead={lead} />
        </div>
      </div>

      {showPriorityModal && (
        <ChangePriorityModal lead={lead} onClose={() => setShowPriorityModal(false)} onSave={handlePrioritySave} />
      )}
    </div>
  );
}

function ContactCard({ lead }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span style={{ fontSize:13, fontWeight:700, color:"#374151" }}>Contact Information</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
        {[
          { label:"Name",  value:lead.name },
          { label:"Email", value:lead.email ?? "—", prefix:"✉ " },
          { label:"Phone", value:lead.phone ?? "—", prefix:"📞 " },
        ].map(({ label, value, prefix="" }) => (
          <div key={label} style={{ background:"#f8fafc", borderRadius:10, border:"1px solid #f1f5f9", padding:"14px 16px" }}>
            <p style={{ margin:"0 0 6px", fontSize:11, color:"#94a3b8", fontWeight:500 }}>{label}</p>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#000000" }}>{prefix}{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabsCard({ lead, activeTab, setActiveTab, showToast }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", overflow:"hidden" }}>
      <div style={{ display:"flex", borderBottom:"1px solid #f1f5f9", padding:"0 8px", background:"#fafafa" }}>
        {["Details","Notes","Activity"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding:"13px 16px", background:"transparent", border:"none", cursor:"pointer", fontSize:13, fontWeight:activeTab===tab?700:500, color:activeTab===tab?"#000000":"#94a3b8", borderBottom:activeTab===tab?"2px solid #2D368E":"2px solid transparent", marginBottom:-1, transition:"all 0.15s" }}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ padding:24 }}>
        {activeTab === "Details"  && <DetailsTab  lead={lead} />}
        {activeTab === "Notes"    && <NotesTab    lead={lead} showToast={showToast} />}
        {activeTab === "Activity" && <ActivityTab lead={lead} />}
      </div>
    </div>
  );
}

function DetailsTab({ lead }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:16 }}>
        {[
          { label:"Source",       value:lead.source ?? "Website", prefix:"🌐 " },
          { label:"Intent",       value:lead.intent ?? "Inquiry" },
          { label:"Created",      value:new Date(lead.createdAt).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) },
          { label:"Last Updated", value:timeAgo(lead.createdAt) },
        ].map(({ label, value, prefix="" }) => (
          <div key={label}>
            <p style={{ margin:"0 0 5px", fontSize:11, color:"#94a3b8", fontWeight:500 }}>{label}</p>
            <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#000000" }}>{prefix}{value}</p>
          </div>
        ))}
      </div>
      {lead.property && (
        <div>
          <p style={{ margin:"0 0 10px", fontSize:13, fontWeight:700, color:"#374151" }}>Linked Property</p>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"#f8fafc", borderRadius:12, border:"1px solid #f1f5f9" }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏢</div>
            <div>
              <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:700, color:"#000000" }}>{lead.property}</p>
              <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>📍 Property</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotesTab({ lead, showToast }) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");

  const { data: notesData, isLoading: isNotesLoading } = useQuery({
    queryKey: ["lead-notes", lead.id],
    queryFn:  () => fetchLeadNotes(lead.id),
    enabled:  Boolean(lead.id),
    staleTime: 1000 * 60,
  });

  const notes = notesData?.notes ?? [];

  const addNoteMutation = useMutation({
    mutationFn: (content) => addLeadNote(lead.id, content),
    onSuccess: () => {
      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["lead-notes", lead.id] });
      showToast("success", "Note added");
    },
    onError: (err) => showToast("error", err?.response?.data?.message || "Could not add note"),
  });

  const handleAdd = () => {
    const content = noteText.trim();
    if (!content || addNoteMutation.isPending) return;
    addNoteMutation.mutate(content);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
        placeholder="Add a note... (Ctrl+Enter to submit)"
        onKeyDown={(e) => { if (e.key==="Enter" && e.ctrlKey) handleAdd(); }}
        style={{ width:"100%", padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:13, color:"#374151", resize:"none", outline:"none", minHeight:80, boxSizing:"border-box", fontFamily:"system-ui,sans-serif" }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end" }}>
        <button onClick={handleAdd} disabled={!noteText.trim() || addNoteMutation.isPending}
          style={{ padding:"8px 18px", background:"#2D368E", color:"#fff", border:"none", borderRadius:8, cursor:addNoteMutation.isPending?"not-allowed":"pointer", fontSize:13, fontWeight:600, opacity:addNoteMutation.isPending?0.7:1 }}>
          {addNoteMutation.isPending ? "Adding..." : "Add Note"}
        </button>
      </div>
      {isNotesLoading ? (
        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:13, padding:"20px 0" }}>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:13, padding:"20px 0" }}>No notes yet</p>
      ) : (
        notes.map((n, i) => (
          <div key={n.id || n._id || i} style={{ padding:"12px 16px", background:"#fefce8", border:"1px solid #fef08a", borderRadius:10 }}>
            <p style={{ margin:"0 0 5px", fontSize:13, color:"#374151" }}>{n.content || n.text}</p>
            <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{timeAgo(n.createdAt)}</p>
          </div>
        ))
      )}
    </div>
  );
}

function ActivityTab({ lead }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {[
        { text:`Lead created from ${lead.source ?? "Website"}`, time:lead.createdAt, icon:"✨", color:"#6366f1" },
        { text:`Priority set to ${lead.priority}`,              time:lead.createdAt, icon:"🚩", color:"#f97316" },
      ].map((act, i) => (
        <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`${act.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{act.icon}</div>
          <div>
            <p style={{ margin:"0 0 2px", fontSize:13, color:"#374151" }}>{act.text}</p>
            <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{timeAgo(act.time)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickActionsCard({ lead, priStyle, onStatusChange, onPriorityClick, isStatusLoading, onArchiveClick, isArchiveLoading }) {
  const isArchived = lead.status === "Archived";
  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:20 }}>
      <p style={{ margin:"0 0 14px", fontSize:13, fontWeight:700, color:"#374151", display:"flex", alignItems:"center", gap:6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Quick Actions
      </p>
      <div style={{ position:"relative", marginBottom:10 }}>
        <select value={lead.status} onChange={(e) => onStatusChange(e.target.value)} disabled={isStatusLoading || isArchived}
          style={{ width:"100%", padding:"10px 36px 10px 14px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, color:"#374151", background:"#fff", cursor:(isStatusLoading||isArchived)?"not-allowed":"pointer", outline:"none", appearance:"none", opacity:(isStatusLoading||isArchived)?0.5:1 }}>
          {STATUSES.filter((s) => s !== "Archived").map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown size={14} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
      </div>
      <button onClick={onPriorityClick}
        style={{ width:"100%", padding:"10px 14px", border:`1px solid ${priStyle.border}`, borderRadius:9, fontSize:13, fontWeight:600, color:priStyle.color, background:priStyle.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15" strokeWidth="2"/></svg>
          {lead.priority}
        </span>
        <ChevronDown size={14} />
      </button>
      <button onClick={onArchiveClick} disabled={isArchiveLoading}
        style={{ width:"100%", padding:"10px 14px", border:`1px solid ${isArchived?"#bae6fd":"#e2e8f0"}`, borderRadius:9, fontSize:13, fontWeight:600, color:isArchived?"#0369a1":"#64748b", background:isArchived?"#f0f9ff":"#f8fafc", cursor:isArchiveLoading?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:8, opacity:isArchiveLoading?0.6:1 }}>
        {isArchived ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
        )}
        {isArchiveLoading ? "Saving..." : isArchived ? "Unarchive Lead" : "Archive Lead"}
      </button>
    </div>
  );
}

function AssignedAgentCard({ lead }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:20 }}>
      <p style={{ margin:"0 0 14px", fontSize:13, fontWeight:700, color:"#374151", display:"flex", alignItems:"center", gap:6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Assigned Agent
      </p>
      {lead.assignedTo ? (
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"#2D368E", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>
            {lead.assignedTo[0]}
          </div>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#000000" }}>{lead.assignedTo}</p>
            <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>Agent</p>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 0" }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
          </div>
          <p style={{ margin:0, fontSize:12, color:"#94a3b8" }}>No agent assigned</p>
        </div>
      )}
    </div>
  );
}

function TimelineCard({ lead }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:20 }}>
      <p style={{ margin:"0 0 14px", fontSize:13, fontWeight:700, color:"#374151", display:"flex", alignItems:"center", gap:6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Timeline
      </p>
      {[
        { label:"Created", value:new Date(lead.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }), icon:"📅" },
        { label:"Updated", value:timeAgo(lead.createdAt), icon:"🕐" },
      ].map(({ label, value, icon }) => (
        <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f8fafc" }}>
          <span style={{ fontSize:12, color:"#64748b", display:"flex", alignItems:"center", gap:6 }}><span>{icon}</span>{label}</span>
          <span style={{ fontSize:12, fontWeight:600, color:"#000000" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}