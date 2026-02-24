import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
});

// Attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, user } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error("Missing refresh token");
        }

        const res = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const authData = res.data?.data || {};
        const newAccessToken = authData.accessToken;
        const newRefreshToken = authData.refreshToken;

        useAuthStore.getState().setAuth({
          user,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || refreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (err) {
        useAuthStore.getState().logout();
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
