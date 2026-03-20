import axios from "axios";
import apiClient from "../../../services/apiClient";

const getApiBaseUrl = () =>
  apiClient.defaults.baseURL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const toLogoutError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message || error?.message || fallbackMessage;
  const logoutError = new Error(message);
  logoutError.status = error?.response?.status;
  logoutError.cause = error;
  return logoutError;
};

const requestLogout = async ({ baseURL, accessToken, refreshToken }) =>
  axios.post(
    `${baseURL}/auth/logout`,
    { refreshToken },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

const refreshAccessToken = async ({ baseURL, refreshToken }) => {
  const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
    refreshToken,
  });

  const refreshData = refreshResponse?.data?.data || {};

  return {
    accessToken: refreshData.accessToken,
    refreshToken: refreshData.refreshToken || refreshToken,
  };
};

export const logoutAdmin = async ({ accessToken, refreshToken } = {}) => {
  if (!refreshToken) {
    return {
      data: null,
      message: "No refresh token found. Local session can be cleared safely.",
    };
  }

  const baseURL = getApiBaseUrl();

  if (accessToken) {
    try {
      const response = await requestLogout({
        baseURL,
        accessToken,
        refreshToken,
      });

      return response.data;
    } catch (error) {
      if (error?.response?.status !== 401) {
        throw toLogoutError(error, "Logout request failed");
      }
    }
  }

  try {
    const refreshedTokens = await refreshAccessToken({ baseURL, refreshToken });

    if (!refreshedTokens.accessToken) {
      throw new Error("Refresh endpoint did not return an access token");
    }

    const retryResponse = await requestLogout({
      baseURL,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken,
    });

    return retryResponse.data;
  } catch (error) {
    throw toLogoutError(error, "Unable to complete logout");
  }
};
