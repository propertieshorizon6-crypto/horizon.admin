import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";


const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // important for refresh cookie
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
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;

        useAuthStore.getState().setAuth({
          user: useAuthStore.getState().user,
          accessToken: newToken,
        });

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

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