// 📁 src/features/auth/api/login.js

import apiClient from "../../../services/apiClient";

const MOCK_MODE = true;

export const loginAdmin = async (credentials) => {
  if (MOCK_MODE) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate wrong password
        if (credentials.password.length < 4) {
          reject(new Error("Invalid credentials"));
          return;
        }
        resolve({
          user: {
            id:    "1",
            name:  "Akash Admin",
            email: credentials.email,
            role:  "SUPER_ADMIN",
          },
          accessToken: "mock-token-123",
        });
      }, 800);
    });
  }

  // Real API — uncomment when backend ready
  const { data } = await apiClient.post("/auth/login", credentials);
  return data;
};