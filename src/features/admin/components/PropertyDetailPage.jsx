// 📁 src/features/admin/components/PropertyDetailPage.jsx

import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Home, User, Calendar, Clock, Activity, Trash2, AlertTriangle, CheckCircle, XCircle, EyeOff, Eye, Video, Play, Upload, CheckCircle2 } from "lucide-react";
import { MOCK_MODE, fetchPropertyDetail, deleteProperty, approveProperty, rejectProperty, unpublishProperty, republishProperty, uploadPropertyVideo, deletePropertyVideo, markPropertySold } from "../api/propertiesApi";
import PropertyActionsMenu from "./PropertyActionsMenu";

const STATUS_STYLE = {
  published:          { bg: "#dcfce7", color: "#166534", label: "Published" },
  draft:              { bg: "#f1f5f9", color: "#475569", label: "Draft"      },
  archived:           { bg: "#fee2e2", color: "#dc2626", label: "Archived"   },
  active:             { bg: "#dcfce7", color: "#166534", label: "Active"     },
  inactive:           { bg: "#f1f5f9", color: "#475569", label: "Inactive"   },
  pending:            { bg: "#fef9c3", color: "#854d0e", label: "Pending"    },
  "pending approval": { bg: "#fef9c3", color: "#854d0e", label: "Pending"    },
  rejected:           { bg: "#fee2e2", color: "#dc2626", label: "Rejected"   },
  sold:               { bg: "#ede9fe", color: "#6d28d9", label: "Sold"       },
};
const TABS = ["Details", "Description", "Documents", "Videos"];

function fmtDate(val) {
  if (!val) return "-";
  return new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtPrice(value, currency = "USD") {
  if (typeof value === "number") {
    try { return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
    catch { return `${currency} ${value}`; }
  }
  if (typeof value === "string" && value.trim()) return value;
  return "-";
}
function ImgPlaceholder({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, padding:"12px 18px", borderRadius:12,
      background: toast.type==="error" ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${toast.type==="error" ? "#fecaca" : "#bbf7d0"}`,
      color: toast.type==="error" ? "#b91c1c" : "#166534",
      fontSize:13, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.12)",
      display:"flex", alignItems:"center", gap:8, fontFamily:"system-ui,sans-serif" }}>
      {toast.type==="error" ? <XCircle size={15}/> : <CheckCircle size={15}/>}
      {toast.message}
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteConfirmModal({ property, onConfirm, onCancel, isDeleting }) {
  return (
    <div onClick={isDeleting ? undefined : onCancel}
      style={{ position:"fixed", inset:0, zIndex:4000, background:"rgba(15,23,42,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={(e)=>e.stopPropagation()}
        style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", overflow:"hidden" }}>
        <div style={{ padding:"20px 20px 0", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"#fef2f2", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
            <AlertTriangle size={26} color="#dc2626"/>
          </div>
          <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:800, color:"#000000" }}>Delete Property?</h3>
          <p style={{ margin:"0 0 6px", fontSize:13, color:"#64748b", lineHeight:1.6 }}>Are you sure you want to delete</p>
          <p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:"#00000", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 14px", maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {property?.title ?? "this property"}
          </p>
          <p style={{ margin:"0 0 4px", fontSize:12, color:"#94a3b8" }}>This action <strong style={{ color:"#dc2626" }}>cannot be undone</strong>.</p>
        </div>
        <div style={{ padding:20, display:"flex", gap:10 }}>
          <button type="button" onClick={onCancel} disabled={isDeleting}
            style={{ flex:1, padding:"11px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600, cursor:isDeleting?"not-allowed":"pointer", opacity:isDeleting?0.6:1 }}>Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isDeleting}
            style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:isDeleting?"#f87171":"#dc2626", color:"#fff", fontSize:13, fontWeight:700, cursor:isDeleting?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}
            onMouseEnter={(e)=>{ if(!isDeleting) e.currentTarget.style.background="#b91c1c"; }}
            onMouseLeave={(e)=>{ if(!isDeleting) e.currentTarget.style.background="#dc2626"; }}>
            <Trash2 size={14}/>{isDeleting?"Deleting...":"Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ property, onConfirm, onCancel, isRejecting }) {
  const [reason, setReason] = useState("");
  return (
    <div onClick={isRejecting ? undefined : onCancel}
      style={{ position:"fixed", inset:0, zIndex:4000, background:"rgba(15,23,42,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={(e)=>e.stopPropagation()}
        style={{ width:"100%", maxWidth:460, background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", overflow:"hidden", fontFamily:"system-ui,sans-serif" }}>
        <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:"#fef2f2", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <XCircle size={20} color="#dc2626"/>
          </div>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#000000" }}>Reject Property</h3>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>{property?.title}</p>
          </div>
        </div>
        <div style={{ padding:"16px 20px" }}>
          <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:8 }}>
            Reason for rejection <span style={{ color:"#dc2626" }}>*</span>
          </label>
          <textarea value={reason} onChange={(e)=>setReason(e.target.value)}
            placeholder="Describe why this property is being rejected (min 10 characters)..."
            rows={4}
            style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:"1px solid #e2e8f0", fontSize:13, color:"#000000", resize:"vertical", outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" }}
            onFocus={(e)=>(e.target.style.borderColor="#2D368E")}
            onBlur={(e)=>(e.target.style.borderColor="#e2e8f0")} />
          <p style={{ margin:"6px 0 0", fontSize:11, color:"#94a3b8" }}>{reason.length}/500 (min 10)</p>
        </div>
        <div style={{ padding:"12px 20px", borderTop:"1px solid #f1f5f9", display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button type="button" onClick={onCancel}
            style={{ padding:"9px 18px", borderRadius:9, border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancel</button>
          <button type="button" onClick={()=>onConfirm(reason)} disabled={isRejecting||reason.trim().length<10}
            style={{ padding:"9px 18px", borderRadius:9, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:700, cursor:(isRejecting||reason.trim().length<10)?"not-allowed":"pointer", opacity:reason.trim().length<10?0.5:1, display:"flex", alignItems:"center", gap:7 }}>
            <XCircle size={14}/>{isRejecting?"Rejecting...":"Reject Property"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Unpublish Modal ───────────────────────────────────────────────────────────
function UnpublishModal({ property, onConfirm, onCancel, isUnpublishing }) {
  const [reason, setReason] = useState("");
  return (
    <div onClick={isUnpublishing ? undefined : onCancel}
      style={{ position:"fixed", inset:0, zIndex:4000, background:"rgba(15,23,42,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={(e)=>e.stopPropagation()}
        style={{ width:"100%", maxWidth:460, background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", overflow:"hidden", fontFamily:"system-ui,sans-serif" }}>
        <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:"#fef9c3", border:"1px solid #fde68a", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <EyeOff size={20} color="#a16207"/>
          </div>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#000000" }}>Unpublish Property</h3>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>{property?.title}</p>
          </div>
        </div>
        <div style={{ padding:"16px 20px" }}>
          <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:8 }}>Reason (optional)</label>
          <textarea value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Reason for unpublishing..." rows={3}
            style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:"1px solid #e2e8f0", fontSize:13, color:"#000000", resize:"vertical", outline:"none", boxSizing:"border-box", fontFamily:"system-ui,sans-serif" }}
            onFocus={(e)=>(e.target.style.borderColor="#2D368E")}
            onBlur={(e)=>(e.target.style.borderColor="#e2e8f0")} />
        </div>
        <div style={{ padding:"12px 20px", borderTop:"1px solid #f1f5f9", display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button type="button" onClick={onCancel}
            style={{ padding:"9px 18px", borderRadius:9, border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancel</button>
          <button type="button" onClick={()=>onConfirm(reason)} disabled={isUnpublishing}
            style={{ padding:"9px 18px", borderRadius:9, border:"none", background:"#a16207", color:"#fff", fontSize:13, fontWeight:700, cursor:isUnpublishing?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:7 }}>
            <EyeOff size={14}/>{isUnpublishing?"Unpublishing...":"Unpublish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab components ────────────────────────────────────────────────────────────
function DetailsTab({ property }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:16, paddingBottom:20, borderBottom:"1px solid #f1f5f9" }}>
        {[{label:"Type",value:property.type??"-"},{label:"Category",value:property.category??"-"},{label:"Intent",value:property.intent??"-"},{label:"Visibility",value:property.visibility??"Public"}]
          .map(({label,value})=>(
            <div key={label}>
              <p style={{ margin:"0 0 5px", fontSize:11, color:"#00000", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</p>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#000000" }}>{value}</p>
            </div>
          ))}
      </div>
      <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
        {[`${property.bedrooms??property.beds??0} Bedrooms`,`${property.bathrooms??property.baths??0} Bathrooms`,`${property.area??0} sqft`]
          .map(label=><span key={label} style={{ fontSize:13, color:"#475569", fontWeight:600 }}>{label}</span>)}
      </div>
      {property.amenities?.length>0&&(
        <div>
          <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:700, color:"#374151" }}>Amenities</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {property.amenities.map(a=><span key={a} style={{ fontSize:12, padding:"4px 14px", borderRadius:99, background:"#f1f5f9", color:"#475569", border:"1px solid #e2e8f0", fontWeight:500 }}>{a}</span>)}
          </div>
        </div>
      )}
      {property.highlights?.length>0&&(
        <div>
          <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:700, color:"#374151" }}>Highlights</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {property.highlights.map(h=><span key={h} style={{ fontSize:12, padding:"4px 14px", borderRadius:99, background:"#fef9c3", color:"#854d0e", border:"1px solid #fde68a", fontWeight:600 }}>{h}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
function DescriptionTab({ property }) {
  return property.description
    ? <p style={{ margin:0, fontSize:14, color:"#374151", lineHeight:1.75 }}>{property.description}</p>
    : <p style={{ margin:0, fontSize:13, color:"#00000", textAlign:"center", padding:"32px 0" }}>No description available</p>;
}
function DocumentsTab({ property }) {
  const docs=property.documents??[];
  if(!docs.length) return <p style={{ margin:0, fontSize:13, color:"#00000", textAlign:"center", padding:"32px 0" }}>No documents attached</p>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {docs.map((doc,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#f8fafc", borderRadius:10, border:"1px solid #f1f5f9" }}>
          <span style={{ fontSize:20 }}>📄</span>
          <span style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{doc.name??`Document ${i+1}`}</span>
        </div>
      ))}
    </div>
  );
}
function buildActivity(property) {
  const fmt=(d)=>d?new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"-";
  const log=[{user:property.createdBy??"Admin User",action:"Created",date:fmt(property.createdAt),detail:null}];
  if(property.updatedAt&&property.updatedAt!==property.createdAt)
    log.push({user:property.createdBy??"Admin User",action:"Updated",date:fmt(property.updatedAt),detail:null});
  if(property.featured)
    log.push({user:property.createdBy??"Admin User",action:"Marked Featured",date:fmt(property.updatedAt||property.createdAt),detail:null});
  return log;
}
function renderImageCell(src,radius,placeholderSize) {
  if(src) return <img src={src} alt="Property" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:radius }}/>;
  return (
    <div style={{ width:"100%", height:"100%", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:radius }}>
      <ImgPlaceholder size={placeholderSize}/>
    </div>
  );
}
function VideosTab({ propertyId, videos = [], onUploadSuccess, onDeleteSuccess, onError }) {
  const videoRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption,      setCaption]      = useState("");
  const [fileError,    setFileError]    = useState("");
  const [deletingId,   setDeletingId]   = useState(null);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { setFileError("Video must be under 100 MB"); return; }
    setSelectedFile(file);
    setFileError("");
    e.target.value = "";
  };

  const uploadMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("video", selectedFile);
      if (caption.trim()) fd.append("caption", caption.trim());
      return uploadPropertyVideo(propertyId, fd);
    },
    onSuccess: () => { setSelectedFile(null); setCaption(""); onUploadSuccess(); },
    onError: (e) => onError(e?.response?.data?.message || "Video upload failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (videoId) => deletePropertyVideo(propertyId, videoId),
    onSuccess: () => { setDeletingId(null); onDeleteSuccess(); },
    onError: (e) => { setDeletingId(null); onError(e?.response?.data?.error?.message || "Could not delete video"); },
  });

  const fmtSize = (b) => b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;

  return (
    <div>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#374151" }}>
          Videos{videos.length > 0 ? ` (${videos.length})` : ""}
        </span>
        <button type="button" onClick={() => videoRef.current?.click()}
          disabled={uploadMutation.isPending}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, border:"none", background:"#2D368E", color:"#fff", fontSize:12, fontWeight:700, cursor:uploadMutation.isPending?"not-allowed":"pointer", opacity:uploadMutation.isPending?0.6:1 }}>
          <Upload size={13} /> Upload Video
        </button>
        <input ref={videoRef} type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
          style={{ display:"none" }} onChange={onFileChange} />
      </div>

      {/* Selected file — preview before upload */}
      {selectedFile && (
        <div style={{ marginBottom:16, padding:"14px 16px", background:"#f8fafc", borderRadius:12, border:"1px solid #e2e8f0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <div style={{ width:38, height:38, borderRadius:8, background:"#eef0fb", border:"1px solid #c7cdf4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Video size={18} color="#2D368E" />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#000000", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selectedFile.name}</p>
              <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8" }}>{fmtSize(selectedFile.size)}</p>
            </div>
            <button type="button" onClick={() => { setSelectedFile(null); setCaption(""); setFileError(""); }}
              style={{ background:"#fee2e2", border:"none", color:"#dc2626", borderRadius:"50%", width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <XCircle size={13} />
            </button>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#475569", marginBottom:4 }}>Caption (optional)</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Virtual walkthrough"
              maxLength={200}
              style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1px solid #e2e8f0", fontSize:12, color:"#000", outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button type="button" onClick={() => { setSelectedFile(null); setCaption(""); }}
              style={{ padding:"7px 14px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              Cancel
            </button>
            <button type="button" onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:8, border:"none", background:"#2D368E", color:"#fff", fontSize:12, fontWeight:700, cursor:uploadMutation.isPending?"not-allowed":"pointer", opacity:uploadMutation.isPending?0.6:1 }}>
              <Upload size={12} />{uploadMutation.isPending ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      )}

      {fileError && (
        <p style={{ fontSize:11, color:"#b91c1c", marginBottom:12 }}>{fileError}</p>
      )}

      {/* Uploading banner */}
      {uploadMutation.isPending && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#eef0fb", border:"1px solid #c7cdf4", borderRadius:10, marginBottom:14, fontSize:13, color:"#2D368E", fontWeight:600 }}>
          <div style={{ width:16, height:16, border:"2px solid #2D368E", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
          Uploading video to Cloudinary…
        </div>
      )}

      {/* Videos grid */}
      {videos.length > 0 ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12 }}>
          {videos.map((v, i) => (
            <div key={v._id || v.publicId || i} style={{ borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0", background:"#f8fafc" }}>
              <div style={{ position:"relative", aspectRatio:"16/9", background:"#e2e8f0", overflow:"hidden" }}>
                {v.thumbnail
                  ? <img src={v.thumbnail} alt="video thumbnail" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : (
                    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#dde1f0" }}>
                      <Video size={28} color="#94a3b8" strokeWidth={1.5} />
                    </div>
                  )
                }
                <a href={v.url} target="_blank" rel="noreferrer"
                  style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.22)", textDecoration:"none" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.18)" }}>
                    <Play size={16} color="#2D368E" fill="#2D368E" />
                  </div>
                </a>
                {/* Delete button */}
                {v._id && (
                  <button type="button"
                    disabled={deleteMutation.isPending}
                    onClick={(e) => { e.preventDefault(); setDeletingId(v._id); deleteMutation.mutate(v._id); }}
                    style={{ position:"absolute", top:6, right:6, width:24, height:24, borderRadius:"50%",
                      border:"none", background: deletingId===v._id ? "rgba(185,28,28,0.9)" : "rgba(0,0,0,0.55)",
                      color:"#fff", cursor: deleteMutation.isPending?"not-allowed":"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, lineHeight:1 }}>
                    {deletingId===v._id && deleteMutation.isPending ? "…" : "×"}
                  </button>
                )}
              </div>
              {v.caption && (
                <p style={{ margin:"8px 10px", fontSize:11, color:"#475569", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.caption}</p>
              )}
            </div>
          ))}
        </div>
      ) : !selectedFile && (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <Video size={32} strokeWidth={1.2} style={{ color:"#cbd5e1", marginBottom:10 }} />
          <p style={{ margin:0, fontSize:13, color:"#94a3b8" }}>No videos yet — click <strong>Upload Video</strong> to add one</p>
        </div>
      )}
    </div>
  );
}

function LoadingView({ onBack }) {
  return (
    <div style={{ padding:"24px 28px", minHeight:"100%", background:"#f8fafc", fontFamily:"system-ui,sans-serif" }}>
      <button onClick={onBack} style={{ marginBottom:16, padding:"7px 9px", border:"1px solid #e2e8f0", borderRadius:9, background:"#fff", cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      {[...Array(6)].map((_,i)=><div key={i} style={{ height:52, background:"#f1f5f9", borderRadius:10, marginBottom:10 }}/>)}
    </div>
  );
}
function EmptyView({ onBack }) {
  return (
    <div style={{ padding:"24px 28px", minHeight:"100%", background:"#f8fafc", fontFamily:"system-ui,sans-serif" }}>
      <button onClick={onBack} style={{ marginBottom:20, padding:"7px 9px", border:"1px solid #e2e8f0", borderRadius:9, background:"#fff", cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:20, textAlign:"center", color:"#00000", fontSize:14 }}>Property details unavailable.</div>
    </div>
  );
}

// ── Admin Action Bar ──────────────────────────────────────────────────────────
function AdminActionBar({ property, onApprove, onReject, onUnpublish, onRepublish, onMarkSold, isLoading }) {
  const rawStatus        = property.rawStatus?.toLowerCase() ?? "";
  const mappedStatus     = property.status?.toLowerCase() ?? "";
  const approvalStatus   = property.approvalStatus?.status?.toLowerCase() ?? "";

  // isPending: main status OR approvalStatus is pending
  const isPending  = ["pending", "pending_approval", "pending approval"].includes(rawStatus)
                  || mappedStatus === "pending approval"
                  || approvalStatus === "pending";

  // isActive: live on site
  const isActive   = ["active","approved","published"].includes(rawStatus)
                  || ["active"].includes(mappedStatus);

  // isInactive: hidden but not deleted
  const isInactive = ["inactive","draft","sold","rented"].includes(rawStatus)
                  || ["draft","archived"].includes(mappedStatus);

  // isRejected
  const isRejected = rawStatus === "rejected"
                  || mappedStatus === "rejected"
                  || approvalStatus === "rejected";

  if (!isPending && !isActive && !isInactive && !isRejected) return null;

  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
      <div>
        <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#000000" }}>Admin Actions</p>
        <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>
          {isPending  && "This property is awaiting your approval"}
          {isActive   && "This property is currently live and visible to users"}
          {isInactive && "This property is currently hidden"}
          {isRejected && "This property has been rejected"}
        </p>
      </div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {isPending && (
          <>
            <button type="button" onClick={onReject} disabled={isLoading}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"1px solid #fecaca", background:"#fef2f2", color:"#dc2626", fontSize:13, fontWeight:700, cursor:isLoading?"not-allowed":"pointer", opacity:isLoading?0.6:1 }}>
              <XCircle size={15}/> Reject
            </button>
            <button type="button" onClick={onApprove} disabled={isLoading}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"none", background:"#2D368E", color:"#fff", fontSize:13, fontWeight:700, cursor:isLoading?"not-allowed":"pointer", opacity:isLoading?0.6:1 }}>
              <CheckCircle size={15}/> Approve & Publish
            </button>
          </>
        )}
        {isActive && (
          <>
            <button type="button" onClick={onMarkSold} disabled={isLoading}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"1px solid #bbf7d0", background:"#dcfce7", color:"#15803d", fontSize:13, fontWeight:700, cursor:isLoading?"not-allowed":"pointer", opacity:isLoading?0.6:1 }}>
              <CheckCircle2 size={15}/> {property?.purpose === "rent" ? "Mark as Rented" : "Mark as Sold"}
            </button>
            <button type="button" onClick={onUnpublish} disabled={isLoading}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"1px solid #fde68a", background:"#fef9c3", color:"#a16207", fontSize:13, fontWeight:700, cursor:isLoading?"not-allowed":"pointer", opacity:isLoading?0.6:1 }}>
              <EyeOff size={15}/> Unpublish
            </button>
          </>
        )}
        {(isInactive||isRejected) && (
          <button type="button" onClick={onRepublish} disabled={isLoading}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"none", background:"#2D368E", color:"#fff", fontSize:13, fontWeight:700, cursor:isLoading?"not-allowed":"pointer", opacity:isLoading?0.6:1 }}>
            <Eye size={15}/> Republish
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PropertyDetailPage({ propertyId, property: initialProperty, onBack, onEditProperty, onAssignAgent }) {
  const [activeTab,         setActiveTab]         = useState("Details");
  const [showDeleteModal,   setShowDeleteModal]   = useState(false);
  const [showRejectModal,   setShowRejectModal]   = useState(false);
  const [showUnpublishModal,setShowUnpublishModal]= useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => { setToast({type,message}); setTimeout(()=>setToast(null),3500); };

  const fallbackProperty = useMemo(() => {
    if (!initialProperty) return null;
    return { ...initialProperty, images:Array.isArray(initialProperty.images)?initialProperty.images:[], currency:initialProperty.currency||"USD", intent:initialProperty.intent||"For Sale", documents:Array.isArray(initialProperty.documents)?initialProperty.documents:[] };
  }, [initialProperty]);

  const shouldFetch = Boolean(propertyId) && !MOCK_MODE;
  const { data: apiProperty, isLoading, isError } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => fetchPropertyDetail(propertyId),
    enabled: shouldFetch,
    staleTime: 1000*60*2,
  });

  const queryClient = useQueryClient();
  const invalidate = () => { queryClient.invalidateQueries({queryKey:["properties"]}); queryClient.invalidateQueries({queryKey:["property",propertyId]}); };

  const deleteMutation    = useMutation({ mutationFn:()=>deleteProperty(propertyId),    onSuccess:()=>{invalidate();setShowDeleteModal(false);onBack();}, onError:(e)=>{setShowDeleteModal(false);showToast("error",e?.response?.data?.message||"Could not delete");} });
  const approveMutation   = useMutation({ mutationFn:()=>approveProperty(propertyId),   onSuccess:()=>{invalidate();showToast("success","Property approved and published!");}, onError:(e)=>showToast("error",e?.response?.data?.message||"Could not approve") });
  const rejectMutation    = useMutation({ mutationFn:(reason)=>rejectProperty(propertyId,reason),    onSuccess:()=>{invalidate();setShowRejectModal(false);showToast("success","Property rejected");}, onError:(e)=>{setShowRejectModal(false);showToast("error",e?.response?.data?.message||"Could not reject");} });
  const unpublishMutation = useMutation({ mutationFn:(reason)=>unpublishProperty(propertyId,reason), onSuccess:()=>{invalidate();setShowUnpublishModal(false);showToast("success","Property unpublished");}, onError:(e)=>{setShowUnpublishModal(false);showToast("error",e?.response?.data?.message||"Could not unpublish");} });
  const republishMutation = useMutation({ mutationFn:()=>republishProperty(propertyId), onSuccess:()=>{invalidate();showToast("success","Property republished!");}, onError:(e)=>showToast("error",e?.response?.data?.message||"Could not republish") });
  const markSoldMutation  = useMutation({ mutationFn:()=>markPropertySold(propertyId),  onSuccess:()=>{invalidate();showToast("success","Property marked as sold/rented!");}, onError:(e)=>showToast("error",e?.response?.data?.message||"Could not update status") });

  const isActionLoading = approveMutation.isPending||rejectMutation.isPending||unpublishMutation.isPending||republishMutation.isPending||markSoldMutation.isPending;
  const property = apiProperty ?? fallbackProperty;

  if (isLoading && !property) return <LoadingView onBack={onBack}/>;
  if (!property) return <EmptyView onBack={onBack}/>;

  const statusKey  = property.status?.toLowerCase()??"draft";
  const status     = STATUS_STYLE[statusKey]??STATUS_STYLE.draft;
  const activity   = buildActivity(property);
  const images     = Array.isArray(property.images)?property.images.filter(Boolean):[];
  const mainImage  = images[0]||null;
  const sideImages = images.slice(1,5);

  return (
    <div style={{ padding:"24px 28px", minHeight:"100%", background:"#f8fafc", fontFamily:"system-ui,sans-serif" }}>
      <Toast toast={toast}/>

      {showDeleteModal    && <DeleteConfirmModal  property={property} isDeleting={deleteMutation.isPending}       onConfirm={()=>deleteMutation.mutate()}         onCancel={()=>setShowDeleteModal(false)}/>}
      {showRejectModal    && <RejectModal         property={property} isRejecting={rejectMutation.isPending}      onConfirm={(r)=>rejectMutation.mutate(r)}        onCancel={()=>setShowRejectModal(false)}/>}
      {showUnpublishModal && <UnpublishModal      property={property} isUnpublishing={unpublishMutation.isPending} onConfirm={(r)=>unpublishMutation.mutate(r)}    onCancel={()=>setShowUnpublishModal(false)}/>}

      {isError&&fallbackProperty&&(
        <div style={{ marginBottom:12, background:"#fef2f2", border:"1px solid #fecaca", color:"#b91c1c", borderRadius:10, padding:"10px 12px", fontSize:12 }}>
          Could not load latest property details. Showing available data.
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
          <button onClick={onBack} style={{ marginTop:4, padding:"7px 9px", border:"1px solid #e2e8f0", borderRadius:9, background:"#fff", cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center", boxShadow:"0 1px 2px rgba(0,0,0,0.04)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:6 }}>
              <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#000000" }}>{property.title??"Property Details"}</h1>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 11px", borderRadius:99, background:status.bg, color:status.color }}>{status.label}</span>
              {property.featured&&<span style={{ fontSize:11, fontWeight:700, padding:"3px 11px", borderRadius:99, background:"#fef9c3", color:"#854d0e" }}>Featured</span>}
            </div>
            <p style={{ margin:0, fontSize:12, color:"#94a3b8", display:"flex", alignItems:"center", gap:5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {property.location??"-"}
            </p>
          </div>
        </div>
        {(onEditProperty || onAssignAgent)
          ? <PropertyActionsMenu property={property} onEditProperty={onEditProperty} onDeleteProperty={()=>setShowDeleteModal(true)} onAssignAgent={onAssignAgent}/>
          : <button style={{ padding:"7px 9px", border:"1px solid #e2e8f0", borderRadius:9, background:"#fff", cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center" }}><MoreHorizontal size={18}/></button>
        }
      </div>

      {/* Admin Action Bar */}
      <AdminActionBar
        property={property} isLoading={isActionLoading}
        onApprove={()=>approveMutation.mutate()}
        onReject={()=>setShowRejectModal(true)}
        onUnpublish={()=>setShowUnpublishModal(true)}
        onRepublish={()=>republishMutation.mutate()}
        onMarkSold={()=>markSoldMutation.mutate()}
      />

      {/* Body */}
      <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gridTemplateRows:"180px 180px", gap:8, borderRadius:14, overflow:"hidden" }}>
            <div style={{ gridRow:"1 / 3", gridColumn:"1 / 2", background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:12, overflow:"hidden" }}>
              {renderImageCell(mainImage,12,52)}
            </div>
            {[...Array(4)].map((_,i)=>(
              <div key={i} style={{ background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:8, overflow:"hidden" }}>
                {renderImageCell(sideImages[i]||null,8,28)}
              </div>
            ))}
          </div>

          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", overflow:"hidden" }}>
            <div style={{ display:"flex", borderBottom:"1px solid #f1f5f9", padding:"0 8px", background:"#fafafa" }}>
              {TABS.map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} style={{ padding:"13px 18px", background:"transparent", border:"none", cursor:"pointer", fontSize:13, fontWeight:activeTab===tab?700:500, color:activeTab===tab?"#000000":"#94a3b8", borderBottom:activeTab===tab?"2px solid #2D368E":"2px solid transparent", marginBottom:-1, transition:"all 0.15s" }}>{tab}</button>
              ))}
            </div>
            <div style={{ padding:24 }}>
              {activeTab==="Details"     && <DetailsTab     property={property}/>}
              {activeTab==="Description" && <DescriptionTab property={property}/>}
              {activeTab==="Documents"   && <DocumentsTab   property={property}/>}
              {activeTab==="Videos"      && (
                <VideosTab
                  propertyId={propertyId}
                  videos={property.videos ?? []}
                  onUploadSuccess={() => { invalidate(); showToast("success", "Video uploaded successfully!"); }}
                  onDeleteSuccess={() => { invalidate(); showToast("success", "Video deleted"); }}
                  onError={(msg) => showToast("error", msg)}
                />
              )}
            </div>
          </div>
        </div>

        <div style={{ width:300, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:24 }}>
            <p style={{ margin:"0 0 4px", fontSize:28, fontWeight:900, color:"#000000", letterSpacing:"-0.5px" }}>{fmtPrice(property.price,property.currency)}</p>
            <p style={{ margin:0, fontSize:12, color:"#94a3b8" }}>{property.intent??"For Sale"}</p>
          </div>

          {/* Agent Card */}
          {(property.assignedAgent ?? property.assignedTo) && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#374151", display:"flex", alignItems:"center", gap:7 }}>
                  <User size={14} color="#64748b"/> Assigned Agent
                </p>
                {onAssignAgent && (
                  <button type="button" onClick={()=>onAssignAgent(property)}
                    style={{ fontSize:11, fontWeight:600, color:"#2D368E", background:"#eef0fb", border:"1px solid #c7cdf4", borderRadius:6, padding:"3px 9px", cursor:"pointer" }}>
                    Reassign
                  </button>
                )}
              </div>
              {/* Avatar + name row */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, paddingBottom:14, borderBottom:"1px solid #f1f5f9" }}>
                {property.agentAvatar
                  ? <img src={property.agentAvatar} alt="" style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", border:"2px solid #e2e8f0", flexShrink:0 }} />
                  : (
                    <div style={{ width:44, height:44, borderRadius:"50%", background:"#2D368E", border:"2px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:15, fontWeight:800, color:"#fff", letterSpacing:0 }}>
                        {(property.assignedAgent ?? property.assignedTo ?? "?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
                      </span>
                    </div>
                  )
                }
                <div style={{ minWidth:0 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#000", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {property.assignedAgent ?? property.assignedTo}
                  </p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8" }}>Agent</p>
                </div>
              </div>
              {/* Contact links */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {property.agentEmail && (
                  <a href={`mailto:${property.agentEmail}`}
                    style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", padding:"9px 12px", borderRadius:9, background:"#f8fafc", border:"1px solid #f1f5f9" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#eef0fb"}
                    onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:"#eef0fb", border:"1px solid #c7cdf4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D368E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <span style={{ fontSize:12, color:"#374151", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {property.agentEmail}
                    </span>
                  </a>
                )}
                {property.agentPhone && (
                  <a href={`tel:${property.agentPhone}`}
                    style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", padding:"9px 12px", borderRadius:9, background:"#f8fafc", border:"1px solid #f1f5f9" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"}
                    onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:"#dcfce7", border:"1px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize:12, color:"#374151", fontWeight:500 }}>
                      {property.agentPhone}
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Property Info */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:20 }}>
            <p style={{ margin:"0 0 16px", fontSize:13, fontWeight:700, color:"#374151", display:"flex", alignItems:"center", gap:7 }}><Home size={14} color="#64748b"/> Property Info</p>
            {!(property.assignedAgent ?? property.assignedTo) && onAssignAgent && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f8fafc" }}>
                <span style={{ fontSize:12, color:"#94a3b8", display:"flex", alignItems:"center", gap:6 }}><User size={13} color="#94a3b8"/> Assigned Agent</span>
                <button type="button" onClick={()=>onAssignAgent(property)}
                  style={{ fontSize:11, fontWeight:600, color:"#2D368E", background:"#eef0fb", border:"1px solid #c7cdf4", borderRadius:6, padding:"2px 8px", cursor:"pointer" }}>
                  Assign
                </button>
              </div>
            )}
            {[
              {icon:<User size={13} color="#94a3b8"/>,    label:"Created By",     value:property.createdBy??"Admin User"},
              {icon:<Calendar size={13} color="#94a3b8"/>,label:"Created",        value:fmtDate(property.createdAt)},
              {icon:<Clock size={13} color="#94a3b8"/>,   label:"Last Updated",   value:fmtDate(property.updatedAt)},
            ].map(({icon,label,value})=>(
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f8fafc" }}>
                <span style={{ fontSize:12, color:"#94a3b8", display:"flex", alignItems:"center", gap:6 }}>{icon} {label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#00000", textAlign:"right", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:20 }}>
            <p style={{ margin:"0 0 16px", fontSize:13, fontWeight:700, color:"#374151", display:"flex", alignItems:"center", gap:7 }}><Activity size={14} color="#64748b"/> Activity</p>
            {activity.length===0
              ? <p style={{ fontSize:12, color:"#00000", textAlign:"center", margin:0, padding:"12px 0" }}>No activity yet</p>
              : activity.map((item,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, marginBottom:i<activity.length-1?14:0 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#2D368E", marginTop:5, flexShrink:0 }}/>
                    <div>
                      <p style={{ margin:"0 0 2px", fontSize:13, color:"#374151" }}><strong>{item.user}</strong> {item.action}</p>
                      <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{item.date}</p>
                      {item.detail&&<p style={{ margin:"3px 0 0", fontSize:11, color:"#94a3b8" }}>{item.detail}</p>}
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}