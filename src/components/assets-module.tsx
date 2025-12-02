"use client";

import { useState } from "react";

import { taxopsApi } from "@/lib/taxopsApi";
import { DomainFinding } from "@/types/taxops";

export function AssetsModule({ engagementId }: { engagementId: string }) {
  const [registerFile, setRegisterFile] = useState<File | null>(null);
  const [depFile, setDepFile] = useState<File | null>(null);
  const [findings, setFindings] = useState<DomainFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUploadRegister() {
    if (!registerFile) return;
    setError(null);
    setMessage(null);
    try {
      const res = await taxopsApi.uploadAssetRegister(engagementId, registerFile);
      setMessage(`Uploaded ${res.assets} assets from register.`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to upload asset register.");
    }
  }

  async function handleUploadDep() {
    if (!depFile) return;
    setError(null);
    setMessage(null);
    try {
      const res = await taxopsApi.uploadAssetDepreciation(engagementId, depFile);
      setMessage(`Uploaded ${res.entries} depreciation entries.`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to upload depreciation file.");
    }
  }

  async function handleRunChecks() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const f = await taxopsApi.fetchAssetsFindings(engagementId);
      setFindings(f);
      setMessage(`Found ${f.length} asset exceptions.`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to run asset checks.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Assets</h1>
        <p className="text-sm text-gray-600">
          Upload the fixed asset register and depreciation schedule, then run automated checks on useful life, un-depreciated assets, and disposals with non-zero
          NBV.
        </p>
      </div>

      {message && <div className="text-sm text-green-600">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md p-4 space-y-3">
          <h2 className="text-sm font-semibold">Fixed Asset Register</h2>
          <p className="text-xs text-gray-500">
            CSV with columns: asset_code, description, category, acquisition_date, acquisition_cost, useful_life_years, disposal_date.
          </p>
          <input type="file" accept=".csv" onChange={(e) => setRegisterFile(e.target.files?.[0] ?? null)} className="text-xs" />
          <button className="text-xs border rounded px-3 py-1" onClick={handleUploadRegister} disabled={!registerFile}>
            Upload register
          </button>
        </div>

        <div className="border rounded-md p-4 space-y-3">
          <h2 className="text-sm font-semibold">Depreciation schedule</h2>
          <p className="text-xs text-gray-500">
            CSV with columns: asset_code, period_end, depreciation_expense, accumulated_depreciation, net_book_value.
          </p>
          <input type="file" accept=".csv" onChange={(e) => setDepFile(e.target.files?.[0] ?? null)} className="text-xs" />
          <button className="text-xs border rounded px-3 py-1" onClick={handleUploadDep} disabled={!depFile}>
            Upload depreciation
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Findings</h2>
          <button className="text-xs border rounded px-3 py-1" onClick={handleRunChecks} disabled={loading}>
            {loading ? "Running checks…" : "Run asset checks"}
          </button>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Severity</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Domain</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Code</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Message</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-3 py-2 align-top">{f.severity}</td>
                  <td className="px-3 py-2 align-top">{f.domain}</td>
                  <td className="px-3 py-2 align-top">{f.code}</td>
                  <td className="px-3 py-2 align-top">{f.message}</td>
                </tr>
              ))}
              {!findings.length && (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={4}>
                    No asset findings yet. Upload data and run checks.
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
