"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocumentMetadata, DomainFinding } from "../types/taxops";
import { fetchDocuments, uploadDocument, fetchDocumentFindings } from "../lib/taxopsApi";

type Props = {
  engagementId: string;
};

const DOC_TYPES = ["INVOICE", "RECEIPT", "GRN", "CONTRACT", "BANK_ADVICE"] as const;

export function DocumentsModule({ engagementId }: Props) {
  const [docs, setDocs] = useState<DocumentMetadata[]>([]);
  const [findings, setFindings] = useState<DomainFinding[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>("INVOICE");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [counterparty, setCounterparty] = useState<string>("");
  const [externalRef, setExternalRef] = useState<string>("");

  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingFindings, setLoadingFindings] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    setError(null);
    try {
      const res = await fetchDocuments(engagementId);
      setDocs(res.documents);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load documents.";
      setError(message);
    } finally {
      setLoadingDocs(false);
    }
  }, [engagementId]);

  async function handleUpload() {
    if (!file) {
      setError("Select a file first.");
      return;
    }
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const amt = amount.trim().length > 0 ? Number.parseFloat(amount.trim()) : undefined;
      const doc = await uploadDocument(engagementId, {
        file,
        type: docType,
        amount: amt,
        date: date || undefined,
        counterparty: counterparty || undefined,
        external_ref: externalRef || undefined,
      });
      setMessage(`Uploaded “${doc.filename}” as ${doc.type}.`);
      setFile(null);
      setAmount("");
      setDate("");
      setCounterparty("");
      setExternalRef("");
      await loadDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload document.";
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRunDocChecks() {
    setLoadingFindings(true);
    setError(null);
    setMessage(null);
    try {
      const f = await fetchDocumentFindings(engagementId);
      setFindings(f);
      setMessage(`Found ${f.length} document-related exceptions.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to run document checks.";
      setError(message);
    } finally {
      setLoadingFindings(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, [engagementId, loadDocuments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Documents</h1>
        <p className="text-sm text-gray-600">
          Upload invoices, receipts, contracts, and other support. The system links them to bank entries and flags
          missing documentation.
        </p>
      </div>

      {message && <div className="text-sm text-green-600">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Upload panel */}
      <section className="border rounded-md p-4 space-y-3">
        <h2 className="text-sm font-semibold">Upload document</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <label className="block">
              <span className="block mb-1 text-gray-600">File</span>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
            </label>

            <label className="block">
              <span className="block mb-1 text-gray-600">Type</span>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block mb-1 text-gray-600">Amount</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="block">
              <span className="block mb-1 text-gray-600">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </label>

            <label className="block">
              <span className="block mb-1 text-gray-600">Counterparty</span>
              <input
                type="text"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                placeholder="Vendor / customer (optional)"
              />
            </label>

            <label className="block">
              <span className="block mb-1 text-gray-600">External ref</span>
              <input
                type="text"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                placeholder="Invoice / PO / ref (optional)"
              />
            </label>
          </div>
        </div>

        <button className="mt-3 text-xs border rounded px-3 py-1" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? "Uploading…" : "Upload document"}
        </button>
      </section>

      {/* Documents list */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Uploaded documents</h2>
          <span className="text-xs text-gray-500">{loadingDocs ? "Loading…" : `${docs.length} docs`}</span>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">File</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Amount</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Counterparty</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">External ref</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Uploaded at</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-3 py-2 align-top">{d.filename}</td>
                  <td className="px-3 py-2 align-top">{d.type}</td>
                  <td className="px-3 py-2 align-top">{d.amount != null ? d.amount : "-"}</td>
                  <td className="px-3 py-2 align-top">{d.date ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{d.counterparty ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{d.external_ref ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{new Date(d.uploaded_at).toLocaleString()}</td>
                </tr>
              ))}
              {!docs.length && !loadingDocs && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-gray-500 text-center">
                    No documents uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Findings */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Document findings</h2>
          <button className="text-xs border rounded px-3 py-1" onClick={handleRunDocChecks} disabled={loadingFindings}>
            {loadingFindings ? "Running checks…" : "Run document checks"}
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
                    No document-related findings yet.
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
