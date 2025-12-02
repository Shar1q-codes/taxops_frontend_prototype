"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EngagementTabs } from "@/components/engagement-tabs";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { AuditModule } from "@/types/taxops";

export default function EngagementModulesPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();
  const { token, roles } = useAuth();
  const [modules, setModules] = useState<AuditModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const canRun = roles.includes("manager") || roles.includes("partner") || roles.includes("owner");

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getEngagementModules(token, params.engagementId);
      setModules(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load modules.";
      setError(message);
    } finally {
      setLoading(false);
      setRunningId(null);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.engagementId]);

  const renderStatus = (status: AuditModule["status"]) => {
    if (status === "completed") return <Badge variant="success">Completed</Badge>;
    if (status === "running") return <Badge variant="warning">Running</Badge>;
    if (status === "blocked" || status === "error") return <Badge variant="danger">Blocked</Badge>;
    return <Badge variant="default">Not started</Badge>;
  };

  const handleRun = async (id: string) => {
    if (!token || !canRun) return;
    setRunningId(id);
    try {
      await taxopsApi.runModule(token, params.engagementId, id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to run module.";
      setError(message);
    } finally {
      await load();
    }
  };

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="modules" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modules</p>
        <h1 className="text-2xl font-semibold text-slate-900">Audit modules</h1>
        <p className="text-sm text-slate-600">Automated tests for CPA review; not an audit opinion.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading modules...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
          <button onClick={load} className="rounded bg-rose-700 px-3 py-1 text-white">
            Retry
          </button>
        </div>
      ) : (
        <Card>
          <CardHeader className="text-sm font-semibold text-slate-800">Modules</CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {modules.map((m) => (
              <div key={m.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-600">Module code: {m.moduleCode}</p>
                  </div>
                  {renderStatus(m.status)}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Completion</span>
                  <span>{m.completion}% · {m.lastRun || "Never run"}</span>
                </div>
                <Progress value={m.completion} />
                {canRun && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="gap-1" disabled={runningId === m.id} onClick={() => handleRun(m.id)}>
                      {runningId === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      Run module
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {!modules.length && <p className="text-sm text-slate-600">No modules found.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
