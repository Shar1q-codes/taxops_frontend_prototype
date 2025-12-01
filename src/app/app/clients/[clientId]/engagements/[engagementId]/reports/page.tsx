"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { ReportSummary } from "@/types/taxops";

export default function EngagementReportsPage() {
  const params = useParams<{ engagementId: string }>();
  const { token, user } = useAuth();
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const canGenerate = user?.roles.includes("manager") || user?.roles.includes("partner");

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getEngagementReportSummary(token, params.engagementId);
      setReport(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load report summary.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.engagementId]);

  const handleGenerate = async () => {
    if (!token || !canGenerate) return;
    setActionLoading(true);
    try {
      const data = await taxopsApi.generateDraftReport(token, params.engagementId);
      setReport(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate draft.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (type: "pdf" | "xlsx") => {
    if (!token) return;
    setActionLoading(true);
    try {
      const resp =
        type === "pdf"
          ? await taxopsApi.downloadReportPdf(token, params.engagementId)
          : await taxopsApi.downloadReportXlsx(token, params.engagementId);
      if (resp.url) {
        window.open(resp.url, "_blank");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download report.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reports</p>
        <h1 className="text-2xl font-semibold text-slate-900">Reports and narratives</h1>
        <p className="text-sm text-slate-600">Draft narratives are assistive only; CPA remains responsible for opinions.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading reports...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
          <button onClick={load} className="rounded bg-rose-700 px-3 py-1 text-white">
            Retry
          </button>
        </div>
      ) : (
        <Card>
          <CardHeader className="text-sm font-semibold text-slate-800">Report summary</CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            {report ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Draft narrative</p>
                    <p className="text-xs text-slate-600">
                      Draft available: {report.draftAvailable ? "Yes" : "No"} · Last generated: {report.lastGeneratedAt ?? "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleGenerate} disabled={!canGenerate || actionLoading}>
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate draft narrative"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload("pdf")} disabled={actionLoading}>
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload("xlsx")} disabled={actionLoading}>
                      Download Excel
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  {report.exports?.map((e) => (
                    <div key={`${e.type}-${e.generatedAt}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="font-medium text-slate-800">{e.type.toUpperCase()}</span>
                      <span className="text-slate-600">{e.generatedAt}</span>
                    </div>
                  ))}
                  {!report.exports?.length && <p>No exports yet.</p>}
                </div>
              </>
            ) : (
              <p>No report summary available yet.</p>
            )}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              Role gating: run generation only for partners/managers. Outputs assist CPAs; no audit opinion is issued.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
