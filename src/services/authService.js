import apiClient from "./apiClient";

const MOCK_MODE = true;

export const loginAdmin = async (credentials) => {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: "1",
            name: "Akash Admin",
            email: credentials.email,
            role: "SUPER_ADMIN",
          },
          accessToken: "mock-token-123",
        });
      }, 800);
    });
  }

  // Future backend
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
};