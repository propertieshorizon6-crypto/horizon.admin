import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_AUDIT_LOGS = [];

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toTitle = (value = "") =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || null;

const formatDateTime = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const toDateBoundary = (value, isEnd = false) => {
  if (!DATE_ONLY_PATTERN.test(value || "")) return value;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  if (isEnd) {
    date.setHours(23, 59, 59, 999);
  }

  return date.toISOString();
};

const buildAuditLogsQuery = (params = {}) => {
  const query = { ...params };

  if (query.startDate) {
    query.startDate = toDateBoundary(query.startDate, false);
  }

  if (query.endDate) {
    query.endDate = toDateBoundary(query.endDate, true);
  }

  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
};

const resolveActionColor = (action = "") => {
  if (
    /(failed|rejected|deleted|cancelled|suspended|archived)/i.test(action)
  ) {
    return "red";
  }

  if (
    /(created|assigned|changed|updated|confirmed|completed|approved|requested|published|success|activated|reset)/i.test(
      action,
    )
  ) {
    return "dark";
  }

  return "outline";
};

const mapAuditLog = (log = {}) => {
  const actorRecord =
    typeof log.actor === "object" && log.actor !== null ? log.actor : {};
  const actorRoleKey = log.actorRole || actorRecord.role || "system";
  const actionKey = log.action || "";
  const entityKey = log.resource?.type || "";

  return {
    id: log._id,
    timestamp: formatDateTime(log.createdAt),
    actor:
      formatName(actorRecord) ||
      actorRecord.email ||
      (actorRoleKey === "system" ? "System" : "Unknown"),
    actorRole: toTitle(actorRoleKey),
    actorRoleKey,
    action: toTitle(actionKey),
    actionKey,
    entity: toTitle(entityKey),
    entityKey,
    entityId: log.resource?.id ? String(log.resource.id) : "-",
    summary: log.resource?.description || "No description",
    color: resolveActionColor(actionKey),
    createdAt: log.createdAt || null,
  };
};

export const fetchAuditLogs = async (params = {}) => {
  const { data } = await apiClient.get("/admin/audit-logs", {
    params: buildAuditLogsQuery(params),
  });

  const payload = data?.data ?? {};
  const logs = Array.isArray(payload.logs) ? payload.logs : [];

  return {
    logs: logs.map(mapAuditLog),
    pagination: payload.pagination ?? null,
  };
};

export const fetchAuditLogStats = async (params = {}) => {
  const { data } = await apiClient.get("/admin/audit-logs/stats", { params });
  return data?.data ?? null;
};

export const fetchAuditLogById = async (id) => {
  const { data } = await apiClient.get(`/admin/audit-logs/${id}`);
  return data?.data ?? null;
};

