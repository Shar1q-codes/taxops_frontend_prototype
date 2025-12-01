"use client";

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoClients, demoFindings, demoModules, demoReports, demoUploads, demoWorkpapers } from "@/lib/demoData";
import { AuditModule, DataUpload } from "@/types/taxops";

type FindingsFilter = "all" | "critical" | "major" | "minor";

export default function EngagementPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();
  const client = demoClients.find((c) => c.id === params.clientId);
  const engagement = client?.engagements.find((e) => e.id === params.engagementId);
  if (!client || !engagement) {
    notFound();
  }

  const uploads = demoUploads[engagement.id] ?? [];
  const modules = demoModules[engagement.id] ?? [];
  const findings = useMemo(() => demoFindings[engagement.id] ?? [], [engagement.id]);
  const report = demoReports[engagement.id];
  const [severityFilter, setSeverityFilter] = useState<FindingsFilter>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const severityOk = severityFilter === "all" ? true : f.severity === severityFilter;
      const moduleOk = moduleFilter === "all" ? true : f.module === moduleFilter;
      return severityOk && moduleOk;
    });
  }, [findings, severityFilter, moduleFilter]);

  const renderUploadStatus = (upload: DataUpload) => {
    if (upload.status === "ingested") return <Badge variant="success">Ingested</Badge>;
    if (upload.status === "uploaded") return <Badge variant="warning">Uploaded</Badge>;
    return <Badge variant="default">Not uploaded</Badge>;
  };

  const renderModuleStatus = (module: AuditModule) => {
    if (module.status === "completed") return <Badge variant="success">Completed</Badge>;
    if (module.status === "running") return <Badge variant="warning">Running</Badge>;
    if (module.status === "error" || module.status === "blocked") return <Badge variant="danger">Blocked</Badge>;
    return <Badge variant="default">Not started</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Engagement</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {client?.name} · {engagement?.period}
          </h1>
          <p className="text-sm text-slate-600">Status: {engagement?.status} · Risk: {engagement?.risk}</p>
        </div>
        <Badge variant={engagement?.risk === "High" ? "danger" : engagement?.risk === "Medium" ? "warning" : "default"}>{engagement?.risk} risk</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Summary</CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <SummaryPill label="Data readiness" value={`${engagement?.summary.dataReadiness}%`} />
              <SummaryPill label="Modules run" value={`${engagement?.summary.modulesRun}`} />
              <SummaryPill label="Open findings" value={`${engagement?.summary.findingsOpen}`} />
              <SummaryPill label="High severity" value={`${engagement?.summary.highSeverity}`} tone="danger" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Risk highlights</CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>• Automated tests surface exceptions; CPAs must review and document workpapers.</p>
              <p>• Findings stay linked to immutable data snapshots to preserve sign-off integrity.</p>
              <p>• Role-aware: Partner oversight, Manager review, Senior/Staff execution, Client Admin uploads.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads" className="mt-4">
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Data uploads</CardHeader>
            <CardContent className="space-y-3">
              {uploads.map((u) => (
                <div key={u.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-600">
                      Type: {u.type} · Updated {u.updatedAt} · Owner: {u.owner ?? "Client Admin"}
                    </p>
                    <p className="text-xs text-slate-500">Upload → presigned S3 → ingest → snapshot for deterministic rules.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderUploadStatus(u)}
                    <Button variant="outline" size="sm">
                      Upload
                    </Button>
                  </div>
                </div>
              ))}
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Placeholder for presigned upload + polling logic. All uploads scope to firm_id/client_id/engagement_id.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="mt-4">
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Audit modules</CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {modules.map((m) => (
                <div key={m.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-600">Module code: {m.moduleCode}</p>
                    </div>
                    {renderModuleStatus(m)}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <span>Completion</span>
                    <span>{m.completion}% · {m.lastRun}</span>
                  </div>
                  <Progress value={m.completion} />
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="gap-1">
                      <Play className="h-3.5 w-3.5" />
                      Run module
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowRight className="h-3.5 w-3.5" />
                      Open findings
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="mt-4 space-y-3">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <FilterSelect label="Severity" value={severityFilter} onChange={(value) => setSeverityFilter(value as FindingsFilter)} options={["all", "critical", "major", "minor"]} />
              <FilterSelect label="Module" value={moduleFilter} onChange={setModuleFilter} options={["all", ...modules.map((m) => m.name)]} />
            </div>
            <p className="text-xs text-slate-600">Findings are produced by automated tests for CPA review. No audit opinion is issued.</p>
          </div>
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Findings</CardHeader>
            <CardContent className="space-y-3">
              {filteredFindings.length ? (
                filteredFindings.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={f.severity === "critical" ? "danger" : f.severity === "major" ? "warning" : "default"}>{f.severity.toUpperCase()}</Badge>
                        <span className="text-xs font-semibold text-slate-700">{f.ruleId}</span>
                        <Badge variant="default">{f.module}</Badge>
                        <Badge variant={f.status === "closed" ? "success" : f.status === "in_review" ? "warning" : "default"}>{f.status.replace("_", " ")}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-slate-600">
                        Review <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-slate-800">{f.summary}</p>
                    <p className="text-xs text-slate-600">Evidence: {f.evidence ?? "Pending"} · Assignee: {f.assignee ?? "Unassigned"}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  No findings match the selected filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Reports</CardHeader>
            <CardContent className="space-y-3">
              {report ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Draft narrative</p>
                      <p className="text-xs text-slate-600">
                        Draft available: {report.draftAvailable ? "Yes" : "No"} · Last generated: {report.lastGeneratedAt ?? "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Generate draft narrative</Button>
                      <Button variant="outline" size="sm">
                        Export PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Export Excel findings
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    {report.exports.map((e) => (
                      <div key={e.generatedAt} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>
                          {e.type.toUpperCase()} generated {e.generatedAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  No reports yet. Generate draft narrative once modules finish running.
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Workpapers</CardHeader>
            <CardContent className="space-y-2">
              {demoWorkpapers.map((wp) => (
                <div key={wp.id} className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{wp.title}</p>
                    <Badge variant={wp.status === "approved" ? "success" : wp.status === "in_review" ? "warning" : "default"}>{wp.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Owner: {wp.owner} · Module: {wp.relatedModule ?? "N/A"} · Updated {wp.updatedAt}
                  </p>
                  <p className="text-sm text-slate-700">{wp.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryPill({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-xl font-semibold ${tone === "danger" ? "text-rose-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs uppercase text-slate-500">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700">
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
