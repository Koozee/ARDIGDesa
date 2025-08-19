import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../utils/auth";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        setUser(authService.getUserInfo());
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (response) => {
    if (response.success) {
      const { token, data: userData } = response;
      authService.setToken(token);
      authService.setUserInfo(userData);
      setUser(userData);
      navigate("/dashboard");
      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
    navigate("/login");
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const getUserInfo = () => {
    return authService.getUserInfo();
  };

  const getToken = () => {
    return authService.getToken();
  };

  const updateUser = (newUserData) => {
    authService.setUserInfo(newUserData);
    setUser(newUserData);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    getUserInfo,
    getToken,
    updateUser,
  };
};
