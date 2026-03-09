import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_PROPERTIES = [];

const toTitle = (value = "") =>
  value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : "";

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

const normalizeStatus = (status, isDeleted) => {
  if (isDeleted || ["inactive", "sold", "rented"].includes(status)) {
    return "Archived";
  }

  if (["active", "approved"].includes(status)) {
    return "Active";
  }

  return "Draft";
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
    type: toTitle(property.type),
  };
};

export const fetchProperties = async (params = {}) => {
  const { data } = await apiClient.get("/admin/properties", { params });
  const properties = data?.data?.properties ?? [];
  return properties.map(mapProperty);
};
