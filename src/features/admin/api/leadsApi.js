import apiClient from '../../../services/apiClient';

export const MOCK_MODE = false;
export const MOCK_LEADS = [];

const formatName = (user = {}) =>
  `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;

const mapLeadStatus = (lead = {}) => {
  if (lead.isArchived) return 'Archived';
  switch (lead.status) {
    case 'new':
      return 'New';
    case 'contacted':
      return 'Assigned';
    case 'nurturing':
    case 'qualified':
      return 'In Progress';
    case 'converted':
    case 'lost':
    default:
      return 'Closed';
  }
};

const API_TO_UI_PRIORITY = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const UI_TO_API_PRIORITY = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Urgent: 'urgent',
};

export const UI_TO_API_STATUS = {
  New: 'new',
  Assigned: 'contacted',
  'In Progress': 'nurturing',
  Closed: 'converted',
};

//  Fixed — no more status-based fallback
const normalizePriority = (priority) => {
  const mapped = API_TO_UI_PRIORITY[String(priority || '').toLowerCase()];
  return mapped ?? 'Medium';
};

const mapLead = (lead = {}) => {
  const status = mapLeadStatus(lead);
  const sourceType = lead.source?.type;

  return {
    id: lead._id,
    name: lead.name || 'Unknown',
    email: lead.email || null,
    phone: lead.phone || null,
    property: lead.source?.property?.title || 'Property',
    source: sourceType === 'tour' ? 'App' : 'Website',
    intent: sourceType === 'tour' ? 'Tour' : 'Inquiry',
    status,
    priority: normalizePriority(lead.priority), //  fixed
    assignedTo: formatName(lead.assignedTo),
    assignedAgentId: lead.assignedTo?._id || lead.assignedTo || null,
    createdAt: lead.createdAt,
  };
};

// GET /api/v1/leads — supports status, search, agentId, archived, page, limit.
// Returns mapped leads plus pagination metadata.
export const fetchLeads = async (params = {}) => {
  const { data } = await apiClient.get('/leads', { params });
  const raw = data?.data ?? {};
  const list = Array.isArray(raw.leads)
    ? raw.leads
    : Array.isArray(raw)
      ? raw
      : [];
  const pg = raw.pagination ?? {};
  const total = pg.total ?? raw.total ?? list.length;
  const limit = pg.limit ?? params.limit ?? 20;
  const page = pg.page ?? params.page ?? 1;
  const pages = pg.pages ?? raw.pages ?? Math.max(1, Math.ceil(total / limit));
  return {
    leads: list.map(mapLead),
    pagination: { total, page, limit, pages },
  };
};

export const updateLeadPriority = async (leadId, priority) => {
  const apiPriority =
    UI_TO_API_PRIORITY[priority] ?? String(priority || '').toLowerCase();
  const { data } = await apiClient.patch(`/leads/${leadId}`, {
    priority: apiPriority,
  });
  return data?.data?.lead ?? null;
};

export const assignLead = async (leadId, agentId = null) => {
  if (!leadId) return null;
  const { data } = await apiClient.patch(`/leads/${leadId}/assign`, {
    agentId: agentId || null,
  });
  return data?.data?.lead ?? null;
};

// PATCH /api/v1/leads/:id  { status }
export const updateLeadStatus = async (leadId, status) => {
  const apiStatus = UI_TO_API_STATUS[status] ?? status.toLowerCase();
  const { data } = await apiClient.patch(`/leads/${leadId}`, {
    status: apiStatus,
  });
  return data?.data?.lead ?? null;
};

// POST /api/v1/leads/:id/notes
export const addLeadNote = async (leadId, content) => {
  const { data } = await apiClient.post(`/leads/${leadId}/notes`, { content });
  return data?.data?.note ?? null;
};

// PATCH /api/v1/leads/:id/archive
export const archiveLead = async (leadId) => {
  const { data } = await apiClient.patch(`/leads/${leadId}/archive`);
  return data?.data?.lead ?? null;
};

// PATCH /api/v1/leads/:id/unarchive
export const unarchiveLead = async (leadId) => {
  const { data } = await apiClient.patch(`/leads/${leadId}/unarchive`);
  return data?.data?.lead ?? null;
};

// GET /api/v1/leads/:id/notes
export const fetchLeadNotes = async (leadId, params = {}) => {
  if (!leadId) return { notes: [] };
  const { data } = await apiClient.get(`/leads/${leadId}/notes`, {
    params: { limit: 50, ...params },
  });
  const notes = data?.data?.notes ?? [];
  return {
    notes: notes.map((n) => ({
      id: n._id,
      content: n.content,
      createdAt: n.createdAt,
      createdBy: n.createdBy
        ? `${n.createdBy.firstName || ''} ${n.createdBy.lastName || ''}`.trim()
        : null,
    })),
  };
};
