"use client";

import { useState } from "react";
import { AlertCircle, Loader2, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { DomainFinding } from "@/types/taxops";

type SeverityFilter = "all" | DomainFinding["severity"];

export function LiabilitiesModule({ engagementId }: { engagementId: string }) {
  const { token } = useAuth();
  const [findings, setFindings] = useState<DomainFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>("all");

  const handleUpload = async (type: "loans" | "loanPeriods" | "ap", file: File | null) => {
    if (!file) {
      setError("Select a CSV file first.");
      return;
    }
    if (!token) {
      setError("You need to be signed in to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    setStatus(null);
    try {
      if (type === "loans") {
        const resp = await taxopsApi.uploadLoans(token, engagementId, file);
        setStatus(`Uploaded ${resp.loans} loans.`);
      } else if (type === "loanPeriods") {
        const resp = await taxopsApi.uploadLoanPeriods(token, engagementId, file);
        setStatus(`Uploaded ${resp.periods} loan periods.`);
      } else {
        const resp = await taxopsApi.uploadAPEntries(token, engagementId, file);
        setStatus(`Uploaded ${resp.entries} AP entries.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const loadFindings = async () => {
    if (!token) {
      setError("You need to be signed in to run liabilities checks.");
      return;
    }
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const data = await taxopsApi.fetchLiabilitiesFindings(token, engagementId);
      setFindings(data);
      setStatus(`Found ${data.length} liabilities findings.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch liabilities findings.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = findings.filter((f) => (filter === "all" ? true : f.severity === filter));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Liabilities</p>
          <h2 className="text-xl font-semibold text-slate-900">Liabilities checks</h2>
          <p className="text-sm text-slate-600">Upload loan schedules and AP ledger, then run liabilities rules.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs uppercase text-slate-500">Severity</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value as SeverityFilter)} className="rounded-md border border-slate-200 px-2 py-1 text-sm">
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Loan master CSV</p>
                <p className="text-xs text-slate-600">Headers: loan_id, lender_name, opening_principal, interest_rate_annual, start_date, maturity_date</p>
              </div>
              <UploadCloud className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input type="file" accept=".csv" disabled={uploading} onChange={(e) => handleUpload("loans", e.target.files?.[0] ?? null)} />
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-600" />}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Loan periods CSV</p>
                <p className="text-xs text-slate-600">Headers: entry_id, loan_id, period_end, opening_principal, interest_expense, principal_repayment, closing_principal</p>
              </div>
              <UploadCloud className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input type="file" accept=".csv" disabled={uploading} onChange={(e) => handleUpload("loanPeriods", e.target.files?.[0] ?? null)} />
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-600" />}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">AP ledger CSV</p>
                <p className="text-xs text-slate-600">Headers: entry_id, vendor_id, vendor_name, invoice_id, due_date, amount, paid, payment_date</p>
              </div>
              <UploadCloud className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input type="file" accept=".csv" disabled={uploading} onChange={(e) => handleUpload("ap", e.target.files?.[0] ?? null)} />
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-600" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFindings}
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Running..." : "Run liabilities checks"}
          </button>
          {status && <span className="text-xs text-emerald-700">{status}</span>}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading findings...
          </div>
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Message</th>
                  <th className="px-3 py-2">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <Badge variant={f.severity === "high" || f.severity === "critical" ? "danger" : f.severity === "medium" ? "warning" : "default"}>
                        {f.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{f.code}</td>
                    <td className="px-3 py-2 text-slate-700">{f.message}</td>
                    <td className="px-3 py-2 text-slate-600 text-xs">
                      {Object.keys(f.metadata || {}).length
                        ? Object.entries(f.metadata || {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" • ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <AlertCircle className="h-4 w-4" />
            No liabilities findings yet. Upload loan/AP files and run checks.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
