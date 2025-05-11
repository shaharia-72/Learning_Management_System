import axios from "axios";
import { getRefreshedToken, isAccessTokenExpired, setAuthUser } from "./auth";
import { API_BASE_URL } from "./constants";
import Cookies from "js-cookie";
import { useAuthStore } from "../store/auth";

const useAxios = () => {
  const accessToken = Cookies.get("access_token");
  // const refreshToken = Cookies.get("refresh_token");

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  axiosInstance.interceptors.request.use(async (req) => {
    const currentAccessToken = Cookies.get("access_token");
    const refreshToken = Cookies.get("refresh_token");

    if (!currentAccessToken || !refreshToken) {
      // alert("No tokens found. Redirecting to login...");
      useAuthStore.getState().clearAuth();
      return req;
    }

    if (!isAccessTokenExpired(currentAccessToken)) {
      req.headers.Authorization = `Bearer ${currentAccessToken}`;
      return req;
    }

    // Token expired, try to refresh

    try {
      const response = await getRefreshedToken();
      if (!response) {
        throw new Error("Failed to refresh token");
      }
      setAuthUser(response.access, response.refresh);
      req.headers.Authorization = `Bearer ${response.access}`;
    } catch (error) {
      // alert("Token refresh failed:", error);
      console.error("Token refresh failed:", error);
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      useAuthStore.getState().clearAuth();
    //   window.location.href = "/login";
    }

    return req;
  });

   // Add response interceptor to handle 401/403 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        useAuthStore.getState().clearAuth();
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;
