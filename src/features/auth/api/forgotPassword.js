import apiClient from "../../../services/apiClient";

export const forgotPassword = async ({ email }) => {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data;
};
