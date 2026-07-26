import { createContext, useCallback, useEffect, useState } from "react";
import { getToken, fetchCurrentUser, login as loginRequest, logout as logoutRequest, clearToken } from "../lib/auth.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.warn("Auth initialization failed:", err?.response?.data?.message || err.message);
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await loginRequest(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: initAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
