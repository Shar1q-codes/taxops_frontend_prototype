"use client";

import { useParams } from "next/navigation";

import { DocumentsModule } from "@/components/documents-module";
import { EngagementTabs } from "@/components/engagement-tabs";

export default function DocumentsPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();
  const { clientId, engagementId } = params;

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={clientId} engagementId={engagementId} active="documents" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
        <h1 className="text-2xl font-semibold text-slate-900">Supporting documents</h1>
        <p className="text-sm text-slate-600">Upload invoices, receipts, and other support. Auto-matching and checks run from the backend.</p>
      </div>
      <DocumentsModule engagementId={engagementId} />
    </div>
  );
}
