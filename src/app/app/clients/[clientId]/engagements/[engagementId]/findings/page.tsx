"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EngagementTabs } from "@/components/engagement-tabs";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { Finding, FindingStatus, Severity } from "@/types/taxops";

export default function EngagementFindingsPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();
  const { token } = useAuth();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<FindingStatus | "all">("all");
  const [moduleFilter, setModuleFilter] = useState<string | "all">("all");
  const [selected, setSelected] = useState<Finding | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getEngagementFindings(token, params.engagementId);
      setFindings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load findings.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.engagementId]);

  const modules = useMemo(() => Array.from(new Set(findings.map((f) => f.module))), [findings]);

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      const sevOk = severityFilter === "all" ? true : f.severity === severityFilter;
      const statusOk = statusFilter === "all" ? true : f.status === statusFilter;
      const modOk = moduleFilter === "all" ? true : f.module === moduleFilter;
      return sevOk && statusOk && modOk;
    });
  }, [findings, severityFilter, statusFilter, moduleFilter]);

  const severityBadge: Record<Severity, "danger" | "warning" | "default"> = {
    critical: "danger",
    major: "warning",
    minor: "default",
    warning: "warning",
    info: "default",
  };

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="findings" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Findings</p>
          <h1 className="text-2xl font-semibold text-slate-900">Findings for CPA review</h1>
          <p className="text-sm text-slate-600">Automated tests; CPAs review and resolve. No audit opinion is issued by TaxOps.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Filter label="Severity" value={severityFilter} onChange={(v) => setSeverityFilter(v as Severity | "all")} options={["all", "critical", "major", "minor", "warning", "info"]} />
          <Filter label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as FindingStatus | "all")} options={["all", "open", "in_review", "closed"]} />
          <Filter label="Module" value={moduleFilter} onChange={(v) => setModuleFilter(v as string | "all")} options={["all", ...modules]} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading findings...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
          <button onClick={load} className="rounded bg-rose-700 px-3 py-1 text-white">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Findings</CardHeader>
            <CardContent className="space-y-3">
              {filtered.length ? (
                filtered.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f)}
                    className="flex w-full flex-col rounded-lg border border-slate-200 bg-white p-3 text-left hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={severityBadge[f.severity]}>{f.severity.toUpperCase()}</Badge>
                      <span className="text-xs font-semibold text-slate-700">{f.ruleId}</span>
                      <Badge variant="default">{f.module}</Badge>
                      <Badge variant={f.status === "closed" ? "success" : f.status === "in_review" ? "warning" : "default"}>{f.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-800">{f.summary}</p>
                  </button>
                ))
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  No findings match the selected filters.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Details</CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={severityBadge[selected.severity]}>{selected.severity.toUpperCase()}</Badge>
                    <span className="text-xs font-semibold text-slate-700">{selected.ruleId}</span>
                    <Badge variant="default">{selected.module}</Badge>
                    <Badge variant={selected.status === "closed" ? "success" : selected.status === "in_review" ? "warning" : "default"}>
                      {selected.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="font-semibold text-slate-900">{selected.summary}</p>
                  {selected.description && <p className="text-slate-700">{selected.description}</p>}
                  {selected.evidence && <p className="text-xs text-slate-600">Evidence: {selected.evidence}</p>}
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                    TODO: Assign reviewer / Mark as closed once backend PATCH endpoints are available.
                  </div>
                </>
              ) : (
                <p className="text-slate-600">Select a finding to view details.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Filter({
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
