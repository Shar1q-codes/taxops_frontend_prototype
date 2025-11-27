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

export async function uploadDocument(file: File, user: User, docType?: string): Promise<AuditResponse> {
  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("file", file);
  if (docType) {
    formData.append("doc_type", docType);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_URL for backend target.");
  }

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/audit-document`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Failed to process document.");
  }
  return (await response.json()) as AuditResponse;
}
