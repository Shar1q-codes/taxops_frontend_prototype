"use client";

import { useParams } from "next/navigation";

import { BooksModule } from "@/components/books-module";
import { EngagementTabs } from "@/components/engagement-tabs";
import { useAuth } from "@/hooks/useAuth";

export default function EngagementBooksPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();
  const { token } = useAuth();

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="books" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Books of Accounts</p>
        <h1 className="text-2xl font-semibold text-slate-900">Trial balance + GL ingestion</h1>
        <p className="text-sm text-slate-600">Upload CSVs, run basic rules, and review findings scoped to this engagement.</p>
      </div>
      <BooksModule engagementId={params.engagementId} token={token} />
    </div>
  );
}
