"use client";

import { useMemo, useState } from "react";

export type AuthRole = "partner" | "manager" | "senior" | "client_admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  token: string;
  firmId: string;
}

export interface AuthContext {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Placeholder hook until wired to real auth provider / OIDC.
export function useAuth(): AuthContext {
  const [user, setUser] = useState<AuthUser | null>({
    id: "u-demo",
    email: "partner@taxops-demo.com",
    name: "Jordan Lee",
    role: "partner",
    token: "demo-token",
    firmId: "firm-demo",
  });

  const logout = () => setUser(null);
  const login = (token: string) =>
    setUser({
      id: "u-demo",
      email: "partner@taxops-demo.com",
      name: "Jordan Lee",
      role: "partner",
      token,
      firmId: "firm-demo",
    });

  const loading = false;
  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  return { user, loading, isAuthenticated, login, logout };
}
