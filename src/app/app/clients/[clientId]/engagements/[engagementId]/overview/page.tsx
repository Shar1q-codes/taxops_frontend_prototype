"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { Engagement } from "@/types/taxops";

export default function EngagementOverviewPage() {
  const params = useParams<{ engagementId: string }>();
  const { token } = useAuth();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getEngagementDetails(token, params.engagementId);
      setEngagement(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load engagement.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.engagementId]);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading engagement overview...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
          <button onClick={load} className="rounded bg-rose-700 px-3 py-1 text-white">
            Retry
          </button>
        </div>
      ) : engagement ? (
        <>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Engagement</p>
            <h1 className="text-2xl font-semibold text-slate-900">{engagement.period}</h1>
            <p className="text-sm text-slate-600">
              Status: {engagement.status} · Risk: {engagement.risk}
            </p>
          </div>

          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Summary</CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <SummaryPill label="Data readiness" value={`${engagement.summary.dataReadiness}%`} />
              <SummaryPill label="Modules run" value={`${engagement.summary.modulesRun}`} />
              <SummaryPill label="Open findings" value={`${engagement.summary.findingsOpen}`} />
              <SummaryPill label="High severity" value={`${engagement.summary.highSeverity}`} tone="danger" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Risk highlights</CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>• Automated tests surface exceptions; CPAs must review and document workpapers.</p>
              <p>• Findings stay linked to immutable data snapshots to preserve sign-off integrity.</p>
              <p>• Role-aware: Partner oversight, Manager review, Senior/Staff execution, Client Admin uploads.</p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function SummaryPill({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-xl font-semibold ${tone === "danger" ? "text-rose-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
