import { AuditModule, Client, DataUpload, Engagement, Finding, ReportSummary } from "@/types/taxops";

type HttpMethod = "GET" | "POST";

interface ApiOptions<TBody> {
  token: string;
  path: string;
  method?: HttpMethod;
  body?: TBody;
}

async function apiFetch<TResponse, TBody = unknown>({ token, path, method = "GET", body }: ApiOptions<TBody>): Promise<TResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${method} ${path} failed: ${response.status} ${text}`);
  }
  return (await response.json()) as TResponse;
}

export const taxopsApi = {
  getFirmSummary: (token: string) => apiFetch<{ totalClients: number; activeEngagements: number; highSeverityFindings: number; upcomingReports: number }>({ token, path: "/api/firm/summary" }),
  getClients: (token: string) => apiFetch<Client[]>({ token, path: "/api/clients" }),
  getClient: (token: string, id: string) => apiFetch<Client>({ token, path: `/api/clients/${id}` }),
  getEngagements: (token: string, clientId: string) => apiFetch<Engagement[]>({ token, path: `/api/clients/${clientId}/engagements` }),
  getEngagementDetails: (token: string, engagementId: string) => apiFetch<Engagement>({ token, path: `/api/engagements/${engagementId}` }),
  getEngagementUploads: (token: string, engagementId: string) => apiFetch<DataUpload[]>({ token, path: `/api/engagements/${engagementId}/uploads` }),
  getEngagementModules: (token: string, engagementId: string) => apiFetch<AuditModule[]>({ token, path: `/api/engagements/${engagementId}/modules` }),
  getEngagementFindings: (token: string, engagementId: string) => apiFetch<Finding[]>({ token, path: `/api/engagements/${engagementId}/findings` }),
  runModule: (token: string, engagementId: string, moduleId: string) =>
    apiFetch<{ runId: string }>({ token, path: `/api/engagements/${engagementId}/modules/${moduleId}/run`, method: "POST" }),
  generateDraftReport: (token: string, engagementId: string) =>
    apiFetch<ReportSummary>({ token, path: `/api/engagements/${engagementId}/report/draft`, method: "POST" }),
  downloadReportPdf: (token: string, engagementId: string) => apiFetch<{ url: string }>({ token, path: `/api/engagements/${engagementId}/report/pdf` }),
  downloadReportXlsx: (token: string, engagementId: string) => apiFetch<{ url: string }>({ token, path: `/api/engagements/${engagementId}/report/xlsx` }),
};
