import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_USERS = [];

const toTitle = (value = "") =>
  value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : "";

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

const mapUser = (user = {}) => {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  return {
    id: user._id,
    name: `${firstName} ${lastName}`.trim() || user.email || "Unknown",
    email: user.email || "",
    initials: toInitials(firstName, lastName),
    role: toTitle(user.role),
    manager: null,
    territories: [],
    activeLeads: null,
    status: toTitle(user.status),
    lastLogin: formatLastLogin(user.lastLoginAt),
  };
};

export const fetchUsers = async (params = {}) => {
  const { data } = await apiClient.get("/admin/users", { params });
  const users = data?.data?.users ?? [];
  return users.map(mapUser);
};
