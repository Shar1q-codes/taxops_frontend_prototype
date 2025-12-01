"use client";

import { useParams } from "next/navigation";

import { EngagementTabs } from "@/components/engagement-tabs";
import { PayrollModule } from "@/components/payroll-module";

export default function EngagementPayrollPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="payroll" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payroll</p>
        <h1 className="text-2xl font-semibold text-slate-900">Payroll findings</h1>
        <p className="text-sm text-slate-600">Upload employee master and payroll exports; review ghost employees, shared bank accounts, and abnormal increases.</p>
      </div>
      <PayrollModule engagementId={params.engagementId} />
    </div>
  );
}
