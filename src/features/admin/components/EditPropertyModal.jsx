// 📁 src/features/admin/components/EditPropertyModal.jsx
import { useLayoutEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  editProperty,
  fetchPropertyDetail,
  removeGalleryImage,
  uploadPropertyVideo,
  deletePropertyVideo,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "../api/propertiesApi";
import { mapApiFieldErrors } from "../utils/propertyFormErrors";
import PhoneInput from "./PhoneInput";

const TYPES = ["apartment","house","villa","townhouse","condo","land","commercial"];
const STATUSES = ["draft","pending","active","approved","rejected","sold","rented","inactive"];
const AMENITIES_LIST = [
  "parking","gym","pool","garden","balcony","elevator","security",
  "petFriendly","furnished","airConditioning","heating","fireplace",
  "laundry","dishwasher","hardwoodFloors","internet","cableTV",
  "unfurnished","semi-furnished",
];
const CURRENCIES = [
  { code:"ZMW", name:"Zambian Kwacha"         },
  { code:"USD", name:"US Dollar"              },
  { code:"ZAR", name:"South African Rand"     },
  { code:"KES", name:"Kenyan Shilling"        },
  { code:"TZS", name:"Tanzanian Shilling"     },
  { code:"UGX", name:"Ugandan Shilling"       },
  { code:"MWK", name:"Malawian Kwacha"        },
  { code:"MZN", name:"Mozambican Metical"     },
  { code:"BWP", name:"Botswana Pula"          },
  { code:"NAD", name:"Namibian Dollar"        },
  { code:"NGN", name:"Nigerian Naira"         },
  { code:"GHS", name:"Ghanaian Cedi"          },
  { code:"GBP", name:"British Pound"          },
  { code:"EUR", name:"Euro"                   },
  { code:"AED", name:"UAE Dirham"             },
  { code:"SAR", name:"Saudi Riyal"            },
  { code:"INR", name:"Indian Rupee"           },
  { code:"AUD", name:"Australian Dollar"      },
  { code:"CAD", name:"Canadian Dollar"        },
];

const IMAGE_MB = Math.round(MAX_IMAGE_SIZE / (1024 * 1024));
const VIDEO_MB = Math.round(MAX_VIDEO_SIZE / (1024 * 1024));
const RESIDENTIAL_TYPES = new Set(["apartment", "house", "villa", "townhouse", "condo"]);

const formatAmenity = (a) =>
  a.replace(/([A-Z])/g," $1").replace(/[-_]/g," ").trim()
   .replace(/\b\w/g, (c) => c.toUpperCase());

const labelStyle = { display:"block", fontSize:12, fontWeight:700, color:"#475569", marginBottom:5 };
const inputStyle = {
  width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid #e2e8f0",
  fontSize:13, color:"#000000", background:"#fff", outline:"none", boxSizing:"border-box",
};
const grid2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };
const sectionLabel = {
  fontSize:11, fontWeight:800, color:"#94a3b8", textTransform:"uppercase",
  letterSpacing:"0.06em", margin:"18px 0 10px",
};

const toEditState = (p) => ({
  title:         p?.title || "",
  description:   p?.description || "",
  type:          (p?.type || "apartment").toLowerCase(),
  purpose:       p?.purpose || "sale",
  price:         p?.rawPrice ?? p?.price ?? "",
  currency:      p?.currency || "ZMW",
  rentFrequency: p?.rentFrequency || "monthly",
  status:        p?.rawStatus || "draft",
  featured:      Boolean(p?.featured),
  address:       p?.rawAddress  || "",
  city:          p?.rawCity     || "",
  state:         p?.rawState    || "",
  zipCode:       p?.rawZip      || "",
  country:       p?.rawCountry  || "Zambia",
  bedrooms:      p?.bedrooms  ?? p?.beds  ?? "",
  bathrooms:     p?.bathrooms ?? p?.baths ?? "",
  squareFeet:    p?.squareFeet ?? p?.area ?? "",
  areaUnit:      p?.areaUnit === "acres" ? "acres" : "sqft",
  parking:       p?.parking    ?? "",
  yearBuilt:     p?.yearBuilt  ?? "",
  lotSize:       p?.lotSize    ?? "",
  stories:       p?.stories    ?? "",
  garage:        p?.garage     ?? "",
  whatsappCode:  "+260", whatsapp: "",
  phoneCode:     "+260", phone:    "",
  email:         "",
  amenities:     Array.isArray(p?.rawAmenities) ? p.rawAmenities : [],
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

  const { data: liveProperty } = useQuery({
    queryKey: ["property", initialProperty.id],
    queryFn: () => fetchPropertyDetail(initialProperty.id),
    staleTime: 0,
  });
  const property = liveProperty ?? initialProperty;

  const cacheKey = ["property", initialProperty.id];

  const featuredMutation = useMutation({
    mutationFn: (file) => editProperty(property.id, {}, { featured: file }),
    onSuccess: async (updated) => {
      if (updated) queryClient.setQueryData(cacheKey, updated);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      showToast("success", "Featured image updated");
      onMutation();
    },
    onError: (err) => showToast("error", err?.response?.data?.error?.message || err?.message || "Upload failed"),
  });

  const galleryAddMutation = useMutation({
    mutationFn: (files) => editProperty(property.id, {}, { gallery: files }),
    onSuccess: async (updated) => {
      if (updated) queryClient.setQueryData(cacheKey, updated);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      showToast("success", "Gallery images added");
      onMutation();
    },
    onError: (err) => showToast("error", err?.response?.data?.error?.message || err?.message || "Upload failed"),
  });

  const [removingIndex, setRemovingIndex] = useState(null);
  const galleryRemoveMutation = useMutation({
    mutationFn: (index) => removeGalleryImage(property.id, index),
    onSuccess: async (updated) => {
      if (updated) queryClient.setQueryData(cacheKey, updated);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      showToast("success", "Image removed");
      onMutation();
      setRemovingIndex(null);
    },
    onError: (err) => { showToast("error", err?.response?.data?.error?.message || err?.message || "Remove failed"); setRemovingIndex(null); },
  });

  const videoMutation = useMutation({
    mutationFn: ({ file, caption }) =>
      uploadPropertyVideo(property.id, { file, caption: caption || "" }),
    onSuccess: async (updated) => {
      if (updated) queryClient.setQueryData(cacheKey, updated);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      showToast("success", "Video uploaded");
      onMutation();
      setPendingVideo(null);
      setVideoCaption("");
    },
    onError: (err) => showToast("error", err?.response?.data?.error?.message || err?.message || "Upload failed"),
  });

  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const videoDeleteMutation = useMutation({
    mutationFn: (videoId) => deletePropertyVideo(initialProperty.id, videoId),
    onSuccess: async (updated) => {
      if (updated) queryClient.setQueryData(cacheKey, updated);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      showToast("success", "Video deleted");
      onMutation();
      setDeletingVideoId(null);
    },
    onError: (err) => { showToast("error", err?.response?.data?.error?.message || err?.message || "Delete failed"); setDeletingVideoId(null); },
  });

  const anyPending = featuredMutation.isPending || galleryAddMutation.isPending || galleryRemoveMutation.isPending || videoMutation.isPending || videoDeleteMutation.isPending;

  return (
    <div style={{ padding:"16px 20px 24px" }}>
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > MAX_IMAGE_SIZE) { showToast("error", `Image must be under ${IMAGE_MB}MB`); return; }
              featuredMutation.mutate(file);
            }} />
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
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!picked.length) return;
            const valid = picked.filter((f) => f.size <= MAX_IMAGE_SIZE);
            const oversized = picked.length - valid.length;
            if (oversized > 0) showToast("error", `${oversized} image(s) skipped — each must be under ${IMAGE_MB}MB`);
            if (valid.length) galleryAddMutation.mutate(valid);
          }} />
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
            <div key={v._id || v.key || i}
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > MAX_VIDEO_SIZE) { showToast("error", `Video must be under ${VIDEO_MB}MB`); return; }
              setPendingVideo(file); setVideoCaption("");
            }} />
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
  const [form, setForm]           = useState(toEditState(property));
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useLayoutEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Form state is initialized from `property` on mount. The parent renders this
  // modal with `key={property.id}`, so selecting a different property remounts
  // and re-initializes — no reset effect needed (avoids set-state-in-effect).

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  };

  // Shared field styles + inline error, mirroring the create form.
  const errInput = (key) =>
    fieldErrors[key] ? { ...inputStyle, borderColor: "#fca5a5", background: "#fff7f7" } : inputStyle;
  const fieldErr = (key) =>
    fieldErrors[key] ? (
      <span style={{ fontSize: 11, color: "#b91c1c", marginTop: 3, display: "block" }}>{fieldErrors[key]}</span>
    ) : null;

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
      const { fieldErrors: fe, generalMessage } = mapApiFieldErrors(err);
      setFieldErrors(fe);
      setSubmitError(generalMessage);
    },
  });

  // Client-side checks mirroring the create form + editPropertySchema, limited to
  // the fields the Details tab actually renders.
  const validate = () => {
    const er = {};
    if (!form.title.trim())                        er.title       = "Title is required";
    else if (form.title.trim().length < 5)         er.title       = "Title must be at least 5 characters";
    if (!form.description.trim())                  er.description = "Description is required";
    else if (form.description.trim().length < 20)  er.description = "Description must be at least 20 characters";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) er.price = "Valid price is required";
    if (RESIDENTIAL_TYPES.has(form.type)) {
      if (form.bedrooms  === "" || isNaN(Number(form.bedrooms)))  er.bedrooms  = "Bedrooms is required for this property type";
      if (form.bathrooms === "" || isNaN(Number(form.bathrooms))) er.bathrooms = "Bathrooms is required for this property type";
    }
    return er;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    setFieldErrors({});

    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    const num = (v) => (v !== "" && v !== undefined ? Number(v) : undefined);
    const str = (v) => (v?.trim() ? v.trim() : undefined);

    const contact = {};
    if (form.whatsapp.trim()) contact.whatsapp = `${form.whatsappCode}${form.whatsapp.trim()}`;
    if (form.phone.trim())    contact.phone    = `${form.phoneCode}${form.phone.trim()}`;
    if (form.email.trim())    contact.email    = form.email.trim();

    const body = {
      title:         str(form.title),
      description:   str(form.description),
      type:          form.type,
      purpose:       form.purpose,
      price:         num(form.price),
      currency:      form.currency,
      rentFrequency: form.purpose === "rent" ? form.rentFrequency : undefined,
      status:        form.status,
      featured:      form.featured,
      address:       str(form.address),
      city:          str(form.city),
      state:         str(form.state),
      zipCode:       str(form.zipCode),
      country:       str(form.country),
      bedrooms:      num(form.bedrooms),
      bathrooms:     num(form.bathrooms),
      squareFeet:    num(form.squareFeet),
      areaUnit:      form.areaUnit || "sqft",
      parking:       num(form.parking),
      yearBuilt:     num(form.yearBuilt),
      lotSize:       num(form.lotSize),
      stories:       num(form.stories),
      garage:        num(form.garage),
      amenities:     form.amenities,
      ...(Object.keys(contact).length ? { contact } : {}),
    };

    Object.keys(body).forEach(k => { if (body[k] === undefined) delete body[k]; });
    detailsMutation.mutate(body);
  };

  const modalBusy = detailsMutation.isPending;

  return (
    <div
      onClick={modalBusy ? undefined : onClose}
      style={{ position:"fixed", inset:0, zIndex:3000, background:"rgba(15,23,42,0.5)",
        display:"flex",
        alignItems: isDesktop ? "center" : "flex-end",
        justifyContent:"center",
        padding: isDesktop ? 16 : 0 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"100%",
          maxWidth: isDesktop ? 700 : "100%",
          maxHeight: isDesktop ? "90vh" : "92vh",
          overflowY:"auto",
          background:"#fff",
          borderRadius: isDesktop ? 16 : "16px 16px 0 0",
          boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
          border:"1px solid #e2e8f0",
        }}
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

              {/* Basic */}
              <p style={sectionLabel}>Basic Information</p>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Title</label>
                <input style={errInput("title")} value={form.title}
                  onChange={e => set("title", e.target.value)} />
                {fieldErr("title")}
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...errInput("description"), minHeight:80, resize:"vertical" }}
                  value={form.description} onChange={e => set("description", e.target.value)} />
                {fieldErr("description")}
              </div>

              {/* Category & Status */}
              <p style={sectionLabel}>Category & Status</p>
              <div style={{ ...grid2, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={form.type}
                    onChange={e => { const t = e.target.value; set("type", t); set("areaUnit", t === "land" ? "acres" : "sqft"); }}>
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Purpose</label>
                  <select style={inputStyle} value={form.purpose} onChange={e => set("purpose", e.target.value)}>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                {form.purpose === "rent" && (
                  <div>
                    <label style={labelStyle}>Rent Frequency</label>
                    <select style={errInput("rentFrequency")} value={form.rentFrequency} onChange={e => set("rentFrequency", e.target.value)}>
                      {["monthly","yearly","weekly","daily"].map(f => (
                        <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>
                      ))}
                    </select>
                    {fieldErr("rentFrequency")}
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => set("status", e.target.value)}>
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Featured toggle */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"11px 14px", background:"#f8fafc", border:"1px solid #e2e8f0",
                borderRadius:9, marginBottom:12 }}>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#000000" }}>Featured Listing</p>
                  <p style={{ margin:"1px 0 0", fontSize:11, color:"#94a3b8" }}>Highlight this property at the top of search results</p>
                </div>
                <button type="button" onClick={() => set("featured", !form.featured)}
                  style={{ width:44, height:24, borderRadius:99, border:"none", cursor:"pointer",
                    background: form.featured ? "#2D368E" : "#cbd5e1", position:"relative",
                    transition:"background 0.2s", flexShrink:0 }}>
                  <span style={{ position:"absolute", top:3, left: form.featured ? 22 : 3,
                    width:18, height:18, borderRadius:"50%", background:"#fff",
                    transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>

              {/* Pricing */}
              <p style={sectionLabel}>Pricing</p>
              <div style={{ ...grid2, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>Price</label>
                  <input type="number" min="0" style={errInput("price")}
                    value={form.price} onChange={e => set("price", e.target.value)}
                    onWheel={e => e.currentTarget.blur()} />
                  {fieldErr("price")}
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select style={inputStyle} value={form.currency} onChange={e => set("currency", e.target.value)}>
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <p style={sectionLabel}>Location</p>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Street Address</label>
                <input style={errInput("address")} value={form.address} onChange={e => set("address", e.target.value)} />
                {fieldErr("address")}
              </div>
              <div style={{ ...grid2, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={errInput("city")} value={form.city} onChange={e => set("city", e.target.value)} />
                  {fieldErr("city")}
                </div>
                <div>
                  <label style={labelStyle}>State / Province</label>
                  <input style={errInput("state")} value={form.state} onChange={e => set("state", e.target.value)} />
                  {fieldErr("state")}
                </div>
                <div>
                  <label style={labelStyle}>Zip / Postal Code</label>
                  <input style={errInput("zipCode")} value={form.zipCode} onChange={e => set("zipCode", e.target.value)} />
                  {fieldErr("zipCode")}
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input style={errInput("country")} value={form.country} onChange={e => set("country", e.target.value)} />
                  {fieldErr("country")}
                </div>
              </div>

              {/* Details */}
              <p style={sectionLabel}>Property Details</p>
              <div style={{ ...grid2, marginBottom:12 }}>
                {[
                  { key:"bedrooms",   label:"Bedrooms",        min:0 },
                  { key:"bathrooms",  label:"Bathrooms",       min:0 },
                  { key:"squareFeet", label:"Area", min:0 },
                  { key:"parking",    label:"Parking Spaces",  min:0 },
                  { key:"stories",    label:"Stories",         min:0 },
                ].map(({ key, label, min }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    {key === "squareFeet" ? (
                      <div style={{ display:"flex", gap:8 }}>
                        <input type="number" min={min} style={{ ...errInput(key), flex:1 }}
                          value={form[key]} onChange={e => set(key, e.target.value)}
                          onWheel={e => e.currentTarget.blur()} />
                        <select style={{ ...inputStyle, width:110 }}
                          value={form.areaUnit} onChange={e => set("areaUnit", e.target.value)}>
                          <option value="sqft">sq ft</option>
                          <option value="acres">acres</option>
                        </select>
                      </div>
                    ) : (
                      <input type="number" min={min} style={errInput(key)}
                        value={form[key]} onChange={e => set(key, e.target.value)}
                        onWheel={e => e.currentTarget.blur()} />
                    )}
                    {fieldErr(key)}
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <p style={sectionLabel}>Amenities</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:16 }}>
                {AMENITIES_LIST.map(a => {
                  const active = form.amenities.includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      style={{ padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:600,
                        cursor:"pointer", transition:"all 0.15s",
                        border:   active ? "1px solid #2D368E" : "1px solid #e2e8f0",
                        background: active ? "#2D368E" : "#f8fafc",
                        color:      active ? "#fff"    : "#475569" }}>
                      {formatAmenity(a)}
                    </button>
                  );
                })}
              </div>

              {/* Contact */}
              <p style={sectionLabel}>Contact Details</p>
              <p style={{ margin:"-6px 0 10px", fontSize:11, color:"#94a3b8" }}>
                Leave blank to keep existing contact info. WhatsApp is used in Facebook post captions.
              </p>
              <div style={{ ...grid2, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>WhatsApp</label>
                  <PhoneInput
                    countryCode={form.whatsappCode}
                    number={form.whatsapp}
                    onCodeChange={v => set("whatsappCode", v)}
                    onNumberChange={v => set("whatsapp", v)}
                    placeholder="978032673"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <PhoneInput
                    countryCode={form.phoneCode}
                    number={form.phone}
                    onCodeChange={v => set("phoneCode", v)}
                    onNumberChange={v => set("phone", v)}
                    placeholder="978032673"
                  />
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" style={errInput("email")} value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="agent@example.com" />
                {fieldErr("email")}
              </div>

              {/* Error */}
              {submitError && (
                <div style={{ border:"1px solid #fecaca", background:"#fef2f2", color:"#b91c1c",
                  borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:14 }}>
                  {submitError}
                </div>
              )}

              {/* Footer */}
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
