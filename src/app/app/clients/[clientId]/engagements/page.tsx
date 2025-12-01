"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { Engagement } from "@/types/taxops";

export default function EngagementsPage() {
  const params = useParams<{ clientId: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getEngagements(token, params.clientId);
      setEngagements(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load engagements.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.clientId]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Engagements</p>
        <h1 className="text-2xl font-semibold text-slate-900">Engagements</h1>
        <p className="text-sm text-slate-600">Period-by-period audit workspace. Data, modules, findings, and reports are engagement-scoped.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading engagements...
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
          <CardHeader className="text-sm font-semibold text-slate-800">Engagements</CardHeader>
          <CardContent className="space-y-3">
            {engagements.map((eng) => (
              <div key={eng.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {eng.period} · {eng.status}
                    </p>
                    <p className="text-xs text-slate-600">
                      Modules run: {eng.summary.modulesRun} · Open findings: {eng.summary.findingsOpen}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={eng.risk === "High" ? "danger" : eng.risk === "Medium" ? "warning" : "default"}>{eng.risk} risk</Badge>
                    <button
                      onClick={() => router.push(`/app/clients/${params.clientId}/engagements/${eng.id}/overview`)}
                      className="text-sm font-semibold text-slate-900 hover:underline"
                    >
                      Open
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                  <span>Progress</span>
                  <span>{eng.progress}%</span>
                </div>
                <Progress value={eng.progress} />
              </div>
            ))}
            {!engagements.length && <p className="text-sm text-slate-600">No engagements found.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
