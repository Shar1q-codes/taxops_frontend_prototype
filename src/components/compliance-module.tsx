"use client";

import { useState } from "react";

import { taxopsApi } from "@/lib/taxopsApi";
import { DomainFinding } from "@/types/taxops";

export function ComplianceModule({ engagementId }: { engagementId: string }) {
  const [returnsFile, setReturnsFile] = useState<File | null>(null);
  const [booksFile, setBooksFile] = useState<File | null>(null);
  const [findings, setFindings] = useState<DomainFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUploadReturns() {
    if (!returnsFile) return;
    setError(null);
    setMessage(null);
    try {
      const res = await taxopsApi.uploadComplianceReturns(engagementId, returnsFile);
      setMessage(`Uploaded ${res.rows} tax return rows.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload returns CSV.";
      setError(message);
    }
  }

  async function handleUploadBooks() {
    if (!booksFile) return;
    setError(null);
    setMessage(null);
    try {
      const res = await taxopsApi.uploadComplianceBooks(engagementId, booksFile);
      setMessage(`Uploaded ${res.rows} books tax rows.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload books tax CSV.";
      setError(message);
    }
  }

  async function handleRunChecks() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const f = await taxopsApi.fetchComplianceFindings(engagementId);
      setFindings(f);
      setMessage(`Found ${f.length} compliance exceptions.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to run compliance checks.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Compliance</h1>
        <p className="text-sm text-gray-600">Reconcile tax returns against books exports, flagging unreconciled turnover, late filings, and abnormal tax rates.</p>
      </div>

      {message && <div className="text-sm text-green-600">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md p-4 space-y-3">
          <h2 className="text-sm font-semibold">Tax returns CSV</h2>
          <p className="text-xs text-gray-500">Columns: period, tax_type, turnover_return, tax_paid, filing_date, due_date.</p>
          <input type="file" accept=".csv" onChange={(e) => setReturnsFile(e.target.files?.[0] ?? null)} className="text-xs" />
          <button className="text-xs border rounded px-3 py-1" onClick={handleUploadReturns} disabled={!returnsFile}>
            Upload returns
          </button>
        </div>

        <div className="border rounded-md p-4 space-y-3">
          <h2 className="text-sm font-semibold">Books tax export CSV</h2>
          <p className="text-xs text-gray-500">Columns: period, tax_type, turnover_books.</p>
          <input type="file" accept=".csv" onChange={(e) => setBooksFile(e.target.files?.[0] ?? null)} className="text-xs" />
          <button className="text-xs border rounded px-3 py-1" onClick={handleUploadBooks} disabled={!booksFile}>
            Upload books export
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Findings</h2>
          <button className="text-xs border rounded px-3 py-1" onClick={handleRunChecks} disabled={loading}>
            {loading ? "Running checks..." : "Run compliance checks"}
          </button>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Severity</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Code</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Message</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-3 py-2 align-top">{f.severity}</td>
                  <td className="px-3 py-2 align-top">{f.code}</td>
                  <td className="px-3 py-2 align-top">{f.message}</td>
                </tr>
              ))}
              {!findings.length && (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={3}>
                    No compliance findings yet. Upload returns and books exports, then run checks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
