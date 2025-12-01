"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, FileText, Settings, LogOut, Shield, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

interface AppShellProps {
  firmName: string;
  userName: string;
  role: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Clients", href: "/app/clients", icon: <Users className="h-4 w-4" /> },
  { label: "Engagements", href: "/app/clients", icon: <FolderKanban className="h-4 w-4" /> },
  { label: "Workpapers / Reports", href: "/app/clients", icon: <FileText className="h-4 w-4" /> },
  { label: "Settings", href: "/app/settings", icon: <Settings className="h-4 w-4" /> },
];

export function AppShell({ firmName, userName, role, onLogout, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/90 p-4 lg:flex">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-50">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">TaxOps</p>
            <p className="text-sm font-semibold text-slate-900">{firmName}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(item.href) ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="flex items-center gap-2 text-slate-700">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Assists audit work; CPAs retain responsibility for opinions.
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">Firm</p>
            <p className="text-sm font-semibold text-slate-900">{firmName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">{role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <Button variant="outline" size="sm" onClick={() => (onLogout ? onLogout() : router.push("/auth/login"))} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
