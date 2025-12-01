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

export function BankModule({ engagementId }: { engagementId: string }) {
  const { token } = useAuth();
  const [findings, setFindings] = useState<DomainFinding[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>("all");

  const handleUpload = async (file: File | null) => {
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
      const resp = await taxopsApi.uploadBankStatement(token, engagementId, file);
      setStatus(`Uploaded ${resp.entries} bank entries.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload bank statement.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const loadFindings = async () => {
    if (!token) {
      setError("You need to be signed in to run bank checks.");
      return;
    }
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const data = await taxopsApi.fetchBankFindings(token, engagementId);
      setFindings(data);
      setStatus(`Found ${data.length} bank findings.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch bank findings.";
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bank</p>
          <h2 className="text-xl font-semibold text-slate-900">Bank statements</h2>
          <p className="text-sm text-slate-600">Upload CSV statements, then run prototype bank checks.</p>
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
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Upload bank CSV</p>
              <p className="text-xs text-slate-600">Expected headers: date, description, amount, balance (optional), time (optional), account_number, reference.</p>
            </div>
            <UploadCloud className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input type="file" accept=".csv" disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0] ?? null)} />
            {uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-600" />}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFindings}
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Running..." : "Run bank checks"}
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
            No bank findings yet. Upload a statement and run checks.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
