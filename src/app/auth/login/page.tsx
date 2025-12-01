"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { signInWithPopup } from "firebase/auth";

import { auth, firebaseReady, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      setLoading(true);
      // Placeholder call; wire to FastAPI /auth/login with firm_id scoping.
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (rememberMe) {
        // store token placeholder
      }
      router.push("/app/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!firebaseReady || !auth || !googleProvider) {
      setError("Google Sign-In is not configured.");
      return;
    }
    try {
      setGoogleLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      router.push("/app/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to landing
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-600">Access your firm dashboard. All actions are scoped to your firm and client engagements.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          <label htmlFor="remember">Remember me on this device</label>
        </div>
        {error ? (
          <div className="flex items-center gap-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400"
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Continue with Google
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
        <Link href="/auth/forgot-password" className="text-slate-900 hover:underline">
          Forgot password?
        </Link>
        <Link href="/auth/signup" className="text-slate-900 hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
