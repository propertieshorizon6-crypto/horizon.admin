import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_LEADS = [];

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

const mapLeadStatus = (lead = {}) => {
  if (lead.isArchived) return "Archived";

  switch (lead.status) {
    case "new":
      return "New";
    case "contacted":
      return "Assigned";
    case "nurturing":
    case "qualified":
      return "In Progress";
    case "converted":
    case "lost":
    default:
      return "Closed";
  }
};

const mapPriority = (status) => {
  if (status === "New") return "High";
  if (status === "Assigned" || status === "In Progress") return "Medium";
  return "Low";
};

const mapLead = (lead = {}) => {
  const status = mapLeadStatus(lead);
  const sourceType = lead.source?.type;

  return {
    id: lead._id,
    name: lead.name || "Unknown",
    email: lead.email || null,
    phone: lead.phone || null,
    property: lead.source?.property?.title || "Property",
    source: sourceType === "tour" ? "App" : "Website",
    intent: sourceType === "tour" ? "Tour" : "Inquiry",
    status,
    priority: mapPriority(status),
    assignedTo: formatName(lead.assignedTo),
    createdAt: lead.createdAt,
  };
};

export const fetchLeads = async (params = {}) => {
  const { data } = await apiClient.get("/leads", { params });
  const leads = data?.data?.leads ?? [];
  return leads.map(mapLead);
};
