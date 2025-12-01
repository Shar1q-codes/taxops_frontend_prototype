"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { AuthApi, AuthUser, MeResponse } from "@/lib/auth-api";
import { ApiError } from "@/lib/http";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "taxops_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const setAuth = useCallback((u: AuthUser, t: string) => {
    setUser(u);
    setToken(t);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, t);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }
    try {
      const me: MeResponse = await AuthApi.me(stored);
      setAuth(me.user, stored);
    } catch (err) {
      console.error("[Auth] Failed to bootstrap session", err);
      if (err instanceof ApiError && err.status === 401) {
        clearAuth();
      } else {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
    };
    bootstrap();
  }, [clearAuth, setAuth]);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    setAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
