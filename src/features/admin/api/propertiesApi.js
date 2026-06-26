// 📁 src/features/admin/api/propertiesApi.js

import axios from "axios";
import apiClient from "../../../services/apiClient";

// ── S3 presigned upload helper ──────────────────────────────────────────────
// Requests a presigned PUT URL from the backend, uploads the file directly to
// S3, and returns the persisted { url, key } reference.
const EXT_BY_MIME = {
  "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png",
  "image/webp": "webp", "image/heic": "heic", "image/heif": "heif",
  "video/mp4": "mp4", "video/quicktime": "mov", "video/x-msvideo": "avi",
  "video/webm": "webm", "video/x-matroska": "mkv",
};

// Keep these in sync with the backend's MAX_IMAGE_SIZE / MAX_VIDEO_SIZE.
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export const uploadViaPresign = async (file, scope) => {
  const isVideo = scope === "video";
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    throw new Error(
      `${file.name || "File"} is too large. Maximum ${isVideo ? "video" : "image"} size is ${mb}MB.`,
    );
  }

  const contentType = file.type || "application/octet-stream";
  const ext =
    EXT_BY_MIME[contentType] ||
    (file.name?.includes(".") ? file.name.split(".").pop().toLowerCase() : "bin");

  const { data } = await apiClient.post("/uploads/presign", {
    scope,
    contentType,
    ext,
    size: file.size,
  });
  const { key, uploadUrl, publicUrl } = data?.data ?? {};
  if (!uploadUrl || !key) throw new Error("Failed to obtain upload URL");

  // Direct PUT to S3 — bare axios so no auth header / baseURL is attached.
  await axios.put(uploadUrl, file, { headers: { "Content-Type": contentType } });

  return { url: publicUrl, key };
};

const uploadMany = (files, scope) =>
  Promise.all(Array.from(files).map((f) => uploadViaPresign(f, scope)));

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
  if (isDeleted || status === "inactive") return "Archived";
  if (["sold", "rented"].includes(status)) return "Sold";
  if (["active", "approved"].includes(status)) return "Active";
  if (status === "rejected") return "Rejected";
  return "Draft";
};

const normalizeDetailStatus = (status, isDeleted) => {
  if (isDeleted || status === "inactive") return "Archived";
  if (["sold", "rented"].includes(status)) return "Sold";
  if (["active", "approved"].includes(status)) return "Active";
  if (status === "pending") return "Pending Approval";
  return "Draft";
};

const formatAmenity = (amenity = "") =>
  amenity.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const resolveImageUrl = (image = {}) =>
  image?.url || image?.original?.url || null;

const PURPOSE_TO_INTENT = { sale: "For Sale", rent: "For Rent" };

const formatPrice = (amount, currency = "USD") => {
  if (typeof amount !== "number") return "-";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch { return `${currency} ${amount}`; }
};

const mapProperty = (property = {}) => {
  const hasFeatured  = !!(property.images?.featured?.url || property.images?.featured?.original?.url);
  const galleryCount = Array.isArray(property.images?.gallery) ? property.images.gallery.length : 0;
  const photoCount   = (hasFeatured ? 1 : 0) + galleryCount;
  const issues       = [];
  if (!hasFeatured)       issues.push("Missing featured image");
  if (galleryCount === 0) issues.push("No gallery images");
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
    areaUnit:        property.details?.areaUnit || "sqft",
    status:          normalizeStatus(property.status, property.isDeleted),
    rawStatus:       property.status,
    media:           { photos: photoCount, docs: 0 },
    compliance:       issues.length === 0 ? "Compliant" : `${issues.length} issue(s)`,
    complianceIssues: issues,
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
  const backendGallery = Array.isArray(property.gallery) ? property.gallery : null;
  const galleryImages  = backendGallery
    ? backendGallery.filter((g) => g.type === "image").map((g) => g.url)
    : (Array.isArray(property.images?.gallery)
        ? property.images.gallery.map((img) => resolveImageUrl(img)).filter(Boolean)
        : []);
  // backendGallery already includes the featured image — avoid duplicating it
  const images    = backendGallery
    ? [...new Set(galleryImages)].filter(Boolean)
    : [featuredImage, ...galleryImages].filter(Boolean);
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
    areaUnit:       property.details?.areaUnit || "sqft",
    amenities,
    highlights,
    documents:      Array.isArray(property.documents) ? property.documents : [],
    images,
    videos: Array.isArray(property.videos)
      ? property.videos.map((v) => ({
          _id:       v._id || v.id || null,
          url:       v.url,
          key:       v.key || v.publicId || null,
          thumbnail: v.thumbnail || null,
          caption:   v.caption || "",
        }))
      : [],
    assignedAgent:  agentName,
    assignedTo:     agentName,
    agentEmail:     property.agent?.email ?? null,
    agentPhone:     property.agent?.phone ?? null,
    agentAvatar:    property.agent?.avatar ?? null,
    agentId:        resolveEntityId(property.agent),
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
  const raw = data?.data ?? {};
  const list = Array.isArray(raw?.properties) ? raw.properties
             : Array.isArray(raw)             ? raw
             : [];
  const meta       = raw?.meta ?? {};
  const pg         = raw?.pagination ?? {};
  const total      = pg.total ?? raw?.total ?? raw?.totalCount ?? meta?.all ?? list.length;
  const limit      = pg.limit ?? raw?.limit ?? params.limit ?? 20;
  const page       = pg.page  ?? raw?.page  ?? params.page  ?? 1;
  const totalPages = pg.pages ?? raw?.totalPages ?? raw?.pages ?? Math.max(1, Math.ceil(total / limit));
  return {
    properties: list.map(mapProperty),
    meta,
    pagination: { total, page, limit, totalPages },
  };
};

// GET /api/v1/admin/properties/:id
export const fetchPropertyDetail = async (propertyId) => {
  if (!propertyId) return null;
  const { data } = await apiClient.get(`/admin/properties/${propertyId}`);
  const property = data?.data?.property;
  return property ? mapPropertyDetail(property) : null;
};

// POST /api/v1/properties  (JSON; files are presigned-uploaded to S3 first)
// payload: { body, featuredFile, galleryFiles }
export const createProperty = async ({ body, featuredFile, galleryFiles = [] }) => {
  const featuredImage = featuredFile
    ? await uploadViaPresign(featuredFile, "featured")
    : null;
  const gallery = galleryFiles.length
    ? await uploadMany(galleryFiles, "gallery")
    : [];

  const { data } = await apiClient.post("/properties", {
    ...body,
    featuredImage,
    gallery,
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
// files = { featured?: File, gallery?: File[] } — uploaded to S3 via presign,
// then their { url, key } refs are merged into the JSON body.
export const editProperty = async (propertyId, body = {}, files = {}) => {
  if (!propertyId) return null;
  const hasFeatured = !!files.featured;
  const hasGallery  = files.gallery?.length > 0;

  const payload = { ...body };
  if (hasFeatured) {
    payload.featuredImage = await uploadViaPresign(files.featured, "featured");
  }
  if (hasGallery) {
    payload.gallery = await uploadMany(files.gallery, "gallery");
  }

  const { data } = await apiClient.patch(
    `/admin/properties/${propertyId}`,
    payload,
    hasFeatured || hasGallery ? { timeout: 0 } : undefined,
  );
  const property = data?.data?.property;
  return property ? mapPropertyDetail(property) : null;
};

// DELETE /api/v1/admin/properties/:id
export const deleteProperty = async (propertyId) => {
  if (!propertyId) return null;
  const { data } = await apiClient.delete(`/admin/properties/${propertyId}`);
  return data;
};

// POST /api/v1/admin/properties/:id/video  (JSON; video presigned-uploaded to S3)
// payload: { file, caption }
export const uploadPropertyVideo = async (propertyId, { file, caption = "" }) => {
  const video = await uploadViaPresign(file, "video");
  const { data } = await apiClient.post(
    `/admin/properties/${propertyId}/video`,
    { video, caption },
    { timeout: 0 },
  );
  const property = data?.data?.property;
  return property ? mapPropertyDetail(property) : null;
};

// PUT /api/v1/admin/properties/:id/featured-image  (JSON)
export const updateFeaturedImage = async (propertyId, file) => {
  const featuredImage = await uploadViaPresign(file, "featured");
  const { data } = await apiClient.put(
    `/admin/properties/${propertyId}/featured-image`,
    { featuredImage },
    { timeout: 0 },
  );
  return data;
};

// POST /api/v1/admin/properties/:id/gallery  (JSON)
export const addGalleryImages = async (propertyId, files) => {
  const gallery = await uploadMany(files, "gallery");
  const { data } = await apiClient.post(
    `/admin/properties/${propertyId}/gallery`,
    { gallery },
    { timeout: 0 },
  );
  return data;
};

// DELETE /api/v1/admin/properties/:id/gallery/:index
export const removeGalleryImage = async (propertyId, index) => {
  const { data } = await apiClient.delete(
    `/admin/properties/${propertyId}/gallery/${index}`,
  );
  const property = data?.data?.property;
  return property ? mapPropertyDetail(property) : null;
};

// DELETE /api/v1/admin/properties/:id/video/:videoId
export const deletePropertyVideo = async (propertyId, videoId) => {
  const { data } = await apiClient.delete(
    `/admin/properties/${propertyId}/video/${videoId}`,
  );
  const property = data?.data?.property;
  return property ? mapPropertyDetail(property) : null;
};

// PATCH /api/v1/admin/properties/:id/sold
export const markPropertySold = async (propertyId) => {
  if (!propertyId) return null;
  const { data } = await apiClient.patch(`/admin/properties/${propertyId}/sold`);
  const property = data?.data?.property;
  return property ? mapProperty(property) : null;
};
