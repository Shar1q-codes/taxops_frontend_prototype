"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "sent" | "error" | "loading">("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Email is required.");
      return;
    }
    try {
      setStatus("loading");
      setMessage("");
      // Placeholder POST /auth/forgot-password
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("sent");
      setMessage("If the email exists, reset instructions have been sent.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed.";
      setStatus("error");
      setMessage(msg);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Reset password</h1>
      <p className="mt-1 text-sm text-slate-600">Enter your email to receive a reset link.</p>

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
        {message ? (
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
              status === "sent" ? "bg-emerald-50 text-emerald-700" : status === "error" ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-700"
            }`}
          >
            {status === "sent" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message}
          </div>
        ) : null}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          disabled={status === "loading"}
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send reset link
        </button>
      </form>

      <div className="mt-4 text-right text-sm text-slate-700">
        <Link href="/auth/login" className="text-slate-900 hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
