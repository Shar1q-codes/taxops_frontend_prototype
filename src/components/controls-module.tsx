"use client";

import { useState } from "react";

import { fetchControlsFindings } from "@/lib/taxopsApi";
import { DomainFinding } from "@/types/taxops";

type Props = {
  engagementId: string;
};

export function ControlsModule({ engagementId }: Props) {
  const [findings, setFindings] = useState<DomainFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRunControls() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetchControlsFindings(engagementId);
      setFindings(res);
      setMessage(`Found ${res.length} internal control exceptions.`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to run internal controls checks.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Internal Controls</h1>
        <p className="text-sm text-gray-600">
          Analyze journals for control issues such as same-user approvals, back-dated postings, concentration of manual journals, and postings to restricted
          accounts.
        </p>
      </div>

      {message && <div className="text-sm text-green-600">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Control findings</h2>
          <button className="text-xs border rounded px-3 py-1" onClick={handleRunControls} disabled={loading}>
            {loading ? "Running checks..." : "Run internal controls checks"}
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
                  <td colSpan={3} className="px-3 py-4 text-gray-500 text-center">
                    No internal control findings yet. Ensure GL upload includes user and approval fields, then run checks.
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
