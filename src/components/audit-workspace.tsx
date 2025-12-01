"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ArrowRight, BarChart3, CheckCircle2, FileText, ShieldCheck, UploadCloud, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Severity = "error" | "warning" | "info";
type Role = "Partner" | "Manager" | "Senior/Staff" | "Client Admin";

type Persona = {
  role: Role;
  focus: string;
  actions: string[];
};

type DataUpload = {
  id: string;
  type: string;
  status: "pending" | "processing" | "complete";
  updatedAt: string;
};

type AuditModule = {
  id: string;
  name: string;
  status: "not_started" | "running" | "blocked" | "complete";
  completion: number;
  lastRun: string;
  runbook: string;
};

type Finding = {
  id: string;
  ruleId: string;
  summary: string;
  severity: Severity;
  module: string;
  status: "open" | "in_review" | "resolved";
  evidence: string;
};

type Engagement = {
  id: string;
  year: string;
  status: "Planning" | "Fieldwork" | "Review";
  uploads: DataUpload[];
  modules: AuditModule[];
  findings: Finding[];
};

type Client = {
  id: string;
  name: string;
  industry: string;
  risk: "Low" | "Medium" | "High";
  progress: number;
  engagements: Engagement[];
};

const personas: Persona[] = [
  { role: "Partner", focus: "Oversight and approvals", actions: ["Approve findings", "Review reports", "Monitor risk"] },
  { role: "Manager", focus: "Assign and review", actions: ["Assign modules", "Review workpapers", "Track progress"] },
  { role: "Senior/Staff", focus: "Execute testing", actions: ["Upload data", "Run rules", "Document workpapers"] },
  { role: "Client Admin", focus: "Provide evidence", actions: ["Upload docs", "Respond to PBCs", "View status"] },
];

const clients: Client[] = [
  {
    id: "c-acme",
    name: "Acme Manufacturing",
    industry: "Manufacturing",
    risk: "Medium",
    progress: 62,
    engagements: [
      {
        id: "e-acme-24",
        year: "FY2024",
        status: "Fieldwork",
        uploads: [
          { id: "u1", type: "Trial Balance", status: "complete", updatedAt: "2h ago" },
          { id: "u2", type: "General Ledger", status: "processing", updatedAt: "5m ago" },
          { id: "u3", type: "Bank Statements", status: "pending", updatedAt: "—" },
        ],
        modules: [
          { id: "m1", name: "Income", status: "running", completion: 70, lastRun: "5m ago", runbook: "Income 1.0" },
          { id: "m2", name: "Expenses", status: "blocked", completion: 20, lastRun: "Waiting for GL", runbook: "Expenses 1.0" },
          { id: "m3", name: "Bank", status: "complete", completion: 100, lastRun: "Yesterday", runbook: "Bank 1.0" },
        ],
        findings: [
          {
            id: "f1",
            ruleId: "EXP-011",
            summary: "Missing vendor TIN on 6 transactions",
            severity: "warning",
            module: "Expenses",
            status: "open",
            evidence: "Workpaper WP-EXP-02",
          },
          {
            id: "f2",
            ruleId: "BANK-004",
            summary: "Unreconciled cash difference of 2.3%",
            severity: "error",
            module: "Bank",
            status: "in_review",
            evidence: "Reconcile 11/30",
          },
          {
            id: "f3",
            ruleId: "INC-003",
            summary: "Revenue cutoff exception flagged for Dec 29-31",
            severity: "info",
            module: "Income",
            status: "open",
            evidence: "Sample 12/29 JE 9841",
          },
        ],
      },
    ],
  },
  {
    id: "c-hillside",
    name: "Hillside Clinics",
    industry: "Healthcare",
    risk: "High",
    progress: 34,
    engagements: [
      {
        id: "e-hillside-24",
        year: "FY2024",
        status: "Planning",
        uploads: [
          { id: "u4", type: "Trial Balance", status: "pending", updatedAt: "—" },
          { id: "u5", type: "Payroll", status: "pending", updatedAt: "—" },
        ],
        modules: [
          { id: "m4", name: "Payroll", status: "not_started", completion: 0, lastRun: "Waiting for payroll file", runbook: "Payroll 1.0" },
          { id: "m5", name: "Expenses", status: "not_started", completion: 0, lastRun: "Waiting for TB", runbook: "Expenses 1.0" },
        ],
        findings: [],
      },
    ],
  },
];

const severityBadge: Record<Severity, "danger" | "warning" | "default"> = {
  error: "danger",
  warning: "warning",
  info: "default",
};

const statusCopy: Record<Engagement["status"], string> = {
  Planning: "Planning",
  Fieldwork: "Fieldwork",
  Review: "Review",
};

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">TaxOps</p>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
    </div>
  );
}

export function AuditWorkspace() {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id);
  const selectedClient = useMemo(() => clients.find((c) => c.id === selectedClientId) ?? clients[0], [selectedClientId]);
  const selectedEngagement = selectedClient?.engagements[0];
  const [findingFilter, setFindingFilter] = useState<Severity | "all">("all");

  const filteredFindings = useMemo(() => {
    if (!selectedEngagement) return [];
    return selectedEngagement.findings.filter((f) => (findingFilter === "all" ? true : f.severity === findingFilter));
  }, [findingFilter, selectedEngagement]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <Card className="border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-slate-50">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-emerald-200">TaxOps — AI-Powered Audit Automation</p>
            <h1 className="text-3xl font-semibold">CPA Audit Desk</h1>
            <p className="text-sm text-slate-200">
              Dashboard → Clients → Engagements → Data Uploads → Audit Modules → Findings → Reports. Supports Partner, Manager, Senior/Staff, and Client Admin roles.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Supports CPA workflows</Badge>
              <Badge variant="warning">Assists audits, no legal opinion</Badge>
              <Badge variant="success">Role-based access</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm text-slate-100">
            <ShieldCheck className="h-5 w-5 text-emerald-200" />
            <div>
              <p className="font-semibold">Firm isolation on every request</p>
              <p className="text-slate-200/80">Scoped by firm_id, client_id, engagement_id</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <SectionTitle title="Personas" description="Role-specific actions enforced by RBAC and firm scoping." />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {personas.map((p) => (
            <div key={p.role} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">{p.role}</h3>
                <Badge variant={p.role === "Partner" ? "success" : p.role === "Manager" ? "default" : "warning"}>{p.focus}</Badge>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-slate-700">
                {p.actions.map((a) => (
                  <li key={a} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <Card className="h-full">
          <CardHeader className="flex flex-col gap-1">
            <SectionTitle title="Clients" description="Select a client to see the current engagement, uploads, modules, and findings." />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border p-3 text-left transition-all",
                    selectedClientId === c.id ? "border-sky-500 bg-sky-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-600">{c.industry}</p>
                    </div>
                    <Badge variant={c.risk === "High" ? "danger" : c.risk === "Medium" ? "warning" : "default"}>{c.risk} risk</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} />
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users className="h-3.5 w-3.5" />
                    {c.engagements.length} engagement{c.engagements.length > 1 ? "s" : ""} active
                  </div>
                </button>
              ))}
            </div>
            {selectedEngagement ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Engagement {selectedEngagement.year}</Badge>
                  <Badge variant="success">{statusCopy[selectedEngagement.status]}</Badge>
                  <Badge variant="default">Rule pack v1.0</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-700">Data snapshot created when rules run; findings remain tied to snapshot for sign-off.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <SectionTitle title="Workpaper Feed" description="Latest notes and approvals per engagement." />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">WP-EXP-02</p>
                <Badge variant="warning">Awaiting Manager review</Badge>
              </div>
              <p className="mt-1 text-slate-700">Vendor completeness testing documented; 3 items missing W-9.</p>
              <p className="text-xs text-slate-500">Assigned: Senior • Approver: Manager</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">WP-BANK-01</p>
                <Badge variant="success">Approved by Partner</Badge>
              </div>
              <p className="mt-1 text-slate-700">Bank rec variance cleared with evidence for Nov and Dec.</p>
              <p className="text-xs text-slate-500">Linked findings: BANK-004</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">WP-INC-03</p>
                <Badge variant="default">Draft</Badge>
              </div>
              <p className="mt-1 text-slate-700">Cut-off testing sample selected; awaiting GL extract for Dec 29-31.</p>
              <p className="text-xs text-slate-500">Assigned: Staff • Due: Friday</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedEngagement ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="h-full">
            <CardHeader>
              <SectionTitle title="Data Uploads" description="GL, TB, Payroll, Bank, supporting docs. Stored in S3 with firm/client scoped prefixes." />
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedEngagement.uploads.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <UploadCloud className="h-4 w-4 text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-900">{u.type}</p>
                      <p className="text-xs text-slate-500">Updated {u.updatedAt}</p>
                    </div>
                  </div>
                  <Badge variant={u.status === "complete" ? "success" : u.status === "processing" ? "warning" : "default"}>
                    {u.status === "complete" ? "Complete" : u.status === "processing" ? "Processing" : "Pending"}
                  </Badge>
                </div>
              ))}
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-3 py-2 text-xs text-slate-600">
                Next step: Client Admin uploads bank statements → canonical parser → DataSnapshot → rule engine run.
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <SectionTitle title="Audit Modules" description="Deterministic rule packs + ML anomaly layer per module." />
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedEngagement.modules.map((m) => (
                <div key={m.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-600">Runbook: {m.runbook}</p>
                    </div>
                    <Badge variant={m.status === "complete" ? "success" : m.status === "blocked" ? "danger" : "warning"}>
                      {m.status === "complete" ? "Complete" : m.status === "blocked" ? "Blocked" : m.status === "running" ? "Running" : "Not started"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <span>Completion</span>
                    <span>
                      {m.completion}% • {m.lastRun}
                    </span>
                  </div>
                  <Progress value={m.completion} />
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">
                      Resume rules
                    </Button>
                    <Button variant="outline" size="sm">
                      Assign reviewer
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {selectedEngagement ? (
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <Card className="h-full">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <SectionTitle title="Findings" description="Severity chips and module drill-down. Linked to snapshots and workpapers." />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs uppercase text-slate-500">Severity</span>
                <select
                  value={findingFilter}
                  onChange={(e) => setFindingFilter(e.target.value as Severity | "all")}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
                >
                  <option value="all">All</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredFindings.length ? (
                filteredFindings.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={severityBadge[f.severity]}>{f.severity.toUpperCase()}</Badge>
                        <span className="text-xs font-semibold text-slate-700">{f.ruleId}</span>
                        <Badge variant="default">{f.module}</Badge>
                        <Badge variant={f.status === "resolved" ? "success" : f.status === "in_review" ? "warning" : "default"}>
                          {f.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-slate-600">
                        Review <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-slate-800">{f.summary}</p>
                    <p className="text-xs text-slate-600">Evidence: {f.evidence}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  No findings yet. Run the module rules to populate this list.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <SectionTitle title="Report Prep" description="Narratives are optional LLM-assisted; final sign-off remains with the CPA." />
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">Engagement snapshot</p>
                  <Badge variant="default">Snapshot 2024-11-30</Badge>
                </div>
                <p className="mt-1 text-slate-700">Rules run against immutable DataSnapshot. Findings and workpapers reference this snapshot to keep sign-offs stable.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 text-slate-900">
                  <FileText className="h-4 w-4" />
                  <p className="font-semibold">Draft report</p>
                </div>
                <p className="text-xs text-slate-600">Severity chips, module summaries, and sampling rationale flow into the narrative. LLM assistance is optional and must be reviewed by a CPA.</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm">Generate narrative</Button>
                  <Button variant="outline" size="sm">
                    Export to PDF
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 text-slate-900">
                  <BarChart3 className="h-4 w-4" />
                  <p className="font-semibold">Progress</p>
                </div>
                <p className="text-xs text-slate-600">Dashboard → Clients → Engagements → Data Uploads → Audit Modules → Findings → Reports.</p>
                <Progress value={selectedClient?.progress ?? 0} />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <SectionTitle title="Next wiring steps" description="API-first integration points to wire this skeleton to the FastAPI backend." />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">1) Auth + firm scoping</p>
            <p className="text-xs text-slate-600">Wire to OIDC, inject firm_id/client_id claims, enforce in every fetch.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">2) Data uploads</p>
            <p className="text-xs text-slate-600">Use pre-signed S3 URLs; POST /uploads then PUT to S3; poll status.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">3) Rule runs</p>
            <p className="text-xs text-slate-600">Trigger /runs/{`{module}`}; show status + findings by snapshot id; never imply audit opinion.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
