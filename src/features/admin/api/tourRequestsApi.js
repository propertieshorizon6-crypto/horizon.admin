import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_TOURS = [];

const TOUR_STATUS_LABEL = {
  pending: "Requested",
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
    const [hours, minutes] = timeValue.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const resolveLocation = (property = {}) => {
  if (!property || typeof property !== "object") {
    return "Location unavailable";
  }

  if (typeof property.location === "string") return property.location;

  const parts = [
    property.location?.city,
    property.location?.state,
    property.location?.address,
  ].filter(Boolean);

  return parts.join(", ") || "Location unavailable";
};

const mapTour = (tour = {}) => {
  const preferredSlot = formatDateTime(tour.preferredDate, tour.preferredTime);
  const finalSlot = formatDateTime(tour.confirmedDate, tour.confirmedTime);
  const preferredDateMs = new Date(tour.preferredDate || 0).getTime();
  const normalizedStatus = String(tour.status || "").toLowerCase();
  const isPending = normalizedStatus === "pending";

  return {
    id: tour._id,
    createdAt: formatDateTime(tour.createdAt),
    source: "website",
    property: {
      name: tour.property?.title || "Property",
      location: resolveLocation(tour.property),
    },
    customer: {
      name: tour.name || tour.lead?.name || "Unknown",
      phone: tour.phone || tour.lead?.phone || "N/A",
      email: tour.email || tour.lead?.email || null,
    },
    visitType: "physical",
    preferredSlot,
    finalSlot,
    agent: formatName(tour.agent),
    status: TOUR_STATUS_LABEL[normalizedStatus] || "Requested",
    sla: isPending && preferredDateMs && preferredDateMs < Date.now() ? "Overdue" : null,
  };
};

const toToursPayload = (responseData = {}) => {
  const payload = responseData?.data ?? {};
  const tours = Array.isArray(payload.tours) ? payload.tours : [];
  const pagination = payload.pagination ?? {};

  return { tours, pagination };
};

const normalizeTourQueryParams = (params = {}) => {
  const allowedKeys = ["status", "date", "agentId", "page", "limit"];
  const cleanParams = {};

  allowedKeys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(params, key)) return;

    const value = params[key];
    if (value === undefined || value === null || value === "") return;

    cleanParams[key] = value;
  });

  return cleanParams;
};

export const fetchTourRequests = async (params = {}) => {
  const safeParams = normalizeTourQueryParams(params);
  const hasExplicitPagination =
    Object.prototype.hasOwnProperty.call(safeParams, "page") ||
    Object.prototype.hasOwnProperty.call(safeParams, "limit");

  if (hasExplicitPagination) {
    const { data } = await apiClient.get("/tours", { params: safeParams });
    const { tours } = toToursPayload(data);
    return tours.map(mapTour);
  }

  const baseParams = { ...safeParams, page: 1, limit: 100 };
  const { data: firstPageData } = await apiClient.get("/tours", {
    params: baseParams,
  });

  const firstPage = toToursPayload(firstPageData);
  const allTours = [...firstPage.tours];
  const totalPages = Number(firstPage.pagination?.pages) || 1;

  if (totalPages > 1) {
    const remainingRequests = [];

    for (let page = 2; page <= totalPages; page += 1) {
      remainingRequests.push(
        apiClient.get("/tours", { params: { ...baseParams, page } }),
      );
    }

    const remainingResponses = await Promise.all(remainingRequests);
    remainingResponses.forEach(({ data }) => {
      const { tours } = toToursPayload(data);
      allTours.push(...tours);
    });
  }

  return allTours.map(mapTour);
};

export const confirmTourRequest = async (tourId, payload = {}) => {
  const { data } = await apiClient.patch(`/tours/${tourId}/confirm`, payload);
  return mapTour(data?.data?.tour ?? {});
};

export const completeTourRequest = async (tourId) => {
  const { data } = await apiClient.patch(`/tours/${tourId}/complete`);
  return mapTour(data?.data?.tour ?? {});
};

export const cancelTourRequest = async (tourId, reason = "Cancelled by admin") => {
  const { data } = await apiClient.patch(`/tours/${tourId}/cancel`, { reason });
  return mapTour(data?.data?.tour ?? {});
};

export const rescheduleTourRequest = async (tourId, payload) => {
  const { data } = await apiClient.patch(`/tours/${tourId}/reschedule`, payload);
  return mapTour(data?.data?.tour ?? {});
};

