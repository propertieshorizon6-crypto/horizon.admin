import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_USERS = [];

const ALLOWED_ROLE_KEYS = new Set(["agent", "manager", "admin"]);
const UI_TO_API_ROLE = {
  Admin: "admin",
  Manager: "manager",
  Agent: "agent",
};
const UI_TO_API_STATUS = {
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
};

const toTitle = (value = "") =>
  value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : "";

const toRoleLabel = (value = "") => {
  const role = String(value).toLowerCase();
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  if (role === "agent") return "Agent";
  return toTitle(value);
};

const isAllowedRole = (value = "") =>
  ALLOWED_ROLE_KEYS.has(String(value).toLowerCase());

const toApiRole = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (UI_TO_API_ROLE[raw]) return UI_TO_API_ROLE[raw];
  return raw.toLowerCase();
};

const toApiStatus = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (UI_TO_API_STATUS[raw]) return UI_TO_API_STATUS[raw];
  return raw.toLowerCase();
};

const toInitials = (firstName = "", lastName = "") => {
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  return initials || "NA";
};

const formatLastLogin = (value) => {
  if (!value) return "Never";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Never";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString();
};

const formatTimeAgo = (value) => {
  if (!value) return "Now";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Now";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
};

const mapActivityLog = (log = {}) => ({
  action: toTitle(log.action || "Activity"),
  detail: log.resource?.description || null,
  time: formatTimeAgo(log.createdAt),
});

const mapUser = (user = {}) => {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const roleKey = String(user.role || "").toLowerCase();
  const statusKey = String(user.status || "").toLowerCase();

  return {
    id: user._id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || user.email || "Unknown",
    email: user.email || "",
    phone: user.phone || "",
    initials: toInitials(firstName, lastName),
    role: toRoleLabel(roleKey),
    roleKey,
    manager: null,
    territories: [],
    activeLeads: null,
    status: toTitle(statusKey),
    statusKey,
    lastLogin: formatLastLogin(user.lastLoginAt),
    lastLoginRaw: user.lastLoginAt || null,
    createdAt: user.createdAt || null,
  };
};

const mapUserDetail = ({ user = {}, profile = null, activityLogs = [] } = {}) => {
  const officeAddress = profile?.office?.address || {};
  const territories = [
    officeAddress.city,
    officeAddress.state,
    officeAddress.country,
  ].filter(Boolean);

  return {
    ...mapUser(user),
    territories,
    assignedProperties: profile?.statistics?.activeListings ?? 0,
    recentActivity: Array.isArray(activityLogs)
      ? activityLogs.map(mapActivityLog)
      : [],
    memberSince: user.createdAt || null,
  };
};

export const fetchUsers = async (params = {}) => {
  const { data } = await apiClient.get("/admin/users", { params });
  const users = data?.data?.users ?? [];
  return users.filter((user) => isAllowedRole(user.role)).map(mapUser);
};

// Same endpoint, but preserves pagination metadata for server-side paging.
export const fetchUsersPage = async (params = {}) => {
  const { data } = await apiClient.get("/admin/users", { params });
  const users = data?.data?.users ?? [];
  const pg    = data?.data?.pagination ?? {};
  return {
    users: users.filter((user) => isAllowedRole(user.role)).map(mapUser),
    pagination: {
      page:  pg.page  ?? params.page  ?? 1,
      limit: pg.limit ?? params.limit ?? 20,
      total: pg.total ?? users.length,
      pages: pg.pages ?? 1,
    },
  };
};

export const fetchUserStats = async () => {
  const { data } = await apiClient.get("/admin/users/stats");
  const stats = data?.data ?? {};
  const byRole = stats.byRole ?? {};
  const byStatus = stats.byStatus ?? {};

  return {
    raw: stats,
    total: (byRole.admin ?? 0) + (byRole.manager ?? 0) + (byRole.agent ?? 0),
    adminsManagers: (byRole.admin ?? 0) + (byRole.manager ?? 0),
    agents: byRole.agent ?? 0,
    active: byStatus.active ?? 0,
  };
};

export const fetchUserDetail = async (userId) => {
  if (!userId) return null;

  const [userResult, activityResult] = await Promise.allSettled([
    apiClient.get(`/admin/users/${userId}`),
    apiClient.get(`/admin/audit-logs/user/${userId}`, {
      params: { page: 1, limit: 5 },
    }),
  ]);

  if (userResult.status !== "fulfilled") {
    throw userResult.reason;
  }

  const payload = userResult.value?.data?.data ?? {};
  const user = payload.user ?? null;

  if (!user || !isAllowedRole(user.role)) {
    return null;
  }

  const activityLogs =
    activityResult.status === "fulfilled"
      ? activityResult.value?.data?.data?.logs ?? []
      : [];

  return mapUserDetail({
    user,
    profile: payload.profile ?? null,
    activityLogs,
  });
};

const normalizeUserPayload = (payload = {}) => ({
  firstName: String(payload.firstName || "").trim(),
  lastName: String(payload.lastName || "").trim(),
  email: String(payload.email || "").trim().toLowerCase(),
  phone: String(payload.phone || "").trim(),
});

export const createUser = async (payload = {}) => {
  const body = {
    ...normalizeUserPayload(payload),
    role: toApiRole(payload.role),
    password: String(payload.password || ""),
  };

  const { data } = await apiClient.post("/admin/users", body);
  const user = data?.data?.user ?? null;
  return user ? mapUser(user) : null;
};

export const updateUser = async (userId, payload = {}) => {
  if (!userId) return null;

  const body = normalizeUserPayload(payload);
  const { data } = await apiClient.patch(`/admin/users/${userId}`, body);
  const user = data?.data?.user ?? null;
  return user ? mapUser(user) : null;
};

export const changeUserRole = async (userId, role) => {
  if (!userId) return null;

  const { data } = await apiClient.patch(`/admin/users/${userId}/role`, {
    role: toApiRole(role),
  });
  const user = data?.data?.user ?? null;
  return user ? mapUser(user) : null;
};

export const changeUserStatus = async (userId, status, reason = "") => {
  if (!userId) return null;

  const body = {
    status: toApiStatus(status),
  };

  if (reason?.trim()) {
    body.reason = reason.trim();
  }

  const { data } = await apiClient.patch(`/admin/users/${userId}/status`, body);
  const user = data?.data?.user ?? null;
  return user ? mapUser(user) : null;
};

export const deleteUser = async (userId) => {
  if (!userId) return null;

  const { data } = await apiClient.delete(`/admin/users/${userId}`);
  return data?.data ?? null;
};

export const verifyAgent = async (userId) => {
  if (!userId) return null;

  const { data } = await apiClient.post(`/admin/users/${userId}/verify-agent`);
  return data?.data ?? null;
};
