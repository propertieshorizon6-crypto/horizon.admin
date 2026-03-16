// 📁 src/features/admin/components/EditPropertyModal.jsx
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editProperty } from "../api/propertiesApi";

const TYPES = ["apartment","house","villa","townhouse","condo","land","commercial"];
const AMENITIES_LIST = [
  "parking","gym","pool","garden","balcony","elevator","security",
  "petFriendly","furnished","airConditioning","heating","fireplace",
  "laundry","dishwasher","hardwoodFloors","internet","cableTV",
  "unfurnished","semi-furnished",
];
const formatAmenity = (a) =>
  a.replace(/([A-Z])/g," $1").replace(/[-_]/g," ").trim()
   .replace(/\b\w/g, c => c.toUpperCase());

const labelStyle = { display:"block", fontSize:12, fontWeight:700, color:"#475569", marginBottom:5 };
const inputStyle = {
  width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid #e2e8f0",
  fontSize:13, color:"#0f172a", background:"#fff", outline:"none", boxSizing:"border-box",
};
const grid2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };
const sectionLabel = { fontSize:11, fontWeight:800, color:"#94a3b8", textTransform:"uppercase",
  letterSpacing:"0.06em", margin:"18px 0 10px" };

// Parse raw property data from propertiesApi for editing
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

export default function EditPropertyModal({ property, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(toEditState(property));
  const [submitError, setSubmitError] = useState("");

  // Re-initialise when a different property is passed
  useEffect(() => { setForm(toEditState(property)); setSubmitError(""); }, [property]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleAmenity = (a) =>
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a],
    }));

  const mutation = useMutation({
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
          ? details.map(e => `${e.field || e.path?.join(".") || "Field"}: ${e.message}`).join(" | ")
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
    // Strip undefined or empty string keys to avoid Zod min-length validation errors
    Object.keys(body).forEach(k => { 
      if (body[k] === undefined || body[k] === "") {
        delete body[k]; 
      }
    });
    mutation.mutate(body);
  };

  return (
    <div
      onClick={mutation.isPending ? undefined : onClose}
      style={{ position:"fixed", inset:0, zIndex:3000, background:"rgba(15,23,42,0.5)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width:"100%", maxWidth:680, maxHeight:"90vh", overflowY:"auto",
          background:"#fff", borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", border:"1px solid #e2e8f0" }}
      >
        {/* Modal Header */}
        <div style={{ position:"sticky", top:0, zIndex:1, background:"#fff",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"16px 20px", borderBottom:"1px solid #f1f5f9" }}>
          <div>
            <p style={{ margin:0, fontSize:16, fontWeight:800, color:"#0f172a" }}>Edit Property</p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>{property?.title}</p>
          </div>
          <button type="button" onClick={onClose} disabled={mutation.isPending}
            style={{ border:"1px solid #e2e8f0", background:"#fff", borderRadius:8,
              color:"#475569", padding:"6px 12px", fontSize:12, fontWeight:600,
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              opacity: mutation.isPending ? 0.6 : 1 }}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding:"16px 20px 24px" }}>

            {/* Basic */}
            <p style={sectionLabel}>Basic Information</p>
            <div style={{ marginBottom:12 }}>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight:80, resize:"vertical" }}
                value={form.description} onChange={e => set("description", e.target.value)} />
            </div>

            {/* Category & Status */}
            <p style={sectionLabel}>Category & Status</p>
            <div style={{ ...grid2, marginBottom:12 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select style={inputStyle} value={form.type} onChange={e => set("type", e.target.value)}>
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
                  <select style={inputStyle} value={form.rentFrequency} onChange={e => set("rentFrequency", e.target.value)}>
                    {["monthly","yearly","weekly","daily"].map(f => (
                      <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.status} onChange={e => set("status", e.target.value)}>
                  {["draft","pending","active","approved","rejected","sold","rented","inactive"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <p style={sectionLabel}>Pricing</p>
            <div style={{ ...grid2, marginBottom:12 }}>
              <div>
                <label style={labelStyle}>Price</label>
                <input type="number" min="0" style={inputStyle}
                  value={form.price} onChange={e => set("price", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Currency</label>
                <input style={inputStyle} value={form.currency} onChange={e => set("currency", e.target.value)} />
              </div>
            </div>

            {/* Location */}
            <p style={sectionLabel}>Location</p>
            <div style={{ marginBottom:12 }}>
              <label style={labelStyle}>Street Address</label>
              <input style={inputStyle} value={form.address} onChange={e => set("address", e.target.value)} />
            </div>
            <div style={{ ...grid2, marginBottom:12 }}>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.city} onChange={e => set("city", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>State / Province</label>
                <input style={inputStyle} value={form.state} onChange={e => set("state", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Zip / Postal Code</label>
                <input style={inputStyle} value={form.zipCode} onChange={e => set("zipCode", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input style={inputStyle} value={form.country} onChange={e => set("country", e.target.value)} />
              </div>
            </div>

            {/* Details */}
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
                    value={form[key]} onChange={e => set(key, e.target.value)} />
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
                    style={{
                      padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:600, cursor:"pointer",
                      border: active ? "1px solid #1e293b" : "1px solid #e2e8f0",
                      background: active ? "#1e293b" : "#f8fafc",
                      color: active ? "#fff" : "#475569",
                      transition:"all 0.15s",
                    }}>
                    {formatAmenity(a)}
                  </button>
                );
              })}
            </div>

            {/* Error */}
            {submitError && (
              <div style={{ border:"1px solid #fecaca", background:"#fef2f2", color:"#b91c1c",
                borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:14 }}>
                {submitError}
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:4 }}>
              <button type="button" onClick={onClose} disabled={mutation.isPending}
                style={{ border:"1px solid #e2e8f0", background:"#fff", color:"#334155",
                  borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600,
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                  opacity: mutation.isPending ? 0.6 : 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={mutation.isPending}
                style={{ border:"1px solid #1e293b", background:"#1e293b", color:"#fff",
                  borderRadius:8, padding:"9px 24px", fontSize:13, fontWeight:700,
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                  opacity: mutation.isPending ? 0.7 : 1 }}>
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
