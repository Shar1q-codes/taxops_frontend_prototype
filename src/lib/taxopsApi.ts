import { http } from "@/lib/http";
import {
  AuditModule,
  BookFinding,
  Client,
  DataUpload,
  DomainFinding,
  Engagement,
  Finding,
  GLIngestResponse,
  ReportSummary,
  TrialBalanceIngestResponse,
} from "@/types/taxops";

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
  uploadTrialBalance: (token: string, engagementId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http<TrialBalanceIngestResponse>(`/api/books/${engagementId}/trial-balance`, { method: "POST", token, body: form });
  },
  uploadGL: (token: string, engagementId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http<GLIngestResponse>(`/api/books/${engagementId}/gl`, { method: "POST", token, body: form });
  },
  fetchBookFindings: (token: string, engagementId: string) =>
    http<BookFinding[]>(`/api/books/${engagementId}/findings`, { method: "GET", token }),
  fetchIncomeFindings: (token: string, engagementId: string) =>
    http<DomainFinding[]>(`/api/income/${engagementId}/findings`, { method: "GET", token }),
  fetchExpenseFindings: (token: string, engagementId: string) =>
    http<DomainFinding[]>(`/api/expenses/${engagementId}/findings`, { method: "GET", token }),
  uploadBankStatement: (token: string, engagementId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http<{ engagement_id: string; entries: number }>(`/api/bank/${engagementId}/statements`, { method: "POST", token, body: form });
  },
  fetchBankFindings: (token: string, engagementId: string) =>
    http<DomainFinding[]>(`/api/bank/${engagementId}/findings`, { method: "GET", token }),
  uploadPayrollEmployees: (token: string, engagementId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http<{ engagement_id: string; employees: number }>(`/api/payroll/${engagementId}/employees`, { method: "POST", token, body: form });
  },
  uploadPayrollEntries: (token: string, engagementId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http<{ engagement_id: string; entries: number }>(`/api/payroll/${engagementId}/entries`, { method: "POST", token, body: form });
  },
  fetchPayrollFindings: (token: string, engagementId: string) =>
    http<DomainFinding[]>(`/api/payroll/${engagementId}/findings`, { method: "GET", token }),
};
