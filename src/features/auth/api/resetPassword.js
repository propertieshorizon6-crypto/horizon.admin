import apiClient from "../../../services/apiClient";

export const resetPassword = async ({ token, newPassword }) => {
  const { data } = await apiClient.post("/auth/reset-password", { token, newPassword, portal: "admin" });
  return data;
};
