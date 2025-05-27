import { useState, useEffect } from "react";

function useCurrentAddress() {
  const [address, setAddress] = useState({
    country: "Bangladesh", // Default country
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setAddress(prev => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser"
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          setAddress({
            country: data.address?.country || "Bangladesh", // Fallback to Bangladesh
            loading: false,
            error: null
          });
        } catch (error) {
          setAddress({
            country: "Bangladesh",
            loading: false,
            error: "Failed to fetch location data"
          });
        }
      },
      (error) => {
        setAddress({
          country: "Bangladesh", // Default on error
          loading: false,
          error: error.message
        });
      }
    );
  }, []);

  return address;
}

export default useCurrentAddress;