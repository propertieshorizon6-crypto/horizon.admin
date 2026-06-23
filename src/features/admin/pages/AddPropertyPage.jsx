// 📁 src/features/admin/pages/AddPropertyPage.jsx
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, Plus, Images, Video } from "lucide-react";
import { createProperty, uploadPropertyVideo } from "../api/propertiesApi";
import PhoneInput from "../components/PhoneInput";

const TYPES = ["apartment","house","villa","townhouse","condo","land","commercial"];
const RESIDENTIAL_TYPES = new Set(["apartment","house","villa","townhouse","condo"]);


const CURRENCIES = [
  { code:"ZMW", symbol:"K",   name:"Zambian Kwacha"         },
  { code:"USD", symbol:"$",   name:"US Dollar"              },
  { code:"ZAR", symbol:"R",   name:"South African Rand"     },
  { code:"KES", symbol:"KSh", name:"Kenyan Shilling"        },
  { code:"TZS", symbol:"TSh", name:"Tanzanian Shilling"     },
  { code:"UGX", symbol:"USh", name:"Ugandan Shilling"       },
  { code:"MWK", symbol:"MK",  name:"Malawian Kwacha"        },
  { code:"MZN", symbol:"MT",  name:"Mozambican Metical"     },
  { code:"BWP", symbol:"P",   name:"Botswana Pula"          },
  { code:"NAD", symbol:"N$",  name:"Namibian Dollar"        },
  { code:"CDF", symbol:"FC",  name:"Congolese Franc"        },
  { code:"AOA", symbol:"Kz",  name:"Angolan Kwanza"         },
  { code:"GHS", symbol:"₵",   name:"Ghanaian Cedi"          },
  { code:"NGN", symbol:"₦",   name:"Nigerian Naira"         },
  { code:"ETB", symbol:"Br",  name:"Ethiopian Birr"         },
  { code:"RWF", symbol:"RF",  name:"Rwandan Franc"          },
  { code:"SDG", symbol:"ج.س", name:"Sudanese Pound"         },
  { code:"XOF", symbol:"CFA", name:"West African CFA Franc" },
  { code:"XAF", symbol:"CFA", name:"Central African CFA"    },
  { code:"MAD", symbol:"د.م", name:"Moroccan Dirham"        },
  { code:"DZD", symbol:"د.ج", name:"Algerian Dinar"         },
  { code:"TND", symbol:"د.ت", name:"Tunisian Dinar"         },
  { code:"EGP", symbol:"£",   name:"Egyptian Pound"         },
  { code:"GBP", symbol:"£",   name:"British Pound"          },
  { code:"EUR", symbol:"€",   name:"Euro"                   },
  { code:"AED", symbol:"د.إ", name:"UAE Dirham"             },
  { code:"SAR", symbol:"﷼",   name:"Saudi Riyal"            },
  { code:"QAR", symbol:"﷼",   name:"Qatari Riyal"           },
  { code:"KWD", symbol:"د.ك", name:"Kuwaiti Dinar"          },
  { code:"INR", symbol:"₹",   name:"Indian Rupee"           },
  { code:"CNY", symbol:"¥",   name:"Chinese Yuan"           },
  { code:"JPY", symbol:"¥",   name:"Japanese Yen"           },
  { code:"AUD", symbol:"A$",  name:"Australian Dollar"      },
  { code:"CAD", symbol:"CA$", name:"Canadian Dollar"        },
  { code:"CHF", symbol:"Fr",  name:"Swiss Franc"            },
  { code:"BRL", symbol:"R$",  name:"Brazilian Real"         },
];

function CurrencySelect({ value, onChange }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  const selected = CURRENCIES.find(c => c.code === value) ?? CURRENCIES[0];
  const filtered = search.trim()
    ? CURRENCIES.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : CURRENCIES;

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(""); }}
        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, padding:"10px 12px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, color:"#000000", outline:"none" }}
      >
        <span style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontWeight:700, color:"#2D368E" }}>{selected.code}</span>
          <span style={{ color:"#64748b" }}>{selected.symbol} — {selected.name}</span>
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{ flexShrink:0, transition:"transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:9999, background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", width:"100%", minWidth:260, overflow:"hidden" }}>
          <div style={{ padding:"8px 10px", borderBottom:"1px solid #f1f5f9" }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search currency..."
              style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #e2e8f0", fontSize:12, color:"#000000", outline:"none", boxSizing:"border-box" }}
            />
          </div>
          <div style={{ maxHeight:220, overflowY:"auto" }}>
            {filtered.length === 0 && (
              <p style={{ margin:0, padding:"12px", fontSize:12, color:"#94a3b8", textAlign:"center" }}>No results</p>
            )}
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", border:"none", background: c.code === value ? "#f1f5f9" : "#fff", cursor:"pointer", fontSize:12, color:"#000000", textAlign:"left" }}
                onMouseEnter={e => { if (c.code !== value) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (c.code !== value) e.currentTarget.style.background = c.code === value ? "#f1f5f9" : "#fff"; }}
              >
                <span style={{ fontWeight:700, color:"#2D368E", flexShrink:0, minWidth:36 }}>{c.code}</span>
                <span style={{ color:"#475569", flexShrink:0 }}>{c.symbol}</span>
                <span style={{ color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


const AMENITIES_LIST = [
  "parking","gym","pool","garden","balcony","elevator","security",
  "petFriendly","furnished","airConditioning","heating","fireplace",
  "laundry","dishwasher","hardwoodFloors","internet","cableTV",
  "unfurnished","semi-furnished",
];
const formatAmenity = (a) =>
  a.replace(/([A-Z])/g," $1").replace(/[-_]/g," ").trim()
   .replace(/\b\w/g, c => c.toUpperCase());

const labelStyle  = { display:"block", fontSize:12, fontWeight:700, color:"#475569", marginBottom:5 };
const inputStyle  = { width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:13, color:"#000000", background:"#fff", outline:"none", boxSizing:"border-box" };
const sectionTitle= { fontSize:14, fontWeight:800, color:"#000000", margin:"20px 0 10px" };
const grid2       = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };
const grid3       = { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 };

export default function AddPropertyPage({ onBack }) {
  const queryClient = useQueryClient();
  const featuredRef = useRef(null);
  const galleryRef  = useRef(null);
  const videoRef    = useRef(null);

  const [form, setForm] = useState({
    title:"", description:"", type:"apartment", purpose:"sale",
    price:"", currency:"ZMW", rentFrequency:"monthly",
    address:"", city:"", state:"", zipCode:"", country:"Zambia",
    bedrooms:"", bathrooms:"", squareFeet:"", parking:"",
    yearBuilt:"", lotSize:"", stories:"", garage:"",
    isFeatured: false,
    amenities:[],
    whatsappCode:"+260", whatsapp:"",
    phoneCode:"+260",    phone:"",
    email:"",
  });

  const [featuredFile,    setFeaturedFile]    = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState(null);
  const [galleryFiles,    setGalleryFiles]    = useState([]);   // [{file, preview}]
  const [videoFile,       setVideoFile]       = useState(null);
  const [videoCaption,    setVideoCaption]    = useState("");
  const [videoError,      setVideoError]      = useState("");
  const [errors,          setErrors]          = useState({});
  const [submitError,     setSubmitError]     = useState("");
  const [videoUploading,  setVideoUploading]  = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleAmenity = (a) =>
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a],
    }));

  // ── Featured image handler ────────────────────────────────────────────────
  const onFeaturedChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeaturedFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, featured: "" }));
    e.target.value = "";
  };

  // ── Gallery images handler ────────────────────────────────────────────────
  const onGalleryChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = 20 - galleryFiles.length;
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));

    setGalleryFiles(prev => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const removeGallery = (id) => {
    setGalleryFiles(prev => {
      const item = prev.find(g => g.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(g => g.id !== id);
    });
  };

  // ── Video handler ─────────────────────────────────────────────────────────
  const onVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX = 100 * 1024 * 1024;
    if (file.size > MAX) { setVideoError("Video must be under 100 MB"); return; }
    setVideoFile(file);
    setVideoError("");
    e.target.value = "";
  };

  const fmtFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const currentYear = new Date().getFullYear();
    if (!form.title.trim())                        e.title       = "Title is required";
    else if (form.title.trim().length < 5)         e.title       = "Title must be at least 5 characters";
    if (!form.description.trim())                  e.description = "Description is required";
    else if (form.description.trim().length < 20)  e.description = "Description must be at least 20 characters";
    if (!form.price || isNaN(Number(form.price)))  e.price       = "Valid price is required";
    if (RESIDENTIAL_TYPES.has(form.type)) {
      if (form.bedrooms  === "" || isNaN(Number(form.bedrooms)))  e.bedrooms  = "Bedrooms is required for this property type";
      if (form.bathrooms === "" || isNaN(Number(form.bathrooms))) e.bathrooms = "Bathrooms is required for this property type";
    }
    if (form.yearBuilt !== "") {
      const yr = Number(form.yearBuilt);
      if (!Number.isInteger(yr) || yr < 1800 || yr > currentYear + 1) e.yearBuilt = `Year built must be between 1800 and ${currentYear + 1}`;
    }
    if (!featuredFile) e.featured = "Featured image is required";
    return e;
  };

  // ── Mutation ──────────────────────────────────────────────────────────────
  const KNOWN_FIELDS = new Set([
    "title","description","type","purpose","rentFrequency",
    "price","currency",
    "address","city","state","zipCode","country",
    "bedrooms","bathrooms","squareFeet","parking","yearBuilt","lotSize","stories","garage",
    "featured","isFeatured",
    "phone","whatsapp","email",
  ]);

  const FIELD_ALIAS = {
    "location.address": "address", "location.city": "city",
    "location.state": "state",     "location.zipCode": "zipCode",
    "location.country": "country",
    "details.bedrooms": "bedrooms",   "details.bathrooms": "bathrooms",
    "details.squareFeet": "squareFeet","details.parking": "parking",
    "details.yearBuilt": "yearBuilt",  "details.lotSize": "lotSize",
    "details.stories": "stories",      "details.garage": "garage",
    "images.featured": "featured",
    "contact.phone": "phone", "contact.whatsapp": "whatsapp", "contact.email": "email",
  };

  const normalizeFieldKey = (raw = "") => {
    const dotted = raw
      .replace(/^body\./, "")
      .replace(/\[(\w+)\]/g, ".$1");
    return FIELD_ALIAS[dotted] ?? dotted.split(".").pop();
  };

  const mutation = useMutation({
    // Step 1: only create the property (no video here)
    mutationFn: (fd) => createProperty(fd),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      const propertyId = result?.data?.property?._id;

      // Step 2: video upload (separate so its failure doesn't mask property creation)
      if (videoFile && propertyId) {
        setVideoUploading(true);
        try {
          const vfd = new FormData();
          vfd.append("video", videoFile);
          if (videoCaption.trim()) vfd.append("caption", videoCaption.trim());
          await uploadPropertyVideo(propertyId, vfd);
        } catch {
          setVideoUploading(false);
          setSubmitError("Property created! Video upload failed — upload it from the Edit page.");
          return; // stay on page so the user sees the message
        }
        setVideoUploading(false);
      }

      onBack();
    },
    onError: (err) => {
      const details = err?.response?.data?.error?.details;
      if (Array.isArray(details) && details.length) {
        const fieldErrors = {};
        const unmapped = [];
        details.forEach((item) => {
          const raw = item?.field ?? item?.path ?? item?.param ?? "";
          const msg = item?.message ?? item?.msg ?? "";
          if (!msg) return;
          const key = normalizeFieldKey(String(raw));
          if (KNOWN_FIELDS.has(key)) {
            fieldErrors[key] = msg;
          } else {
            unmapped.push(msg);
          }
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        const hasHighlighted = Object.keys(fieldErrors).length > 0;
        setSubmitError(
          hasHighlighted
            ? `Please fix the highlighted errors.${unmapped.length ? " " + unmapped.join(" ") : ""}`
            : unmapped.join(" ") || "Please review and fix the errors below."
        );
      } else {
        const ERROR_MESSAGES = {
          INVALID_FILE_TYPE:  "One of your images is not a supported format. Please upload JPG, PNG, WebP, or HEIC files only.",
          FILE_TOO_LARGE:     "One of your images is too large. Please keep each file under 10MB.",
          TOO_MANY_FILES:     "Too many images uploaded. Maximum is 20 gallery images.",
          UNAUTHORIZED:       "You don't have permission to create properties.",
          UNAUTHENTICATED:    "Your session has expired. Please log in again.",
          DUPLICATE_PROPERTY: "A property with this title already exists.",
        };
        const code = err?.response?.data?.error?.details;
        const friendly = typeof code === "string" ? ERROR_MESSAGES[code] : null;
        setSubmitError(
          friendly ||
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Something went wrong. Please try again."
        );
      }
    },
  });

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setSubmitError("");

    const fd = new FormData();

    // Featured image
    fd.append("featured", featuredFile);

    // Gallery images (max 20)
    galleryFiles.forEach(({ file }) => fd.append("gallery", file));

    // Basic
    fd.append("title",       form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("type",        form.type);
    fd.append("purpose",     form.purpose);
    fd.append("price",       Number(form.price));
    fd.append("currency",    form.currency);
    fd.append("featured",    String(form.isFeatured));
    if (form.purpose === "rent") fd.append("rentFrequency", form.rentFrequency);

    // Location — bracket notation
    fd.append("location[address]", form.address.trim());
    fd.append("location[city]",    form.city.trim());
    fd.append("location[country]", form.country.trim());
    if (form.state)   fd.append("location[state]",   form.state.trim());
    if (form.zipCode) fd.append("location[zipCode]", form.zipCode.trim());

    // Details — bracket notation
    if (form.bedrooms   !== "") fd.append("details[bedrooms]",   Number(form.bedrooms));
    if (form.bathrooms  !== "") fd.append("details[bathrooms]",  Number(form.bathrooms));
    if (form.squareFeet !== "") fd.append("details[squareFeet]", Number(form.squareFeet));
    if (form.parking    !== "") fd.append("details[parking]",    Number(form.parking));
    if (form.yearBuilt  !== "") fd.append("details[yearBuilt]",  Number(form.yearBuilt));
    if (form.lotSize    !== "") fd.append("details[lotSize]",    Number(form.lotSize));
    if (form.stories    !== "") fd.append("details[stories]",    Number(form.stories));
    if (form.garage     !== "") fd.append("details[garage]",     Number(form.garage));

    // Amenities
    form.amenities.forEach((a) => fd.append("amenities", a));

    // Contact
    if (form.whatsapp.trim()) fd.append("contact[whatsapp]", `${form.whatsappCode}${form.whatsapp.trim()}`);
    if (form.phone.trim())    fd.append("contact[phone]",    `${form.phoneCode}${form.phone.trim()}`);
    if (form.email.trim())    fd.append("contact[email]",    form.email.trim());

    mutation.mutate(fd);
  };

  const fieldErr = (key) =>
    errors[key] ? (
      <span style={{ fontSize:11, color:"#b91c1c", marginTop:3, display:"block" }}>{errors[key]}</span>
    ) : null;

  return (
    <div className="p-4 md:p-6 min-h-full" style={{ background:"#f8fafc", fontFamily:"system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <button onClick={onBack}
          style={{ border:"1px solid #e2e8f0", background:"#fff", borderRadius:8, padding:"7px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#475569" }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div>
          <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#000000" }}>Add Property</h1>
          <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>Fill in the details to list a new property</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ maxWidth:860, display:"flex", flexDirection:"column", gap:0 }}>

          {/* Basic Info */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <p style={sectionTitle}>Basic Information</p>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Title *</label>
              <input style={{ ...inputStyle, borderColor: errors.title?"#fca5a5":"#e2e8f0" }}
                value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Modern 3BR Apartment in Lusaka" />
              {fieldErr("title")}
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea style={{ ...inputStyle, minHeight:100, resize:"vertical", borderColor: errors.description?"#fca5a5":"#e2e8f0" }}
                value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="Describe the property..." />
              {fieldErr("description")}
            </div>
          </div>

          {/* Category */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <p style={sectionTitle}>Category</p>
            <div style={grid3}>
              <div>
                <label style={labelStyle}>Type *</label>
                <select style={inputStyle} value={form.type} onChange={e => set("type", e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Purpose *</label>
                <select style={inputStyle} value={form.purpose} onChange={e => set("purpose", e.target.value)}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              {form.purpose === "rent" && (
                <div>
                  <label style={labelStyle}>Rent Frequency</label>
                  <select style={inputStyle} value={form.rentFrequency} onChange={e => set("rentFrequency", e.target.value)}>
                    {["monthly","yearly","weekly","daily"].map(f => (
                      <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <p style={sectionTitle}>Pricing</p>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>Price *</label>
                <input type="number" min="0" style={{ ...inputStyle, borderColor: errors.price?"#fca5a5":"#e2e8f0" }}
                  value={form.price} onChange={e => set("price", e.target.value)}
                  onWheel={e => e.currentTarget.blur()} placeholder="0" />
                {fieldErr("price")}
              </div>
              <div>
                <label style={labelStyle}>Currency</label>
                <CurrencySelect value={form.currency} onChange={v => set("currency", v)} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <p style={sectionTitle}>Location</p>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Street Address *</label>
              <input style={{ ...inputStyle, borderColor: errors.address?"#fca5a5":"#e2e8f0" }}
                value={form.address} onChange={e => set("address", e.target.value)} placeholder="e.g. 123 Cairo Rd" />
              {fieldErr("address")}
            </div>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>City *</label>
                <input style={{ ...inputStyle, borderColor: errors.city?"#fca5a5":"#e2e8f0" }}
                  value={form.city} onChange={e => set("city", e.target.value)} placeholder="Lusaka" />
                {fieldErr("city")}
              </div>
              <div>
                <label style={labelStyle}>State / Province</label>
                <input style={inputStyle} value={form.state} onChange={e => set("state", e.target.value)} placeholder="Lusaka Province" />
              </div>
              <div>
                <label style={labelStyle}>Zip / Postal Code</label>
                <input style={inputStyle} value={form.zipCode} onChange={e => set("zipCode", e.target.value)} placeholder="10101" />
              </div>
              <div>
                <label style={labelStyle}>Country *</label>
                <input style={{ ...inputStyle, borderColor: errors.country?"#fca5a5":"#e2e8f0" }}
                  value={form.country} onChange={e => set("country", e.target.value)} placeholder="Zambia" />
                {fieldErr("country")}
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <p style={sectionTitle}>Property Details</p>

            {/* Featured listing toggle */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:9, marginBottom:16 }}>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#000000" }}>Featured Listing</p>
                <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8" }}>Highlight this property at the top of search results</p>
              </div>
              <button type="button" onClick={() => set("isFeatured", !form.isFeatured)}
                style={{ width:44, height:24, borderRadius:99, border:"none", cursor:"pointer", background: form.isFeatured ? "#2D368E" : "#cbd5e1", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                <span style={{ position:"absolute", top:3, left: form.isFeatured ? 22 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
            </div>

            <div style={grid2}>
              {[
                { key:"bedrooms",   label:"Bedrooms",       min:0, isRequired: RESIDENTIAL_TYPES.has(form.type) },
                { key:"bathrooms",  label:"Bathrooms",      min:0, isRequired: RESIDENTIAL_TYPES.has(form.type) },
                { key:"squareFeet", label:"Area (sq ft)",   min:0, isRequired: false },
                { key:"parking",    label:"Parking Spaces", min:0, isRequired: false },
                { key:"stories",    label:"Stories",        min:1, isRequired: false },
              ].map(({ key, label, min, isRequired }) => (
                <div key={key}>
                  <label style={labelStyle}>{label} {isRequired && <span style={{ color:"#dc2626" }}>*</span>}</label>
                  <input type="number" min={min}
                    style={{ ...inputStyle, borderColor: errors[key]?"#fca5a5":"#e2e8f0" }}
                    value={form[key]}
                    onChange={e => { set(key, e.target.value); setErrors(prev => ({ ...prev, [key]:"" })); }}
                    onWheel={e => e.currentTarget.blur()}
                    placeholder={key === "yearBuilt" ? "e.g. 2018" : "0"} />
                  {errors[key] && <span style={{ fontSize:11, color:"#b91c1c", marginTop:3, display:"block" }}>{errors[key]}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <p style={sectionTitle}>Amenities</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {AMENITIES_LIST.map(a => {
                const active = form.amenities.includes(a);
                return (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    style={{ padding:"6px 14px", borderRadius:99, fontSize:12, fontWeight:600, cursor:"pointer", border:active?"1px solid #2D368E":"1px solid #e2e8f0", background:active?"#2D368E":"#f8fafc", color:active?"#fff":"#475569", transition:"all 0.15s" }}>
                    {formatAmenity(a)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <p style={sectionTitle}>Contact Details</p>
            <p style={{ margin:"-6px 0 14px", fontSize:12, color:"#94a3b8" }}>
              Used for enquiries and Facebook post captions. WhatsApp is preferred for the call-to-action link.
            </p>
            {(!form.whatsapp.trim() && !form.phone.trim()) && (
              <div style={{ display:"flex", alignItems:"flex-start", gap:8, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"9px 12px", marginBottom:14, fontSize:12, color:"#92400e" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>No phone or WhatsApp number — Facebook posts will have no call-to-action.</span>
              </div>
            )}
            <div style={grid3}>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <PhoneInput
                  countryCode={form.whatsappCode}
                  number={form.whatsapp}
                  onCodeChange={v => set("whatsappCode", v)}
                  onNumberChange={v => set("whatsapp", v)}
                  placeholder="978032673"
                  hasError={!!errors.whatsapp}
                />
                {fieldErr("whatsapp")}
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <PhoneInput
                  countryCode={form.phoneCode}
                  number={form.phone}
                  onCodeChange={v => set("phoneCode", v)}
                  onNumberChange={v => set("phone", v)}
                  placeholder="978032673"
                  hasError={!!errors.phone}
                />
                {fieldErr("phone")}
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" style={{ ...inputStyle, borderColor: errors.email?"#fca5a5":"#e2e8f0" }}
                  value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="agent@example.com" />
                {fieldErr("email")}
              </div>
            </div>
          </div>

          {/* ── Featured Image ── */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <p style={sectionTitle}>Featured Image *</p>
            <p style={{ margin:"-6px 0 12px", fontSize:12, color:"#94a3b8" }}>Main cover image — shown in listing cards</p>
            <input ref={featuredRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onFeaturedChange} />

            {featuredPreview ? (
              <div style={{ position:"relative", display:"inline-block" }}>
                <img src={featuredPreview} alt="preview"
                  style={{ width:"100%", maxWidth:400, maxHeight:240, objectFit:"cover", borderRadius:10, border:"1px solid #e2e8f0" }} />
                <button type="button"
                  onClick={() => { setFeaturedFile(null); setFeaturedPreview(null); }}
                  style={{ position:"absolute", top:8, right:8, background:"#2D368E", border:"none", color:"#fff", borderRadius:"50%", width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div onClick={() => featuredRef.current?.click()}
                style={{ border:`2px dashed ${errors.featured?"#fca5a5":"#e2e8f0"}`, borderRadius:10, padding:"40px 20px", textAlign:"center", cursor:"pointer", background:"#f8fafc" }}>
                <Upload size={28} strokeWidth={1.5} style={{ marginBottom:8, color:"#94a3b8" }} />
                <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:600, color:"#475569" }}>Click to upload featured image</p>
                <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>JPG, PNG or WebP — max 10MB</p>
              </div>
            )}
            {fieldErr("featured")}
          </div>

          {/* ── Gallery Images ── */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Images size={16} strokeWidth={2} style={{ color:"#475569", flexShrink:0 }} />
                <span style={{ fontSize:14, fontWeight:800, color:"#000000" }}>Gallery Images</span>
                <span style={{ fontSize:11, fontWeight:500, color:"#94a3b8", background:"#f1f5f9", borderRadius:99, padding:"2px 8px" }}>optional</span>
              </div>
              <span style={{ fontSize:12, color: galleryFiles.length >= 20 ? "#dc2626" : "#94a3b8", fontWeight:600 }}>
                {galleryFiles.length} / 20
              </span>
            </div>
            <p style={{ margin:"0 0 14px", fontSize:12, color:"#94a3b8" }}>
              Additional photos shown in the property detail gallery — max 20 images
            </p>

            <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={onGalleryChange} />

            {/* Gallery grid */}
            {galleryFiles.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))", gap:10, marginBottom:12 }}>
                {galleryFiles.map(({ id, preview }) => (
                  <div key={id} style={{ position:"relative", aspectRatio:"1", borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0" }}>
                    <img src={preview} alt="gallery"
                      style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    <button type="button" onClick={() => removeGallery(id)}
                      style={{ position:"absolute", top:5, right:5, background:"rgba(15,23,42,0.75)", border:"none", color:"#fff", borderRadius:"50%", width:22, height:22, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <X size={11} />
                    </button>
                  </div>
                ))}

                {/* Add more slot */}
                {galleryFiles.length < 20 && (
                  <div onClick={() => galleryRef.current?.click()}
                    style={{ aspectRatio:"1", borderRadius:10, border:"2px dashed #e2e8f0", background:"#f8fafc", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:6 }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2D368E")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                    <Plus size={20} color="#94a3b8" />
                    <span style={{ fontSize:10, color:"#94a3b8", fontWeight:600 }}>Add More</span>
                  </div>
                )}
              </div>
            )}

            {/* Upload zone — shown when empty */}
            {galleryFiles.length === 0 && (
              <div onClick={() => galleryRef.current?.click()}
                style={{ border:"2px dashed #e2e8f0", borderRadius:10, padding:"32px 20px", textAlign:"center", cursor:"pointer", background:"#f8fafc" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2D368E")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                <Images size={28} strokeWidth={1.5} style={{ marginBottom:8, color:"#94a3b8" }} />
                <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:600, color:"#475569" }}>Click to upload gallery images</p>
                <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>Select multiple — JPG, PNG or WebP — max 10MB each</p>
              </div>
            )}

            {galleryFiles.length >= 20 && (
              <p style={{ margin:"8px 0 0", fontSize:12, color:"#dc2626", fontWeight:600 }}>
                Maximum 20 gallery images reached
              </p>
            )}
          </div>

          {/* ── Property Video (optional) ── */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 22px", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Video size={16} strokeWidth={2} style={{ color:"#475569", flexShrink:0 }} />
                <span style={{ fontSize:14, fontWeight:800, color:"#000000" }}>Property Video</span>
                <span style={{ fontSize:11, fontWeight:500, color:"#94a3b8", background:"#f1f5f9", borderRadius:99, padding:"2px 8px" }}>optional</span>
              </div>
            </div>
            <p style={{ margin:"0 0 14px", fontSize:12, color:"#94a3b8" }}>
              A walkthrough or tour video — uploaded after the property is created
            </p>

            <input ref={videoRef} type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
              style={{ display:"none" }} onChange={onVideoChange} />

            {videoFile ? (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0", marginBottom:10 }}>
                  <div style={{ width:38, height:38, borderRadius:8, background:"#eef0fb", border:"1px solid #c7cdf4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Video size={18} color="#2D368E" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#000000", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{videoFile.name}</p>
                    <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8" }}>{fmtFileSize(videoFile.size)}</p>
                  </div>
                  <button type="button" onClick={() => { setVideoFile(null); setVideoCaption(""); }}
                    style={{ background:"#fee2e2", border:"none", color:"#dc2626", borderRadius:"50%", width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <X size={12} />
                  </button>
                </div>
                <div>
                  <label style={labelStyle}>Caption (optional)</label>
                  <input style={inputStyle} value={videoCaption}
                    onChange={(e) => setVideoCaption(e.target.value)}
                    placeholder="e.g. Virtual tour of the property" maxLength={200} />
                </div>
              </div>
            ) : (
              <div onClick={() => videoRef.current?.click()}
                style={{ border:"2px dashed #e2e8f0", borderRadius:10, padding:"32px 20px", textAlign:"center", cursor:"pointer", background:"#f8fafc" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2D368E")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                <Video size={28} strokeWidth={1.5} style={{ marginBottom:8, color:"#94a3b8" }} />
                <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:600, color:"#475569" }}>Click to select a video file</p>
                <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>MP4, MOV, WebM, AVI — max 100 MB</p>
              </div>
            )}
            {videoError && (
              <span style={{ fontSize:11, color:"#b91c1c", marginTop:6, display:"block" }}>{videoError}</span>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div style={{
              border: submitError.startsWith("Property created") ? "1px solid #bbf7d0" : "1px solid #fecaca",
              background: submitError.startsWith("Property created") ? "#f0fdf4" : "#fef2f2",
              color: submitError.startsWith("Property created") ? "#15803d" : "#b91c1c",
              borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:14,
            }}>
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingBottom:32 }}>
            <button type="button" onClick={onBack}
              style={{ border:"1px solid #e2e8f0", background:"#fff", color:"#000000", borderRadius:9, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending || videoUploading}
              style={{ border:"1px solid #2D368E", background:"#2D368E", color:"#fff", borderRadius:9, padding:"10px 24px", fontSize:13, fontWeight:700, cursor:(mutation.isPending||videoUploading)?"not-allowed":"pointer", opacity:(mutation.isPending||videoUploading)?0.7:1, display:"flex", alignItems:"center", gap:8 }}>
              <Plus size={15} />
              {videoUploading ? "Uploading video..." : mutation.isPending ? "Creating..." : "Create Property"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}