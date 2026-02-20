// import apiClient from "./apiClient";

// export const loginUser = async (data) => {
//   const res = await apiClient.post("/auth/login", data);
//   return res.data;
// };

// export const getMe = async () => {
//   const res = await apiClient.get("/auth/me");
//   return res.data;
// };

// export const logoutUser = async () => {
//   await apiClient.post("/auth/logout");
// };

import apiClient from "./apiClient";

const MOCK_MODE = true; // 🔥 temporary

export const loginUser = async (credentials) => {
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
        });
      }, 800);
    });
  }

  // Real backend (later)
  await apiClient.post("/auth/login", credentials);
  const { data } = await apiClient.get("/auth/me");
  return data;
};