import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_INQUIRIES = [];

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

// Frontend label → backend status
const STATUS_TO_API = {
  "Open":        "new",
  "In Progress": "contacted",
  "Closed":      "closed",
};

// Backend status → frontend label
const mapStatus = (status) => {
  switch (status) {
    case "new":       return "Open";
    case "contacted": return "In Progress";
    case "closed":
    default:          return "Closed";
  }
};

const buildSla = (createdAt, mappedStatus) => {
  if (mappedStatus === "Closed") return { label: "Done", urgent: false };
  const createdMs = new Date(createdAt || 0).getTime();
  if (!createdMs) return { label: "Unknown", urgent: false };
  const ageHours = (Date.now() - createdMs) / (1000 * 60 * 60);
  if (ageHours >= 24) return { label: "Overdue", urgent: true };
  const remaining = Math.max(0, Math.ceil(24 - ageHours));
  return { label: `${remaining}h left`, urgent: remaining <= 2 };
};

const mapInquiry = (inquiry = {}) => {
  const status = mapStatus(inquiry.status);
  return {
    _id:      inquiry._id,
    id:       `INQ-${String(inquiry._id || "").slice(-6).toUpperCase()}`,
    createdAt: inquiry.createdAt,
    source:   "Website",
    property: inquiry.property?.title || "Property",
    propertyId: inquiry.property?._id || inquiry.property || null,
    customer: {
      name:  inquiry.name  || "Unknown",
      email: inquiry.email || null,
      phone: inquiry.phone || null,
    },
    agent:   formatName(inquiry.agent),
    message: inquiry.message || null,
    status,
    rawStatus: inquiry.status,
    sla: buildSla(inquiry.createdAt, status),
  };
};

// GET /api/v1/enquiries
export const fetchInquiries = async (params = {}) => {
  const { data } = await apiClient.get("/enquiries", { params });
  const enquiries = data?.data?.enquiries ?? [];
  return enquiries.map(mapInquiry);
};

// PATCH /api/v1/enquiries/:id/status
export const updateInquiryStatus = async (inquiryId, frontendStatus) => {
  const apiStatus = STATUS_TO_API[frontendStatus] ?? "closed";
  const { data } = await apiClient.patch(`/enquiries/${inquiryId}/status`, {
    status: apiStatus,
  });
  const enquiry = data?.data?.enquiry;
  return enquiry ? mapInquiry(enquiry) : null;
};