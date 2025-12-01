import { http } from "@/lib/http";
import { User } from "@/types/taxops";

export type AuthUser = User;

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SignupResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface MeResponse {
  user: AuthUser;
}

export const AuthApi = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    http<LoginResponse>("/auth/login", { method: "POST", body: { email, password } }),
  signup: (firmName: string, name: string, email: string, password: string): Promise<SignupResponse> =>
    http<SignupResponse>("/auth/signup", { method: "POST", body: { firmName, name, email, password } }),
  forgotPassword: (email: string): Promise<ForgotPasswordResponse> =>
    http<ForgotPasswordResponse>("/auth/forgot-password", { method: "POST", body: { email } }),
  me: (token: string): Promise<MeResponse> => http<MeResponse>("/auth/me", { method: "GET", token }),
};
