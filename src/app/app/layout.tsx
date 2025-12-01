"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/useAuth";
import { useFirmContext } from "@/hooks/useFirmContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const firm = useFirmContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
        <span className="ml-2 text-sm">Checking authentication...</span>
      </div>
    );
  }

  return (
    <AppShell firmName={firm.firmName} userName={user.name} role={user.role} onLogout={logout}>
      {children}
    </AppShell>
  );
}
