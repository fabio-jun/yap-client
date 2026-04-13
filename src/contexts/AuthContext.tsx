import { useState, useEffect, useCallback, type ReactNode } from "react";
import { loginUser, registerUser } from "../api/authApi";
import api from "../api/axiosInstance";
import { AuthContext } from "./AuthContextValue";
import type { AuthUser } from "../types";

function parseJwt(token: string): { user: AuthUser; exp: number } {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(base64));

  return {
    user: {
      id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      role: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"],
    },
    exp: payload.exp,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      const { user: parsed, exp } = parseJwt(token);
      if (exp * 1000 < Date.now()) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }
  });

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }, []);

  // Interceptor: logout on 401
  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const response = await loginUser({ email, password });
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    setUser(parseJwt(response.data.accessToken).user);
  };

  const register = async (userName: string, email: string, password: string) => {
    const response = await registerUser({ userName, email, password });
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    setUser(parseJwt(response.data.accessToken).user);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
