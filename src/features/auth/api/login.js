import apiClient from "../../../services/apiClient";

export const loginAdmin = async (data) => {
  const response = await apiClient.post("/admin/login", data);
  return response.data;
};