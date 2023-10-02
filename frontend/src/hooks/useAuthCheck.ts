import { useState, useEffect } from "react";

function useAuthCheck(initialState = false) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialState);

  const checkAuthStatus = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user/isLoggedIn`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(async (response) => {
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        console.error(`Failed to login`);
        setIsAuthenticated(false);
      }
      return response;
    }).catch((error) => { 
      setIsAuthenticated(false);
    });
  };

  useEffect(() => {
    checkAuthStatus();

    // Periodic check every 5 minutes
    const intervalId = setInterval(() => {
      checkAuthStatus();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return isAuthenticated;
}

export default useAuthCheck;
