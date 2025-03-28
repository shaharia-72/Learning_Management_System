import { useEffect, useState } from "react";
import { setUser } from "../utils/auth";

const MainWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await setUser();
      } catch (error) {
        console.error("Error setting user:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return <>{children}</>;
};

export default MainWrapper;
