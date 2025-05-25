import Cookie from "js-cookie";
import jwtDecode from "jwt-decode";

function UserData() {
  const access_token = Cookie.get("access_token"); // Use access token instead of refresh
  const refresh_token = Cookie.get("refresh_token");

  if (access_token) {
    try {
      const decoded = jwtDecode(access_token);
      console.log("Decoded Access Token:", decoded);
      
      return {
        user_id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
        teacher_id: decoded.teacher_id || null // Handle case where it's missing
      };
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
  
  return null;
}

export default UserData;