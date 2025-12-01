export type RiskLevel = "Low" | "Medium" | "High";
export type Severity = "critical" | "major" | "minor" | "warning" | "info";
export type ModuleStatus = "not_started" | "running" | "completed" | "error" | "blocked";
export type UploadStatus = "not_uploaded" | "uploaded" | "ingested";
export type FindingStatus = "open" | "in_review" | "closed";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  firmId: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  risk: RiskLevel;
  yearEnd: string;
  engagements: Engagement[];
}

export interface Engagement {
  id: string;
  clientId: string;
  period: string;
  status: "Planning" | "Fieldwork" | "Reporting" | "Complete";
  progress: number;
  risk: RiskLevel;
  summary: {
    dataReadiness: number;
    modulesRun: number;
    findingsOpen: number;
    highSeverity: number;
  };
}

export interface DataUpload {
  id: string;
  name: string;
  type: string;
  status: UploadStatus;
  updatedAt: string;
  owner?: string;
}

export interface AuditModule {
  id: string;
  name: string;
  status: ModuleStatus;
  completion: number;
  lastRun: string;
  moduleCode: string;
}

export interface Finding {
  id: string;
  ruleId: string;
  summary: string;
  severity: Severity;
  module: string;
  status: FindingStatus;
  assignee?: string;
  evidence?: string;
  description?: string;
}

export interface ReportSummary {
  id: string;
  engagementId: string;
  draftAvailable: boolean;
  lastGeneratedAt?: string;
  exports: { type: "pdf" | "xlsx"; url: string; generatedAt: string }[];
}

export interface WorkpaperFeedItem {
  id: string;
  title: string;
  status: "draft" | "in_review" | "approved";
  owner: string;
  relatedModule?: string;
  updatedAt: string;
  description?: string;
}
