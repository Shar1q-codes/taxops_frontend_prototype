import { AuditModule, Client, DataUpload, Finding, ReportSummary, WorkpaperFeedItem } from "@/types/taxops";

export const demoClients: Client[] = [
  {
    id: "c-acme",
    name: "Acme Manufacturing",
    industry: "Manufacturing",
    risk: "Medium",
    yearEnd: "Dec 31",
    engagements: [
      {
        id: "e-acme-24",
        clientId: "c-acme",
        period: "FY2024",
        status: "Fieldwork",
        progress: 62,
        risk: "Medium",
        summary: { dataReadiness: 70, modulesRun: 6, findingsOpen: 9, highSeverity: 2 },
      },
    ],
  },
  {
    id: "c-hillside",
    name: "Hillside Clinics",
    industry: "Healthcare",
    risk: "High",
    yearEnd: "Jun 30",
    engagements: [
      {
        id: "e-hillside-24",
        clientId: "c-hillside",
        period: "FY2024",
        status: "Planning",
        progress: 34,
        risk: "High",
        summary: { dataReadiness: 25, modulesRun: 1, findingsOpen: 0, highSeverity: 0 },
      },
    ],
  },
];

export const demoUploads: Record<string, DataUpload[]> = {
  "e-acme-24": [
    { id: "u1", name: "Trial Balance", type: "TB", status: "ingested", updatedAt: "2h ago", owner: "Client Admin" },
    { id: "u2", name: "General Ledger", type: "GL", status: "uploaded", updatedAt: "5m ago", owner: "Client Admin" },
    { id: "u3", name: "Bank Statements", type: "Bank", status: "not_uploaded", updatedAt: "—", owner: "Client Admin" },
    { id: "u4", name: "Payroll Export", type: "Payroll", status: "not_uploaded", updatedAt: "—", owner: "Client Admin" },
  ],
  "e-hillside-24": [
    { id: "u5", name: "Trial Balance", type: "TB", status: "not_uploaded", updatedAt: "—", owner: "Client Admin" },
    { id: "u6", name: "Payroll", type: "Payroll", status: "not_uploaded", updatedAt: "—", owner: "Client Admin" },
  ],
};

export const demoModules: Record<string, AuditModule[]> = {
  "e-acme-24": [
    { id: "m1", name: "Income", status: "running", completion: 70, lastRun: "5m ago", moduleCode: "INC" },
    { id: "m2", name: "Expenses", status: "blocked", completion: 20, lastRun: "Waiting for GL", moduleCode: "EXP" },
    { id: "m3", name: "Bank & Cash", status: "completed", completion: 100, lastRun: "Yesterday", moduleCode: "BANK" },
    { id: "m4", name: "Payroll", status: "not_started", completion: 0, lastRun: "Waiting for payroll", moduleCode: "PAY" },
  ],
  "e-hillside-24": [
    { id: "m5", name: "Payroll", status: "not_started", completion: 0, lastRun: "Waiting for payroll file", moduleCode: "PAY" },
    { id: "m6", name: "Compliance", status: "not_started", completion: 0, lastRun: "Waiting for TB", moduleCode: "COMP" },
  ],
};

export const demoFindings: Record<string, Finding[]> = {
  "e-acme-24": [
    {
      id: "f1",
      ruleId: "EXP-011",
      summary: "Missing vendor TIN on 6 transactions",
      severity: "major",
      module: "Expenses",
      status: "open",
      assignee: "Manager",
      evidence: "WP-EXP-02",
      description: "Vendor records missing TIN; request W-9 and re-perform matching.",
    },
    {
      id: "f2",
      ruleId: "BANK-004",
      summary: "Unreconciled cash difference of 2.3%",
      severity: "critical",
      module: "Bank",
      status: "in_review",
      assignee: "Partner",
      evidence: "Reconcile 11/30",
      description: "Cash balance differs from GL by 2.3% pending reconciling items review.",
    },
  ],
  "e-hillside-24": [],
};

export const demoReports: Record<string, ReportSummary> = {
  "e-acme-24": {
    id: "r1",
    engagementId: "e-acme-24",
    draftAvailable: true,
    lastGeneratedAt: "Today 9:10 AM",
    exports: [
      { type: "pdf", url: "#", generatedAt: "Today 9:10 AM" },
      { type: "xlsx", url: "#", generatedAt: "Today 9:09 AM" },
    ],
  },
};

export const demoWorkpapers: WorkpaperFeedItem[] = [
  {
    id: "wp1",
    title: "WP-EXP-02 Vendor completeness",
    status: "in_review",
    owner: "Senior",
    relatedModule: "Expenses",
    updatedAt: "2h ago",
    description: "Vendor completeness testing documented; 3 items missing W-9.",
  },
  {
    id: "wp2",
    title: "WP-BANK-01 Bank rec",
    status: "approved",
    owner: "Partner",
    relatedModule: "Bank",
    updatedAt: "1d ago",
    description: "Bank rec variance cleared with November/December evidence.",
  },
];
