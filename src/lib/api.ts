import { User } from "firebase/auth";

export type Citation = { label: string; url: string };

export type AuditFinding = {
  id: string;
  code: string;
  severity: string;
  rule_type?: string;
  category?: string;
  summary?: string;
  message: string;
  doc_type: string;
  tax_year: number;
  fields: string[];
  field_paths: string[];
  citations: Citation[];
  rule_source?: string;
  condition?: string;
  tags: string[];
  extras: Record<string, unknown>;
};

export type AuditSummary = {
  total_rules_evaluated: number;
  total_findings: number;
  by_severity: Record<string, number>;
  by_rule_type: Record<string, number>;
};

export type DocumentMetadata = {
  filename?: string | null;
  content_type?: string | null;
  pages?: number | null;
  source?: string | null;
};

export type EngineInfo = {
  ruleset?: string | null;
  version?: string | null;
  evaluation_time_ms?: number | null;
};

export type AuditResponse = {
  request_id: string;
  doc_id: string;
  doc_type: string;
  tax_year: number;
  received_at: string;
  processed_at: string;
  status: string;
  summary: AuditSummary;
  document_metadata: DocumentMetadata;
  findings: AuditFinding[];
  engine: EngineInfo;
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

    const payload = (await response.json()) as AuditResponse;
    if (!response.ok) {
      console.error("[AuditAPI] HTTP error", response.status, payload);
      throw new Error(`Audit API HTTP ${response.status}`);
    }
    if (!payload || payload.status !== "ok") {
      throw new Error(payload ? payload.status : "Unknown audit failure");
    }
    return payload;
  } catch (err) {
    console.error("[AuditAPI] Network error", err);
    throw err;
  }
}
