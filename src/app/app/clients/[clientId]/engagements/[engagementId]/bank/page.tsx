"use client";

import { useParams } from "next/navigation";

import { BankModule } from "@/components/bank-module";
import { EngagementTabs } from "@/components/engagement-tabs";

export default function EngagementBankPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="bank" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bank</p>
        <h1 className="text-2xl font-semibold text-slate-900">Bank findings</h1>
        <p className="text-sm text-slate-600">Upload bank statements and review prototype bank checks.</p>
      </div>
      <BankModule engagementId={params.engagementId} />
    </div>
  );
}
