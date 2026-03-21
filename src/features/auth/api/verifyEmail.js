import apiClient from "../../../services/apiClient";

export const verifyEmail = async ({ token }) => {
  const { data } = await apiClient.post("/auth/verify-email", { token, portal: "admin" });
  return data;
};
