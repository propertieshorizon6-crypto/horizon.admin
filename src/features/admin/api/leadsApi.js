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

const API_TO_UI_PRIORITY = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const UI_TO_API_PRIORITY = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Urgent: "urgent",
};

const normalizePriority = (priority, status) => {
  const mapped = API_TO_UI_PRIORITY[String(priority || "").toLowerCase()];
  return mapped ?? mapPriority(status);
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
    priority: normalizePriority(lead.priority, status),
    assignedTo: formatName(lead.assignedTo),
    assignedAgentId: lead.assignedTo?._id || lead.assignedTo || null,
    createdAt: lead.createdAt,
  };
};

export const fetchLeads = async (params = {}) => {
  const { data } = await apiClient.get("/leads", { params });
  const leads = data?.data?.leads ?? [];
  return leads.map(mapLead);
};

export const updateLeadPriority = async (leadId, priority) => {
  const apiPriority = UI_TO_API_PRIORITY[priority] ?? String(priority || "").toLowerCase();
  const { data } = await apiClient.patch(`/leads/${leadId}`, { priority: apiPriority });
  return data?.data?.lead ?? null;
};

export const assignLead = async (leadId, agentId = null) => {
  if (!leadId) return null;
  const { data } = await apiClient.patch(`/leads/${leadId}/assign`, {
    agentId: agentId || null,
  });
  return data?.data?.lead ?? null;
};
