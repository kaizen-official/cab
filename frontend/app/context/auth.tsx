"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import api, { type User } from "../lib/api";
import { useRouter } from "next/navigation";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ email: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch {
      setUser(null);
      api.clearTokens();
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const result = await api.login({ email, password });
    api.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
    setUser(result.user);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const result = await api.register(data);
    api.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
    setUser(result.user);
    return { email: data.email };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    api.clearTokens();
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
