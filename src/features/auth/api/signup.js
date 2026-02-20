import apiClient from "../../../services/apiClient";

export const signupAdmin = async (data) => {
  const response = await apiClient.post("/admin/signup", data);
  return response.data;
};