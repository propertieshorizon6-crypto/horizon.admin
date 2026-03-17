// 📁 src/features/settings/api/settingsApi.js

import apiClient from "../../../services/apiClient";

// GET /profiles → { user, profile }
export const fetchMyProfile = async () => {
  const { data } = await apiClient.get("/profiles");
  return data?.data ?? {};
};

// PUT /profiles/basic → { user }
export const updateBasicInfo = async ({ firstName, lastName, phone }) => {
  const { data } = await apiClient.put("/profiles/basic", { firstName, lastName, phone });
  return data?.data?.user ?? null;
};

// POST /auth/change-password
export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await apiClient.post("/auth/change-password", { currentPassword, newPassword });
  return data;
};

// PUT /profiles/notifications → { user }
export const updateNotificationPrefs = async (prefs) => {
  const { data } = await apiClient.put("/profiles/notifications", prefs);
  return data?.data?.user ?? null;
};

// GET /admin/audit-logs/user/:id  (admin/manager only)
export const fetchMyActivity = async (userId, limit = 20) => {
  const { data } = await apiClient.get(`/admin/audit-logs/user/${userId}`, {
    params: { limit },
  });
  return data?.data ?? { logs: [], pagination: {} };
};
