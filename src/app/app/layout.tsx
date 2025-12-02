"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/useAuth";
import { useFirmContext } from "@/hooks/useFirmContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, token, isLoading, logout } = useAuth();
  const firm = useFirmContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/auth/login");
    }
  }, [isLoading, token, router]);

  if (isLoading || !token || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
        <span className="ml-2 text-sm">Checking authentication...</span>
      </div>
    );
  }

  return (
    <AppShell firmName={firm.firmName} userName={currentUser.full_name || currentUser.email} role="" onLogout={logout}>
      {children}
    </AppShell>
  );
}
