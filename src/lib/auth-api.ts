import { http } from "@/lib/http";

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
};

export type AuthFirm = {
  id: string;
  name: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type MeResponse = {
  user: AuthUser;
  firm: AuthFirm;
  roles: string[];
};

export type ForgotPasswordResponse = {
  message: string;
};

export const AuthApi = {
  registerFirm: (firmName: string, email: string, password: string, fullName?: string | null) =>
    http<TokenResponse>("/auth/register-firm", {
      method: "POST",
      body: {
        firm: { name: firmName },
        user: { email, password, full_name: fullName },
      },
    }),
  login: (email: string, password: string, firm_id?: string | null) =>
    http<TokenResponse>("/auth/login", {
      method: "POST",
      body: { email, password, firm_id: firm_id ?? undefined },
    }),
  me: (token: string): Promise<MeResponse> => http<MeResponse>("/auth/me", { method: "GET", token }),
  forgotPassword: (email: string): Promise<ForgotPasswordResponse> =>
    http<ForgotPasswordResponse>("/auth/forgot-password", { method: "POST", body: { email } }),
};
