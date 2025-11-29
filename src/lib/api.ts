import { User } from "firebase/auth";

export type AuditFinding = {
  code?: string;
  title?: string;
  severity?: string;
  description?: string;
  confidence?: number;
  category?: string;
  source?: string;
};

export type AuditResponse = {
  processing_time_ms: number;
  doc_id?: string;
  rule_findings: AuditFinding[];
  llm_findings: AuditFinding[];
  merged_findings: AuditFinding[];
  audit_trail?: {
    retrieval_sources?: Array<Record<string, unknown>>;
    timestamp?: string;
    llm_mode?: string;
    llm_skipped?: boolean;
  };
};

export async function uploadDocument(file: File, user: User, docType?: string, taxYear?: number): Promise<AuditResponse> {
  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("file", file);
  if (docType) {
    formData.append("doc_type", docType);
  }
  if (typeof taxYear === "number" && !Number.isNaN(taxYear)) {
    formData.append("tax_year", String(taxYear));
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_URL for backend target.");
  }

  try {
    const url = `${apiUrl.replace(/\/$/, "")}/audit-document`;
    console.log("[AuditAPI] POST", url, { fileName: file.name, size: file.size });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error("[AuditAPI] HTTP error", response.status, await response.text());
      throw new Error(`Audit API HTTP ${response.status}`);
    }
    return (await response.json()) as AuditResponse;
  } catch (err) {
    console.error("[AuditAPI] Network error", err);
    throw err;
  }
}
