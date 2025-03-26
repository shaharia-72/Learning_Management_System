import { useAuthStore } from "../store/auth";
import axios from "./axios";
import jwt_decode from "jwt-decode";
import Cookie from "js-Cookie";
import swal from "sweetalert2";

export const login = async (email, password) => {
    try {
        const { data, status } = await axios.post(`/user/token/`, {
            email,
            password,
        });
        if(status === 200) {
        //     const decoded = jwt_decode(data.access);
        //     useAuthStore.getState().setUser(decoded);
        //     Cookie.set("access_token", data.access);
            //     Cookie.set("refresh_token", data.refresh);
            setAuthUser(data.access, data.refresh);
            swal.fire({
                title: "Success",
                text: "Login successful!",
                icon: "success",
            });

            return {data, error:null}
        }
        
    } catch (error) {
        return {
            data: null,
            error: error.response.data?.detail || "Invalid email or password"
        };
    }
};

export const register = async (first_name, last_name, image, country, about, email, password, confirm_password) => {
    try {

        if (password !== confirm_password) {
            return { data: null, error: "Passwords do not match!" };
        }
        
        const { data } = await axios.post(`/api/register`, {
            first_name,
            last_name,
            image,
            country,
            about,
            email,
            password,
            confirm_password
        });

        await login(email, password);
        swal.fire({
            title: "Success",
            text: "Registration successful!",
            icon: "success",
        });
        return { data, error: null }
        
    } catch (error) {
        return {
            data: null,
            error: error.response.data?.message ||  "Something went wrong, please try again."
        };
    }
};

export const logout = () => {
    Cookie.remove("access-token");
    Cookie.remove("refresh-token");

    useAuthStore.getState().setUser(null);

    alert("Logout successful!");
}

// export const setUser = async () => {
//   const access_token = Cookie.get("access_token");
//   const refresh_token = Cookie.get("refresh_token");

//   if (!access_token || !refresh_token) {
//     // alert("Tokens does not exists");
//     return;
//   }

//   if (isAccessTokenExpired(access_token)) {
//     const response = getRefreshedToken(refresh_token);
//     setAuthUser(response.access, response.refresh);
//   } else {
//     setAuthUser(access_token, refresh_token);
//   }
// };


export const setUser = async () => {
  const access_token = Cookie.get("access_token");
  const refresh_token = Cookie.get("refresh_token");

  if (!access_token || !refresh_token) {
    alert("Tokens do not exist. User might be logged out.");
    return;
  }

  try {
    if (isAccessTokenExpired(access_token)) {
        alert("Access token expired, attempting refresh...");

      const response = await getRefreshedToken(refresh_token);

      if (!response?.access || !response?.refresh) {
        alert("Token refresh failed. Logging out user.");
        Cookie.remove("access_token");
        Cookie.remove("refresh_token");
        return;
      }

      setAuthUser(response.access, response.refresh);
      alert("Tokens refreshed successfully.");
    } else {
      setAuthUser(access_token, refresh_token);
    }
  } catch (error) {
    alert("Error while setting user authentication:", error);
    Cookie.remove("access_token");
    Cookie.remove("refresh_token");
  }
};

export const getRefreshedToken = async () => {
  const refresh_token = Cookie.get("refresh_token");

  if (!refresh_token) {
    alert("No refresh token found. User might be logged out.");
    return null;
  }

  try {
    const response = await axios.post(`user/token/refresh/`, {
      refresh: refresh_token,
    });
    return response.data;
  } catch (error) {
    alert("Failed to refresh token:", error);
    return null;
  }
};

export const setAuthUser = (access_token, refresh_token) => {
  try {
    if (!access_token || !refresh_token) {
      alert("Missing authentication tokens.");
      return;
    }

    Cookie.set("access_token", access_token, { expires: 1, secure: true });
    Cookie.set("refresh_token", refresh_token, { expires: 7, secure: true });

    const user = jwt_decode(access_token) ?? null;

    if (user) {
      useAuthStore.getState().setUser(user);
    }
  } catch (error) {
    alert("Error setting authentication user:", error);
  } finally {
    useAuthStore.getState().setLoading(false);
  }
};

export const isAccessTokenExpired = (access_token) => {
  try {
    if (!access_token) return true;
    const decodedToken = jwt_decode(access_token);
    return decodedToken.exp < Date.now() / 1000;
  } catch (error) {
    alert("Invalid access token:", error);
    return true;
  }
};
