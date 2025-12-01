import { http } from "@/lib/http";
import { AuditModule, Client, DataUpload, Engagement, Finding, ReportSummary } from "@/types/taxops";

export interface FirmInfo {
  id: string;
  name: string;
  logoUrl?: string;
}

export const taxopsApi = {
  getFirmInfo: (token: string) => http<FirmInfo>("/api/firm/info", { token }), // firm metadata for shell header
  getFirmSummary: (token: string) =>
    http<{ totalClients: number; activeEngagements: number; highSeverityFindings: number; upcomingReports: number }>("/api/firm/summary", { token }),
  getClients: (token: string) => http<Client[]>("/api/clients", { token }),
  getClient: (token: string, id: string) => http<Client>(`/api/clients/${id}`, { token }),
  getEngagements: (token: string, clientId: string) => http<Engagement[]>(`/api/clients/${clientId}/engagements`, { token }),
  getEngagementDetails: (token: string, engagementId: string) => http<Engagement>(`/api/engagements/${engagementId}`, { token }),
  getEngagementUploads: (token: string, engagementId: string) => http<DataUpload[]>(`/api/engagements/${engagementId}/uploads`, { token }),
  getEngagementModules: (token: string, engagementId: string) => http<AuditModule[]>(`/api/engagements/${engagementId}/modules`, { token }),
  getEngagementFindings: (token: string, engagementId: string) => http<Finding[]>(`/api/engagements/${engagementId}/findings`, { token }),
  getEngagementReportSummary: (token: string, engagementId: string) => http<ReportSummary>(`/api/engagements/${engagementId}/report/summary`, { token }),
  runModule: (token: string, engagementId: string, moduleId: string) =>
    http<{ runId: string }>(`/api/engagements/${engagementId}/modules/${moduleId}/run`, { method: "POST", token }),
  generateDraftReport: (token: string, engagementId: string) =>
    http<ReportSummary>(`/api/engagements/${engagementId}/report/draft`, { method: "POST", token }),
  downloadReportPdf: (token: string, engagementId: string) => http<{ url: string }>(`/api/engagements/${engagementId}/report/pdf`, { token }),
  downloadReportXlsx: (token: string, engagementId: string) => http<{ url: string }>(`/api/engagements/${engagementId}/report/xlsx`, { token }),
};
