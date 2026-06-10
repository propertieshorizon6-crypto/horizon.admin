// 📁 src/features/admin/api/propertiesApi.js

import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_PROPERTIES = [];

// ── Normalizers ───────────────────────────────────────────────────────────────
const toTitle = (value = "") =>
  value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : "";

const formatName = (user) => {
  if (!user) return null;
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;
};

const resolveEntityId = (user = {}) => user?._id || user?.id || null;

const normalizeStatus = (status, isDeleted) => {
  if (isDeleted || ["inactive", "sold", "rented"].includes(status)) return "Archived";
  if (["active", "approved"].includes(status)) return "Active";
  return "Draft";
};

const normalizeDetailStatus = (status, isDeleted) => {
  if (isDeleted || ["inactive", "sold", "rented"].includes(status)) return "Archived";
  if (["active", "approved"].includes(status)) return "Active";
  if (status === "pending") return "Pending Approval";
  return "Draft";
};

const formatAmenity = (amenity = "") =>
  amenity.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const resolveImageUrl = (image = {}) =>
  image.large?.url || image.medium?.url || image.original?.url || image.thumbnail?.url || null;

const PURPOSE_TO_INTENT = { sale: "For Sale", rent: "For Rent" };

const formatPrice = (amount, currency = "USD") => {
  if (typeof amount !== "number") return "-";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch { return `${currency} ${amount}`; }
};

const mapProperty = (property = {}) => {
  const hasFeatured  = !!property.images?.featured?.original?.url;
  const galleryCount = Array.isArray(property.images?.gallery) ? property.images.gallery.length : 0;
  const photoCount   = (hasFeatured ? 1 : 0) + galleryCount;
  const isCompliant  = hasFeatured && galleryCount > 0;
  const location     = [property.location?.city, property.location?.state].filter(Boolean).join(", ");
  const agentName    = formatName(property.agent);
  const ownerName    = formatName(property.owner);

  return {
    id:              property._id,
    title:           property.title || "Untitled",
    location:        location || "Location unavailable",
    price:           formatPrice(property.price, property.currency),
    beds:            property.details?.bedrooms  ?? null,
    baths:           property.details?.bathrooms ?? null,
    area:            property.details?.squareFeet ?? 0,
    status:          normalizeStatus(property.status, property.isDeleted),
    rawStatus:       property.status,
    media:           { photos: photoCount, docs: 0 },
    compliance:      isCompliant ? "Compliant" : "1 issue(s)",
    assignedTo:      agentName,
    ownerName,
    assignedAgentId: resolveEntityId(property.agent),
    assignedOwnerId: resolveEntityId(property.owner),
    type:            toTitle(property.type),
    rawPrice:        property.price,
    currency:        property.currency,
    rawAddress:      property.location?.address,
    rawCity:         property.location?.city,
    rawState:        property.location?.state,
    rawZip:          property.location?.zipCode,
    rawCountry:      property.location?.country,
    rentFrequency:   property.rentFrequency,
    purpose:         property.purpose,
    parking:         property.details?.parking,
    description:     property.description,
    featured:        Boolean(property.featured),
  };
};

const mapPropertyDetail = (property = {}) => {
  const address = [property.location?.address, property.location?.city, property.location?.state, property.location?.country].filter(Boolean).join(", ");
  const featuredImage  = resolveImageUrl(property.images?.featured);
  // Use the backend-computed gallery array (videos first, then images) when available
  const backendGallery = Array.isArray(property.gallery) ? property.gallery : null;
  const galleryImages  = backendGallery
    ? backendGallery.filter((g) => g.type === "image").map((g) => g.url)
    : (Array.isArray(property.images?.gallery)
        ? property.images.gallery.map((img) => resolveImageUrl(img)).filter(Boolean)
        : []);
  const images    = [featuredImage, ...galleryImages].filter(Boolean);
  const amenities = Array.isArray(property.amenities) ? property.amenities.map(formatAmenity) : [];
  const highlights = [];
  if (property.featured) highlights.push("Featured Listing");
  if ((property.stats?.views ?? 0) > 0) highlights.push(`${property.stats.views} Views`);
  if ((property.stats?.favorites ?? 0) > 0) highlights.push(`${property.stats.favorites} Favorites`);
  if ((property.stats?.inquiries ?? 0) > 0) highlights.push(`${property.stats.inquiries} Inquiries`);
  if ((property.details?.parking ?? 0) > 0) highlights.push(`${property.details.parking} Parking Space(s)`);
  if (property.approvalStatus?.status === "pending") highlights.push("Pending Review");

  const agentName = formatName(property.agent);
  const ownerName = formatName(property.owner);
  const purpose   = String(property.purpose || "").toLowerCase();

  return {
    id:             property._id,
    title:          property.title || "Untitled",
    description:    property.description || "",
    location:       address || "Location unavailable",
    price:          property.price,
    currency:       property.currency || "USD",
    status:         normalizeDetailStatus(property.status, property.isDeleted),
    rawStatus:      property.status,
    featured:       Boolean(property.featured),
    type:           toTitle(property.type),
    category:       toTitle(property.purpose),
    intent:         PURPOSE_TO_INTENT[purpose] || "For Sale",
    visibility:     ["active", "approved"].includes(property.status) ? "Public" : "Internal",
    bedrooms:       property.details?.bedrooms  ?? null,
    bathrooms:      property.details?.bathrooms ?? null,
    area:           property.details?.squareFeet ?? 0,
    amenities,
    highlights,
    documents:      Array.isArray(property.documents) ? property.documents : [],
    images,
    videos: Array.isArray(property.videos)
      ? property.videos.map((v) => ({
          _id:       v._id || v.id || null,
          url:       v.url,
          publicId:  v.publicId,
          thumbnail: v.thumbnail || null,
          caption:   v.caption || "",
        }))
      : [],
    assignedAgent:  agentName,
    assignedTo:     agentName,
    createdBy:      ownerName || "Admin User",
    createdAt:      property.createdAt,
    updatedAt:      property.updatedAt,
    rawPrice:       property.price,
    rawAddress:     property.location?.address,
    rawCity:        property.location?.city,
    rawState:       property.location?.state,
    rawZip:         property.location?.zipCode,
    rawCountry:     property.location?.country,
    rentFrequency:  property.rentFrequency,
    purpose:        property.purpose,
    parking:        property.details?.parking,
    rawAmenities:    Array.isArray(property.amenities) ? property.amenities : [],
    approvalStatus:  property.approvalStatus ?? null,
    featuredImageUrl: featuredImage,
    galleryImages:   Array.isArray(property.images?.gallery)
      ? property.images.gallery
          .map((img, index) => ({ url: resolveImageUrl(img), index }))
          .filter((item) => item.url)
      : [],
  };
};

// ── API Functions ─────────────────────────────────────────────────────────────

// GET /api/v1/admin/properties
export const fetchProperties = async (params = {}) => {
  const { data } = await apiClient.get("/admin/properties", { params });
  const properties = data?.data?.properties ?? data?.data ?? data ?? [];
  return Array.isArray(properties) ? properties.map(mapProperty) : [];
};

// GET /api/v1/admin/properties/:id
export const fetchPropertyDetail = async (propertyId) => {
  if (!propertyId) return null;
  const { data } = await apiClient.get(`/admin/properties/${propertyId}`);
  const property = data?.data?.property;
  return property ? mapPropertyDetail(property) : null;
};

// POST /api/v1/properties  (multipart/form-data)
export const createProperty = async (formData) => {
  const { data } = await apiClient.post("/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// PATCH /api/v1/admin/properties/:id/assign-agent
export const assignPropertyAgent = async (propertyId, agentId = null) => {
  if (!propertyId) return null;
  const { data } = await apiClient.patch(
    `/admin/properties/${propertyId}/assign-agent`,
    { agentId: agentId || null },
  );
  const property = data?.data?.property;
  return property ? mapProperty(property) : null;
};

// POST /api/v1/admin/properties/:id/approve
export const approveProperty = async (propertyId, notes = "") => {
  const { data } = await apiClient.post(`/admin/properties/${propertyId}/approve`, { notes });
  return data;
};

// POST /api/v1/admin/properties/:id/reject
export const rejectProperty = async (propertyId, reason) => {
  const { data } = await apiClient.post(`/admin/properties/${propertyId}/reject`, { reason });
  return data;
};

// PATCH /api/v1/admin/properties/:id/unpublish
export const unpublishProperty = async (propertyId, reason = "") => {
  const { data } = await apiClient.patch(`/admin/properties/${propertyId}/unpublish`, { reason });
  return data;
};

// PATCH /api/v1/admin/properties/:id/republish
export const republishProperty = async (propertyId) => {
  const { data } = await apiClient.patch(`/admin/properties/${propertyId}/republish`);
  return data;
};

// PATCH /api/v1/admin/properties/:id
export const editProperty = async (propertyId, body) => {
  if (!propertyId) return null;
  const { data } = await apiClient.patch(`/admin/properties/${propertyId}`, body);
  const property = data?.data?.property;
  return property ? mapProperty(property) : null;
};

// DELETE /api/v1/admin/properties/:id
export const deleteProperty = async (propertyId) => {
  if (!propertyId) return null;
  const { data } = await apiClient.delete(`/admin/properties/${propertyId}`);
  return data;
};

// POST /api/v1/admin/properties/:id/video  (multipart/form-data, field: "video")
// timeout:0 — video can be up to 100 MB; skip the global 15s Axios timeout
export const uploadPropertyVideo = async (propertyId, formData) => {
  const { data } = await apiClient.post(
    `/admin/properties/${propertyId}/video`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" }, timeout: 0 },
  );
  return data;
};

// PUT /api/v1/admin/properties/:id/featured-image
export const updateFeaturedImage = async (propertyId, formData) => {
  const { data } = await apiClient.put(
    `/admin/properties/${propertyId}/featured-image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" }, timeout: 0 },
  );
  return data;
};

// POST /api/v1/admin/properties/:id/gallery
export const addGalleryImages = async (propertyId, formData) => {
  const { data } = await apiClient.post(
    `/admin/properties/${propertyId}/gallery`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" }, timeout: 0 },
  );
  return data;
};

// DELETE /api/v1/admin/properties/:id/gallery/:index
export const removeGalleryImage = async (propertyId, index) => {
  const { data } = await apiClient.delete(
    `/admin/properties/${propertyId}/gallery/${index}`,
  );
  return data;
};

// DELETE /api/v1/admin/properties/:id/video/:videoId
export const deletePropertyVideo = async (propertyId, videoId) => {
  const { data } = await apiClient.delete(
    `/admin/properties/${propertyId}/video/${videoId}`,
  );
  return data;
};