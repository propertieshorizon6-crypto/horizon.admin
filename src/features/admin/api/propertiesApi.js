import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_PROPERTIES = [];

const toTitle = (value = "") =>
  value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : "";

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

const resolveEntityId = (user = {}) => user?._id || user?.id || null;

const normalizeStatus = (status, isDeleted) => {
  if (isDeleted || ["inactive", "sold", "rented"].includes(status)) {
    return "Archived";
  }

  if (["active", "approved"].includes(status)) {
    return "Active";
  }

  return "Draft";
};

const normalizeDetailStatus = (status, isDeleted) => {
  if (isDeleted || ["inactive", "sold", "rented"].includes(status)) {
    return "Archived";
  }

  if (["active", "approved"].includes(status)) {
    return "Active";
  }

  if (status === "pending") {
    return "Pending Approval";
  }

  return "Draft";
};

const formatAmenity = (amenity = "") =>
  amenity
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveImageUrl = (image = {}) =>
  image.large?.url ||
  image.medium?.url ||
  image.original?.url ||
  image.thumbnail?.url ||
  null;

const PURPOSE_TO_INTENT = {
  sale: "For Sale",
  rent: "For Rent",
};

const formatPrice = (amount, currency = "USD") => {
  if (typeof amount !== "number") return "-";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const mapProperty = (property = {}) => {
  const hasFeatured = !!property.images?.featured?.original?.url;
  const galleryCount = Array.isArray(property.images?.gallery)
    ? property.images.gallery.length
    : 0;

  const photoCount = (hasFeatured ? 1 : 0) + galleryCount;
  const isCompliant = hasFeatured && galleryCount > 0;

  const location = [
    property.location?.city,
    property.location?.state,
  ].filter(Boolean).join(", ");

  return {
    id: property._id,
    title: property.title || "Untitled",
    location: location || "Location unavailable",
    price: formatPrice(property.price, property.currency),
    beds: property.details?.bedrooms ?? null,
    baths: property.details?.bathrooms ?? null,
    area: property.details?.squareFeet ?? 0,
    status: normalizeStatus(property.status, property.isDeleted),
    media: { photos: photoCount, docs: 0 },
    compliance: isCompliant ? "Compliant" : "1 issue(s)",
    assignedTo: formatName(property.agent) || formatName(property.owner),
    assignedAgentId: resolveEntityId(property.agent),
    assignedOwnerId: resolveEntityId(property.owner),
    type: toTitle(property.type),
  };
};

const mapPropertyDetail = (property = {}) => {
  const address = [
    property.location?.address,
    property.location?.city,
    property.location?.state,
    property.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const featuredImage = resolveImageUrl(property.images?.featured);
  const galleryImages = Array.isArray(property.images?.gallery)
    ? property.images.gallery.map((image) => resolveImageUrl(image)).filter(Boolean)
    : [];

  const images = [featuredImage, ...galleryImages].filter(Boolean);
  const amenities = Array.isArray(property.amenities)
    ? property.amenities.map(formatAmenity)
    : [];

  const highlights = [];
  if (property.featured) highlights.push("Featured Listing");
  if ((property.stats?.views ?? 0) > 0) highlights.push(`${property.stats.views} Views`);
  if ((property.stats?.favorites ?? 0) > 0) highlights.push(`${property.stats.favorites} Favorites`);
  if ((property.stats?.inquiries ?? 0) > 0) highlights.push(`${property.stats.inquiries} Inquiries`);
  if ((property.details?.parking ?? 0) > 0) highlights.push(`${property.details.parking} Parking Space(s)`);
  if (property.approvalStatus?.status === "pending") highlights.push("Pending Review");

  const ownerName = formatName(property.owner);
  const agentName = formatName(property.agent);
  const purpose = String(property.purpose || "").toLowerCase();

  return {
    id: property._id,
    title: property.title || "Untitled",
    description: property.description || "",
    location: address || "Location unavailable",
    price: property.price,
    currency: property.currency || "USD",
    status: normalizeDetailStatus(property.status, property.isDeleted),
    featured: Boolean(property.featured),
    type: toTitle(property.type),
    category: toTitle(property.purpose),
    intent: PURPOSE_TO_INTENT[purpose] || "For Sale",
    visibility: ["active", "approved"].includes(property.status) ? "Public" : "Internal",
    bedrooms: property.details?.bedrooms ?? null,
    bathrooms: property.details?.bathrooms ?? null,
    area: property.details?.squareFeet ?? 0,
    amenities,
    highlights,
    documents: Array.isArray(property.documents) ? property.documents : [],
    images,
    assignedAgent: agentName,
    assignedTo: agentName,
    createdBy: ownerName || "Admin User",
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
};

export const fetchProperties = async (params = {}) => {
  const { data } = await apiClient.get("/admin/properties", { params });
  const properties = data?.data?.properties ?? [];
  return properties.map(mapProperty);
};

export const fetchPropertyDetail = async (propertyId) => {
  if (!propertyId) return null;

  const { data } = await apiClient.get(`/admin/properties/${propertyId}`);
  const property = data?.data?.property;
  return property ? mapPropertyDetail(property) : null;
};
