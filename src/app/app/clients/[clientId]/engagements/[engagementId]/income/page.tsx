"use client";

import { useParams } from "next/navigation";

import { EngagementTabs } from "@/components/engagement-tabs";
import { IncomeModule } from "@/components/income-module";

export default function EngagementIncomePage() {
  const params = useParams<{ clientId: string; engagementId: string }>();

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="income" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Income</p>
        <h1 className="text-2xl font-semibold text-slate-900">Income findings</h1>
        <p className="text-sm text-slate-600">Duplicate income transaction detection over TB + GL.</p>
      </div>
      <IncomeModule engagementId={params.engagementId} />
    </div>
  );
}
