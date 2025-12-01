"use client";

import { useParams } from "next/navigation";

import { EngagementTabs } from "@/components/engagement-tabs";
import { ExpensesModule } from "@/components/expenses-module";

export default function EngagementExpensesPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="expenses" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expenses</p>
        <h1 className="text-2xl font-semibold text-slate-900">Expense findings</h1>
        <p className="text-sm text-slate-600">Duplicate expenses and policy threshold breaches over TB + GL.</p>
      </div>
      <ExpensesModule engagementId={params.engagementId} />
    </div>
  );
}
