import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  editProperty,
  fetchPropertyDetail,
  updateFeaturedImage,
  addGalleryImages,
  removeGalleryImage,
  uploadPropertyVideo,
  deletePropertyVideo,
} from "../api/propertiesApi";

const TYPES = ["apartment","house","villa","townhouse","condo","land","commercial"];
const AMENITIES_LIST = [
  "parking","gym","pool","garden","balcony","elevator","security",
  "petFriendly","furnished","airConditioning","heating","fireplace",
  "laundry","dishwasher","hardwoodFloors","internet","cableTV",
  "unfurnished","semi-furnished",
];
const formatAmenity = (a) =>
  a.replace(/([A-Z])/g," $1").replace(/[-_]/g," ").trim()
   .replace(/\b\w/g, (c) => c.toUpperCase());

const labelStyle = { display:"block", fontSize:12, fontWeight:700, color:"#475569", marginBottom:5 };
const inputStyle = {
  width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid #e2e8f0",
  fontSize:13, color:"#000000", background:"#fff", outline:"none", boxSizing:"border-box",
};
const grid2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };
const sectionLabel = { fontSize:11, fontWeight:800, color:"#94a3b8", textTransform:"uppercase",
  letterSpacing:"0.06em", margin:"18px 0 10px" };

const toEditState = (property) => ({
  title: property?.title || "",
  description: property?.description || "",
  type: (property?.type || "apartment").toLowerCase(),
  purpose: property?.purpose || "sale",
  price: property?.rawPrice ?? property?.price ?? "",
  currency: property?.currency || "ZMW",
  rentFrequency: property?.rentFrequency || "monthly",
  address: property?.rawAddress || "",
  city: property?.rawCity || "",
  state: property?.rawState || "",
  zipCode: property?.rawZip || "",
  country: property?.rawCountry || "Zambia",
  bedrooms: property?.bedrooms ?? property?.beds ?? "",
  bathrooms: property?.bathrooms ?? property?.baths ?? "",
  squareFeet: property?.squareFeet ?? property?.area ?? "",
  parking: property?.parking ?? "",
  amenities: Array.isArray(property?.rawAmenities) ? property.rawAmenities : [],
  status: property?.rawStatus || "draft",
});

// ── Media Tab ─────────────────────────────────────────────────────────────────

function MediaTab({ property: initialProperty, onMutation }) {
  const queryClient = useQueryClient();
  const featuredInputRef = useRef(null);
  const galleryInputRef  = useRef(null);
  const videoInputRef    = useRef(null);

  const [mediaToast, setMediaToast] = useState(null);
  const [videoCaption, setVideoCaption] = useState("");
  const [pendingVideo, setPendingVideo] = useState(null);

  const showToast = (type, text) => {
    setMediaToast({ type, text });
    setTimeout(() => setMediaToast(null), 4000);
  };

  // Use live query so media updates are reflected immediately after mutations
  const { data: liveProperty } = useQuery({
    queryKey: ["property", initialProperty.id],
    queryFn: () => fetchPropertyDetail(initialProperty.id),
    staleTime: 0,
  });
  const property = liveProperty ?? initialProperty;

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["properties"] });
    await queryClient.invalidateQueries({ queryKey: ["property", initialProperty.id] });
  };

  // ── Featured image ──────────────────────────────────────────────────────────
  const featuredMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("image", file);
      return updateFeaturedImage(property.id, fd);
    },
    onSuccess: async () => { await invalidate(); showToast("success", "Featured image updated"); onMutation(); },
    onError: (err) => showToast("error", err?.response?.data?.error?.message || err?.message || "Upload failed"),
  });

  // ── Gallery add ─────────────────────────────────────────────────────────────
  const galleryAddMutation = useMutation({
    mutationFn: (files) => {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("gallery", f));
      return addGalleryImages(property.id, fd);
    },
    onSuccess: async () => { await invalidate(); showToast("success", "Gallery images added"); onMutation(); },
    onError: (err) => showToast("error", err?.response?.data?.error?.message || err?.message || "Upload failed"),
  });

  // ── Gallery remove ──────────────────────────────────────────────────────────
  const [removingIndex, setRemovingIndex] = useState(null);
  const galleryRemoveMutation = useMutation({
    mutationFn: (index) => removeGalleryImage(property.id, index),
    onSuccess: async () => { await invalidate(); showToast("success", "Image removed"); onMutation(); setRemovingIndex(null); },
    onError: (err) => { showToast("error", err?.response?.data?.error?.message || err?.message || "Remove failed"); setRemovingIndex(null); },
  });

  // ── Video upload ────────────────────────────────────────────────────────────
  const videoMutation = useMutation({
    mutationFn: ({ file, caption }) => {
      const fd = new FormData();
      fd.append("video", file);
      if (caption) fd.append("caption", caption);
      return uploadPropertyVideo(property.id, fd);
    },
    onSuccess: async () => { await invalidate(); showToast("success", "Video uploaded"); onMutation(); setPendingVideo(null); setVideoCaption(""); },
    onError: (err) => showToast("error", err?.response?.data?.error?.message || err?.message || "Upload failed"),
  });

  // ── Video delete ────────────────────────────────────────────────────────────
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const videoDeleteMutation = useMutation({
    mutationFn: (videoId) => deletePropertyVideo(initialProperty.id, videoId),
    onSuccess: async () => { await invalidate(); showToast("success", "Video deleted"); onMutation(); setDeletingVideoId(null); },
    onError: (err) => { showToast("error", err?.response?.data?.error?.message || err?.message || "Delete failed"); setDeletingVideoId(null); },
  });

  const anyPending = featuredMutation.isPending || galleryAddMutation.isPending || galleryRemoveMutation.isPending || videoMutation.isPending || videoDeleteMutation.isPending;

  return (
    <div style={{ padding:"16px 20px 24px" }}>
      {/* Toast */}
      {mediaToast && (
        <div style={{ border:`1px solid ${mediaToast.type==="success"?"#bbf7d0":"#fecaca"}`,
          background: mediaToast.type==="success"?"#f0fdf4":"#fef2f2",
          color: mediaToast.type==="success"?"#15803d":"#b91c1c",
          borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:16 }}>
          {mediaToast.text}
        </div>
      )}

      {/* Featured Image */}
      <p style={sectionLabel}>Featured Image</p>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        {property.featuredImageUrl
          ? <img src={property.featuredImageUrl} alt="Featured"
              style={{ width:120, height:80, objectFit:"cover", borderRadius:8, border:"1px solid #e2e8f0" }} />
          : <div style={{ width:120, height:80, borderRadius:8, background:"#f1f5f9",
              border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color:"#94a3b8" }}>No image</div>
        }
        <div>
          <input ref={featuredInputRef} type="file" accept="image/*" style={{ display:"none" }}
            onChange={(e) => { if (e.target.files?.[0]) featuredMutation.mutate(e.target.files[0]); e.target.value=""; }} />
          <button type="button" disabled={anyPending}
            onClick={() => featuredInputRef.current?.click()}
            style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #2D368E",
              background: featuredMutation.isPending ? "#e2e8f0" : "#2D368E",
              color: featuredMutation.isPending ? "#94a3b8" : "#fff",
              fontSize:12, fontWeight:600, cursor: anyPending?"not-allowed":"pointer" }}>
            {featuredMutation.isPending ? "Replacing…" : "Replace Image"}
          </button>
          <p style={{ margin:"6px 0 0", fontSize:11, color:"#94a3b8" }}>JPG, PNG, WebP — max 10 MB</p>
        </div>
      </div>

      {/* Gallery */}
      <p style={sectionLabel}>
        Gallery
        <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, marginLeft:8, color:"#64748b", fontSize:11 }}>
          {(property.galleryImages?.length ?? 0)} / 20 images
        </span>
      </p>
      {(property.galleryImages?.length ?? 0) > 0 ? (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
          {property.galleryImages.map((item) => (
            <div key={item.index} style={{ position:"relative", width:100, height:72 }}>
              <img src={item.url} alt=""
                style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:6, border:"1px solid #e2e8f0" }} />
              <button type="button"
                disabled={anyPending}
                onClick={() => { setRemovingIndex(item.index); galleryRemoveMutation.mutate(item.index); }}
                style={{ position:"absolute", top:3, right:3, width:20, height:20, borderRadius:"50%",
                  border:"none", background:"rgba(0,0,0,0.6)", color:"#fff", fontSize:12, lineHeight:"20px",
                  textAlign:"center", cursor: anyPending?"not-allowed":"pointer", padding:0,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                {removingIndex===item.index && galleryRemoveMutation.isPending ? "…" : "×"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>No gallery images yet.</p>
      )}
      <div style={{ marginBottom:20 }}>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display:"none" }}
          onChange={(e) => { if (e.target.files?.length) galleryAddMutation.mutate(e.target.files); e.target.value=""; }} />
        <button type="button" disabled={anyPending || (property.galleryImages?.length ?? 0) >= 20}
          onClick={() => galleryInputRef.current?.click()}
          style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #2D368E",
            background: galleryAddMutation.isPending ? "#e2e8f0" : "#fff",
            color: galleryAddMutation.isPending ? "#94a3b8" : "#2D368E",
            fontSize:12, fontWeight:600,
            cursor:(anyPending||(property.galleryImages?.length??0)>=20)?"not-allowed":"pointer" }}>
          {galleryAddMutation.isPending ? "Adding…" : "Add Images (max 10 at a time)"}
        </button>
      </div>

      {/* Videos */}
      <p style={sectionLabel}>Videos</p>
      {Array.isArray(property.videos) && property.videos.length > 0 ? (
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:12 }}>
          {property.videos.map((v, i) => (
            <div key={v._id || v.publicId || i}
              style={{ position:"relative", width:140, height:90, borderRadius:8,
                overflow:"hidden", border:"1px solid #e2e8f0", flexShrink:0 }}>
              <a href={v.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"block", width:"100%", height:"100%", textDecoration:"none" }}>
                {v.thumbnail
                  ? <img src={v.thumbnail} alt={v.caption||"Video"} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : <div style={{ width:"100%", height:"100%", background:"#1e293b", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:28, color:"#fff" }}>▶</span>
                    </div>
                }
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background:"rgba(0,0,0,0.3)" }}>
                  <span style={{ fontSize:24, color:"#fff" }}>▶</span>
                </div>
                {v.caption && (
                  <div style={{ position:"absolute", bottom:0, left:0, right:0,
                    background:"rgba(0,0,0,0.55)", color:"#fff", fontSize:10, padding:"3px 6px",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v.caption}</div>
                )}
              </a>
              {/* Delete button */}
              {v._id && (
                <button type="button"
                  disabled={anyPending}
                  onClick={() => { setDeletingVideoId(v._id); videoDeleteMutation.mutate(v._id); }}
                  style={{ position:"absolute", top:5, right:5, width:22, height:22, borderRadius:"50%",
                    border:"none", background: deletingVideoId===v._id ? "rgba(185,28,28,0.9)" : "rgba(0,0,0,0.6)",
                    color:"#fff", fontSize:13, cursor: anyPending?"not-allowed":"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                  {deletingVideoId===v._id && videoDeleteMutation.isPending ? "…" : "×"}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>No videos yet.</p>
      )}

      {/* Video upload */}
      {pendingVideo ? (
        <div style={{ border:"1px solid #e2e8f0", borderRadius:10, padding:"12px 14px", marginBottom:12,
          background:"#f8fafc", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:"#475569", fontWeight:600 }}>{pendingVideo.name}</span>
            <button type="button" onClick={() => setPendingVideo(null)} disabled={videoMutation.isPending}
              style={{ border:"none", background:"none", color:"#94a3b8", cursor:"pointer", fontSize:13 }}>✕</button>
          </div>
          <input style={inputStyle} placeholder="Caption (optional)" value={videoCaption}
            onChange={(e) => setVideoCaption(e.target.value)} disabled={videoMutation.isPending} />
          <button type="button" disabled={videoMutation.isPending}
            onClick={() => videoMutation.mutate({ file: pendingVideo, caption: videoCaption })}
            style={{ alignSelf:"flex-start", padding:"8px 18px", borderRadius:8,
              border:"1px solid #2D368E", background:"#2D368E", color:"#fff",
              fontSize:12, fontWeight:700, cursor: videoMutation.isPending?"not-allowed":"pointer",
              opacity: videoMutation.isPending ? 0.7 : 1 }}>
            {videoMutation.isPending ? "Uploading…" : "Upload Video"}
          </button>
        </div>
      ) : (
        <div>
          <input ref={videoInputRef} type="file" accept="video/*" style={{ display:"none" }}
            onChange={(e) => { if (e.target.files?.[0]) { setPendingVideo(e.target.files[0]); setVideoCaption(""); } e.target.value=""; }} />
          <button type="button" disabled={anyPending}
            onClick={() => videoInputRef.current?.click()}
            style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #2D368E",
              background:"#fff", color:"#2D368E",
              fontSize:12, fontWeight:600, cursor: anyPending?"not-allowed":"pointer" }}>
            Upload Video
          </button>
          <p style={{ margin:"6px 0 0", fontSize:11, color:"#94a3b8" }}>MP4, MOV, WebM — max 100 MB</p>
        </div>
      )}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function EditPropertyModal({ property, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState(toEditState(property));
  const [submitError, setSubmitError] = useState("");

  useEffect(() => { setForm(toEditState(property)); setSubmitError(""); }, [property]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));

  const detailsMutation = useMutation({
    mutationFn: (body) => editProperty(property.id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      onClose();
    },
    onError: (err) => {
      const respData = err?.response?.data;
      const errorObj = respData?.error;
      const details = errorObj?.details || respData?.errors;
      if (details) {
        const msgs = Array.isArray(details)
          ? details.map((e) => `${e.field || e.path?.join(".") || "Field"}: ${e.message}`).join(" | ")
          : JSON.stringify(details);
        setSubmitError(`Validation Error: ${msgs}`);
      } else {
        setSubmitError(errorObj?.message || respData?.message || err?.message || "Could not update property.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    const body = {
      title: form.title,
      description: form.description,
      type: form.type,
      purpose: form.purpose,
      price: form.price !== "" ? Number(form.price) : undefined,
      currency: form.currency,
      rentFrequency: form.purpose === "rent" ? form.rentFrequency : undefined,
      address: form.address,
      city: form.city,
      state: form.state || undefined,
      zipCode: form.zipCode || undefined,
      country: form.country,
      bedrooms: form.bedrooms !== "" ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms !== "" ? Number(form.bathrooms) : undefined,
      squareFeet: form.squareFeet !== "" ? Number(form.squareFeet) : undefined,
      parking: form.parking !== "" ? Number(form.parking) : undefined,
      amenities: form.amenities,
      status: form.status,
    };
    Object.keys(body).forEach((k) => { if (body[k] === undefined || body[k] === "") delete body[k]; });
    detailsMutation.mutate(body);
  };

  const modalBusy = detailsMutation.isPending;

  return (
    <div
      onClick={modalBusy ? undefined : onClose}
      style={{ position:"fixed", inset:0, zIndex:3000, background:"rgba(15,23,42,0.5)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width:"100%", maxWidth:680, maxHeight:"90vh", overflowY:"auto",
          background:"#fff", borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", border:"1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div style={{ position:"sticky", top:0, zIndex:1, background:"#fff",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"16px 20px", borderBottom:"1px solid #f1f5f9" }}>
          <div>
            <p style={{ margin:0, fontSize:16, fontWeight:800, color:"#000000" }}>Edit Property</p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>{property?.title}</p>
          </div>
          <button type="button" onClick={onClose} disabled={modalBusy}
            style={{ border:"1px solid #e2e8f0", background:"#fff", borderRadius:8,
              color:"#475569", padding:"6px 12px", fontSize:12, fontWeight:600,
              cursor: modalBusy ? "not-allowed" : "pointer", opacity: modalBusy ? 0.6 : 1 }}>
            Close
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display:"flex", borderBottom:"1px solid #f1f5f9", padding:"0 20px", background:"#fafafa" }}>
          {[["details","Details"],["media","Media"]].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)}
              style={{ padding:"11px 16px", background:"transparent", border:"none", cursor:"pointer",
                fontSize:13, fontWeight: activeTab===key ? 700 : 500,
                color: activeTab===key ? "#000000" : "#94a3b8",
                borderBottom: activeTab===key ? "2px solid #2D368E" : "2px solid transparent",
                marginBottom:-1 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {activeTab === "details" && (
          <form onSubmit={handleSubmit}>
            <div style={{ padding:"16px 20px 24px" }}>

              <p style={sectionLabel}>Basic Information</p>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Title</label>
                <input style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight:80, resize:"vertical" }}
                  value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>

              <p style={sectionLabel}>Category & Status</p>
              <div style={{ ...grid2, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={form.type} onChange={(e) => set("type", e.target.value)}>
                    {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Purpose</label>
                  <select style={inputStyle} value={form.purpose} onChange={(e) => set("purpose", e.target.value)}>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                {form.purpose === "rent" && (
                  <div>
                    <label style={labelStyle}>Rent Frequency</label>
                    <select style={inputStyle} value={form.rentFrequency} onChange={(e) => set("rentFrequency", e.target.value)}>
                      {["monthly","yearly","weekly","daily"].map((f) => (
                        <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    {["draft","pending","active","approved","rejected","sold","rented","inactive"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p style={sectionLabel}>Pricing</p>
              <div style={{ ...grid2, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>Price</label>
                  <input type="number" min="0" style={inputStyle}
                    value={form.price} onChange={(e) => set("price", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <input style={inputStyle} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
                </div>
              </div>

              <p style={sectionLabel}>Location</p>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Street Address</label>
                <input style={inputStyle} value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div style={{ ...grid2, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>State / Province</label>
                  <input style={inputStyle} value={form.state} onChange={(e) => set("state", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Zip / Postal Code</label>
                  <input style={inputStyle} value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input style={inputStyle} value={form.country} onChange={(e) => set("country", e.target.value)} />
                </div>
              </div>

              <p style={sectionLabel}>Property Details</p>
              <div style={{ ...grid2, marginBottom:12 }}>
                {[
                  { key:"bedrooms", label:"Bedrooms" },
                  { key:"bathrooms", label:"Bathrooms" },
                  { key:"squareFeet", label:"Area (sq ft)" },
                  { key:"parking", label:"Parking" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type="number" min="0" style={inputStyle}
                      value={form[key]} onChange={(e) => set(key, e.target.value)} />
                  </div>
                ))}
              </div>

              <p style={sectionLabel}>Amenities</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:16 }}>
                {AMENITIES_LIST.map((a) => {
                  const active = form.amenities.includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      style={{
                        padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:600, cursor:"pointer",
                        border: active ? "1px solid #2D368E" : "1px solid #e2e8f0",
                        background: active ? "#2D368E" : "#f8fafc",
                        color: active ? "#fff" : "#475569",
                        transition:"all 0.15s",
                      }}>
                      {formatAmenity(a)}
                    </button>
                  );
                })}
              </div>

              {submitError && (
                <div style={{ border:"1px solid #fecaca", background:"#fef2f2", color:"#b91c1c",
                  borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:14 }}>
                  {submitError}
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:4 }}>
                <button type="button" onClick={onClose} disabled={detailsMutation.isPending}
                  style={{ border:"1px solid #e2e8f0", background:"#fff", color:"#000000",
                    borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600,
                    cursor: detailsMutation.isPending ? "not-allowed" : "pointer",
                    opacity: detailsMutation.isPending ? 0.6 : 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={detailsMutation.isPending}
                  style={{ border:"1px solid #2D368E", background:"#2D368E", color:"#fff",
                    borderRadius:8, padding:"9px 24px", fontSize:13, fontWeight:700,
                    cursor: detailsMutation.isPending ? "not-allowed" : "pointer",
                    opacity: detailsMutation.isPending ? 0.7 : 1 }}>
                  {detailsMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Media tab */}
        {activeTab === "media" && (
          <MediaTab
            property={property}
            onMutation={() => {}}
          />
        )}
      </div>
    </div>
  );
}
