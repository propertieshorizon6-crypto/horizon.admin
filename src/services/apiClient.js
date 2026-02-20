import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.horizonproperties.com/api/v1",
  withCredentials: true, // IMPORTANT (cookies)
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await apiClient.post("/auth/refresh");
        return apiClient(originalRequest);
      } catch (err) {
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;