"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthApi, AuthFirm, AuthUser, MeResponse } from "@/lib/auth-api";
import { ApiError } from "@/lib/http";

type AuthContextValue = {
  currentUser: AuthUser | null;
  currentFirm: AuthFirm | null;
  roles: string[];
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, firmId?: string | null) => Promise<void>;
  registerFirm: (firmName: string, email: string, password: string, fullName?: string | null) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "taxops_token";
const AUTH_BYPASS = typeof process !== "undefined" && process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentFirm, setCurrentFirm] = useState<AuthFirm | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentFirm(null);
    setRoles([]);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const setAuthState = useCallback((me: MeResponse, t: string) => {
    setCurrentUser(me.user);
    setCurrentFirm(me.firm);
    setRoles(me.roles || []);
    setToken(t);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, t);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string, firmId?: string | null) => {
      const tokenResp = await AuthApi.login(email, password, firmId);
      const accessToken = tokenResp.access_token;
      const me = await AuthApi.me(accessToken);
      setAuthState(me, accessToken);
    },
    [setAuthState]
  );

  const registerFirm = useCallback(
    async (firmName: string, email: string, password: string, fullName?: string | null) => {
      const tokenResp = await AuthApi.registerFirm(firmName, email, password, fullName);
      const accessToken = tokenResp.access_token;
      const me = await AuthApi.me(accessToken);
      setAuthState(me, accessToken);
    },
    [setAuthState]
  );

  useEffect(() => {
    const bootstrap = async () => {
      if (AUTH_BYPASS) {
        setCurrentUser({
          id: "demo-user",
          email: "demo@taxops.local",
          full_name: "Demo User",
          is_active: true,
        });
        setCurrentFirm({ id: "demo-firm", name: "Demo CPA Firm" });
        setToken("demo-token");
        setRoles(["owner"]);
        setIsLoading(false);
        return;
      }
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const me: MeResponse = await AuthApi.me(stored);
        setAuthState(me, stored);
      } catch (err) {
        console.error("[Auth] Failed to bootstrap session", err);
        if (err instanceof ApiError && err.status === 401) {
          logout();
        } else {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [logout, setAuthState]);

  const value: AuthContextValue = useMemo(
    () => ({
      currentUser,
      currentFirm,
      token,
      roles,
      isLoading,
      login,
      registerFirm,
      logout,
    }),
    [currentUser, currentFirm, token, roles, isLoading, login, registerFirm, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
