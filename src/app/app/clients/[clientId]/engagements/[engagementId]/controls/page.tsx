"use client";

import { useParams } from "next/navigation";

import { ControlsModule } from "@/components/controls-module";
import { EngagementTabs } from "@/components/engagement-tabs";

export default function ControlsPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="controls" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Internal Controls</p>
        <h1 className="text-2xl font-semibold text-slate-900">Internal control checks</h1>
        <p className="text-sm text-slate-600">Review journals for control issues including back-dating, same-user approvals, and restricted account postings.</p>
      </div>
      <ControlsModule engagementId={params.engagementId} />
    </div>
  );
}
