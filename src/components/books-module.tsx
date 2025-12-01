"use client";

import { useState } from "react";
import { AlertCircle, BookOpenCheck, Loader2, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { taxopsApi } from "@/lib/taxopsApi";
import { ApiError } from "@/lib/http";
import { BookFinding, BookSeverity, GLIngestResponse, TrialBalanceIngestResponse } from "@/types/taxops";

type BooksModuleProps = {
  engagementId: string;
  token: string | null;
};

const severityBadge: Record<BookSeverity, "danger" | "warning" | "success" | "default"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "default",
};

export function BooksModule({ engagementId, token }: BooksModuleProps) {
  const [tbUploading, setTbUploading] = useState(false);
  const [glUploading, setGlUploading] = useState(false);
  const [tbSummary, setTbSummary] = useState<TrialBalanceIngestResponse | null>(null);
  const [glSummary, setGlSummary] = useState<GLIngestResponse | null>(null);
  const [findings, setFindings] = useState<BookFinding[]>([]);
  const [findingsLoading, setFindingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleTbUpload = async (file: File | null) => {
    if (!file) {
      setError("Select a Trial Balance CSV first.");
      return;
    }
    if (!token) {
      setError("You need to be signed in to upload.");
      return;
    }
    setTbUploading(true);
    setError(null);
    setStatus(null);
    try {
      const summary = await taxopsApi.uploadTrialBalance(token, engagementId, file);
      setTbSummary(summary);
      setStatus(`Trial balance ingested (${summary.rows_ingested} rows).`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to ingest trial balance.";
      setError(message);
    } finally {
      setTbUploading(false);
    }
  };

  const handleGlUpload = async (file: File | null) => {
    if (!file) {
      setError("Select a General Ledger CSV first.");
      return;
    }
    if (!token) {
      setError("You need to be signed in to upload.");
      return;
    }
    setGlUploading(true);
    setError(null);
    setStatus(null);
    try {
      const summary = await taxopsApi.uploadGL(token, engagementId, file);
      setGlSummary(summary);
      setStatus(`General Ledger ingested (${summary.transactions_ingested} transactions).`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to ingest general ledger.";
      setError(message);
    } finally {
      setGlUploading(false);
    }
  };

  const fetchFindings = async () => {
    if (!token) {
      setError("You need to be signed in to run checks.");
      return;
    }
    setFindingsLoading(true);
    setError(null);
    setStatus(null);
    try {
      const data = await taxopsApi.fetchBookFindings(token, engagementId);
      setFindings(data);
      setStatus(`Found ${data.length} books findings.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to fetch books findings.";
      setError(message);
    } finally {
      setFindingsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Books ingestion</p>
          <h2 className="text-xl font-semibold text-slate-900">Upload Trial Balance + GL</h2>
          <p className="text-sm text-slate-600">CSV only for now. Data stays scoped to this engagement.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Trial Balance</p>
                <p className="text-xs text-slate-600">Headers: account_code, account_name, opening_balance, debit, credit, closing_balance</p>
              </div>
              <UploadCloud className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input type="file" accept=".csv" disabled={tbUploading} onChange={(e) => handleTbUpload(e.target.files?.[0] ?? null)} />
              {tbUploading && <Loader2 className="h-4 w-4 animate-spin text-slate-600" />}
            </div>
            {tbSummary && (
              <p className="mt-2 text-xs text-slate-700">
                Rows ingested: {tbSummary.rows_ingested} · Debit {tbSummary.total_debit} / Credit {tbSummary.total_credit}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">General Ledger</p>
                <p className="text-xs text-slate-600">Headers: txn_id, date, description, account_code, debit, credit</p>
              </div>
              <BookOpenCheck className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input type="file" accept=".csv" disabled={glUploading} onChange={(e) => handleGlUpload(e.target.files?.[0] ?? null)} />
              {glUploading && <Loader2 className="h-4 w-4 animate-spin text-slate-600" />}
            </div>
            {glSummary && (
              <p className="mt-2 text-xs text-slate-700">
                Transactions ingested: {glSummary.transactions_ingested} · Debit {glSummary.total_debit} / Credit {glSummary.total_credit}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Books of Accounts</p>
            <h2 className="text-xl font-semibold text-slate-900">Run checks</h2>
            <p className="text-sm text-slate-600">Suspense balances, restricted accounts, prior-period adjustments.</p>
          </div>
          <Button onClick={fetchFindings} disabled={findingsLoading || !token} className="gap-2">
            {findingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Run Books Checks
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {status && <p className="text-xs text-emerald-700">{status}</p>}
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {findingsLoading ? (
            <div className="flex items-center gap-2 text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching findings...
            </div>
          ) : findings.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Message</th>
                    <th className="px-3 py-2">Account</th>
                    <th className="px-3 py-2">Txn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {findings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <Badge variant={severityBadge[f.severity]}>{f.severity.toUpperCase()}</Badge>
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{f.code}</td>
                      <td className="px-3 py-2 text-slate-700">{f.message}</td>
                      <td className="px-3 py-2 text-slate-600">{f.account_code || "—"}</td>
                      <td className="px-3 py-2 text-slate-600">{f.transaction_id || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <AlertCircle className="h-4 w-4" />
              No findings yet. Upload TB + GL and run checks.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
