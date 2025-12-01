"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type EngagementTabsProps = {
  clientId: string;
  engagementId: string;
  active:
    | "overview"
    | "uploads"
    | "books"
    | "bank"
    | "inventory"
    | "payroll"
    | "income"
    | "expenses"
    | "liabilities"
    | "modules"
    | "findings"
    | "reports";
};

const tabs: { key: EngagementTabsProps["active"]; label: string; path: string }[] = [
  { key: "overview", label: "Overview", path: "overview" },
  { key: "uploads", label: "Uploads", path: "uploads" },
  { key: "books", label: "Books", path: "books" },
  { key: "bank", label: "Bank", path: "bank" },
  { key: "inventory", label: "Inventory", path: "inventory" },
  { key: "payroll", label: "Payroll", path: "payroll" },
  { key: "liabilities", label: "Liabilities", path: "liabilities" },
  { key: "income", label: "Income", path: "income" },
  { key: "expenses", label: "Expenses", path: "expenses" },
  { key: "modules", label: "Modules", path: "modules" },
  { key: "findings", label: "Findings", path: "findings" },
  { key: "reports", label: "Reports", path: "reports" },
];

export function EngagementTabs({ clientId, engagementId, active }: EngagementTabsProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/app/clients/${clientId}/engagements/${engagementId}/${tab.path}`}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
            active === tab.key ? "bg-slate-900 text-white" : "bg-transparent text-slate-700 hover:bg-slate-100"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
