import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import * as authApi from "@/api/auth-api";
import { UNAUTHORIZED_EVENT } from "@/lib/api-client";
import { clearToken, getToken, setToken } from "@/lib/token-storage";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // A request that carried a Bearer token came back 401: the session is dead
  // (expired/invalid JWT). Clear local state and bounce to /login.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      navigate("/login", { replace: true });
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [navigate]);

  // On first load, resolve any token already sitting in localStorage into a user.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authApi.me();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        clearToken();
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const authResponse = await authApi.login(data);
    setToken(authResponse.accessToken);
    const currentUser = await authApi.me();
    setUser(currentUser);
  }, []);

  const register = useCallback((data: RegisterRequest) => authApi.register(data), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
