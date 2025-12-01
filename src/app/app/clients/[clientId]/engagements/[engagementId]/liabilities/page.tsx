"use client";

import { useParams } from "next/navigation";

import { EngagementTabs } from "@/components/engagement-tabs";
import { LiabilitiesModule } from "@/components/liabilities-module";

export default function EngagementLiabilitiesPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="liabilities" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Liabilities</p>
        <h1 className="text-2xl font-semibold text-slate-900">Liabilities findings</h1>
        <p className="text-sm text-slate-600">Upload loan schedules and AP ledger; review interest sanity, negative vendor balances, and overdue items.</p>
      </div>
      <LiabilitiesModule engagementId={params.engagementId} />
    </div>
  );
}
