import apiClient from "../../../services/apiClient";

export const loginAdmin = async (credentials) => {
  const payload = {
    email: credentials.email,
    password: credentials.password,
    portal: "admin",
    device: "web",
  };

  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};
