import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const PrivateRoute = ({ children }) => {
  const loggedIn = useAuthStore((state) => state.isLoggedIn);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <div className="loading-screen">Checking authentication...</div>;
  }

  return loggedIn ? <>{children}</> : <Navigate to="/login/" replace />;
};

export default PrivateRoute;
