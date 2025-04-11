import axios from "axios";
import { getRefreshedToken, isAccessTokenExpired, setAuthUser } from "./auth";
import { API_BASE_URL } from "./constants";
import Cookies from "js-cookie";

const useAxios = () => {
  const accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  axiosInstance.interceptors.request.use(async (req) => {
    if (!accessToken || !refreshToken) {
      // alert("No tokens found. Redirecting to login...");
      return req;
    }

    if (!isAccessTokenExpired(accessToken)) {
      return req;
    }

    try {
      const response = await getRefreshedToken(refreshToken);
      if (!response) {
        throw new Error("Failed to refresh token");
      }
      setAuthUser(response.access, response.refresh);
      req.headers.Authorization = `Bearer ${response.access}`;
    } catch (error) {
      alert("Token refresh failed:", error);
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
    //   window.location.href = "/login";
    }

    return req;
  });

  return axiosInstance;
};

export default useAxios;
