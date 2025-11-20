import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "api/http";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("tastebite_token"));
  const [isLoading, setIsLoading] = useState(true);

  const persistToken = useCallback((value) => {
    if (value) {
      localStorage.setItem("tastebite_token", value);
    } else {
      localStorage.removeItem("tastebite_token");
    }
    setToken(value);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (error) {
      persistToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, persistToken]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    persistToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

