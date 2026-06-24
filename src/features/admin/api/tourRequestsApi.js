// 📁 src/features/admin/api/tourRequestsApi.js

import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_TOURS = [];

const TOUR_STATUS_LABEL = {
  pending:   "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

const formatDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  if (timeValue && /^\d{2}:\d{2}$/.test(timeValue)) {
    const [h, m] = timeValue.split(":").map(Number);
    date.setHours(h, m, 0, 0);
  }
  return date.toLocaleString(undefined, { month:"short", day:"2-digit", year:"numeric", hour:"numeric", minute:"2-digit" });
};

const resolveLocation = (property = {}) => {
  if (!property || typeof property !== "object") return "Location unavailable";
  if (typeof property.location === "string") return property.location;
  const parts = [property.location?.city, property.location?.state, property.location?.address].filter(Boolean);
  return parts.join(", ") || "Location unavailable";
};

const mapTour = (tour = {}) => {
  const preferredSlot   = formatDateTime(tour.preferredDate, tour.preferredTime);
  const finalSlot       = formatDateTime(tour.confirmedDate, tour.confirmedTime);
  const preferredDateMs = new Date(tour.preferredDate || 0).getTime();
  const normalizedStatus= String(tour.status || "").toLowerCase();
  const isPending       = normalizedStatus === "pending";

  return {
    id:           tour._id,
    createdAt:    formatDateTime(tour.createdAt),
    property: {
      name:     tour.property?.title || "Property",
      location: resolveLocation(tour.property),
    },
    customer: {
      name:  tour.name  || tour.lead?.name  || "Unknown",
      phone: tour.phone || tour.lead?.phone || "N/A",
      email: tour.email || tour.lead?.email || null,
    },
    visitType:    String(tour.visitType || "in-person") === "virtual" ? "virtual" : "physical",
    preferredSlot,
    finalSlot,
    agent:        formatName(tour.agent),
    agentId:      tour.agent?._id || tour.agent?.id || null,
    leadId:       tour.lead?._id || null,
    status:       TOUR_STATUS_LABEL[normalizedStatus] || "Requested",
    sla:          isPending && preferredDateMs && preferredDateMs < Date.now() ? "Overdue" : null,
  };
};

const toToursPayload = (responseData = {}) => {
  const payload   = responseData?.data ?? {};
  const tours      = Array.isArray(payload.tours) ? payload.tours : [];
  const pagination = payload.pagination ?? {};
  return { tours, pagination };
};

// ── Fetch tours (server-side filter + pagination) ─────────────────────────────
// Supports status, date, agentId, search, page, limit. Returns { tours, pagination }.
export const fetchTourRequests = async (params = {}) => {
  const allowed = ["status","date","agentId","search","visitType","page","limit"];
  const clean   = {};
  allowed.forEach((k) => { if (params[k] !== undefined && params[k] !== null && params[k] !== "") clean[k] = params[k]; });

  const { data } = await apiClient.get("/tours", { params: { page: 1, limit: 20, ...clean } });
  const { tours, pagination } = toToursPayload(data);
  return {
    tours: tours.map(mapTour),
    pagination: {
      page:  pagination.page  ?? clean.page  ?? 1,
      limit: pagination.limit ?? clean.limit ?? 20,
      total: pagination.total ?? tours.length,
      pages: pagination.pages ?? 1,
    },
  };
};

// ── Confirm tour ──────────────────────────────────────────────────────────────
// PATCH /api/v1/tours/:id/confirm
// Body: { confirmedDate, confirmedTime } (optional)
export const confirmTourRequest = async (tourId, payload = {}) => {
  const { data } = await apiClient.patch(`/tours/${tourId}/confirm`, payload);
  return mapTour(data?.data?.tour ?? {});
};

// ── Complete tour ─────────────────────────────────────────────────────────────
// PATCH /api/v1/tours/:id/complete
export const completeTourRequest = async (tourId) => {
  const { data } = await apiClient.patch(`/tours/${tourId}/complete`);
  return mapTour(data?.data?.tour ?? {});
};

// ── Cancel tour ───────────────────────────────────────────────────────────────
// PATCH /api/v1/tours/:id/cancel
export const cancelTourRequest = async (tourId, reason = "Cancelled by admin") => {
  const { data } = await apiClient.patch(`/tours/${tourId}/cancel`, { reason });
  return mapTour(data?.data?.tour ?? {});
};

// ── Reschedule tour ───────────────────────────────────────────────────────────
// PATCH /api/v1/tours/:id/reschedule
export const rescheduleTourRequest = async (tourId, payload) => {
  const { data } = await apiClient.patch(`/tours/${tourId}/reschedule`, payload);
  return mapTour(data?.data?.tour ?? {});
};

// ── Assign agent to tour ──────────────────────────────────────────────────────
// PATCH /api/v1/tours/:id/assign
// Body: { agentId: "<uuid>" | null }
export const assignTourAgent = async (tourId, agentId) => {
  const { data } = await apiClient.patch(`/tours/${tourId}/assign`, {
    agentId: agentId || null,
  });
  return mapTour(data?.data?.tour ?? {});
};