import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 15_000,
});

// Attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Never retry refresh endpoint itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { refreshToken, user } = useAuthStore.getState();

      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }

      const res = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        { refreshToken },
      );

      const authData = res.data?.data || {};
      const newAccessToken = authData.accessToken;
      const newRefreshToken = authData.refreshToken || refreshToken;

      if (!newAccessToken) {
        throw new Error("Refresh endpoint did not return access token");
      }

      useAuthStore.getState().setAuth({
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch {
      useAuthStore.getState().logout();
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      window.location.replace("/auth");
      return Promise.reject(error);
    }
  },
);

export default apiClient;
