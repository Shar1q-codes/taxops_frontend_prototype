"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { fetchEngagementRiskSummary } from "@/lib/taxopsApi";
import { EngagementRiskSummary } from "@/types/taxops";

type Props = {
  engagementId: string;
};

function scoreColor(score: number): string {
  if (score >= 70) return "text-rose-700";
  if (score >= 40) return "text-amber-700";
  return "text-emerald-700";
}

export function EngagementRiskCard({ engagementId }: Props) {
  const { token } = useAuth();
  const [data, setData] = useState<EngagementRiskSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const summary = await fetchEngagementRiskSummary({ engagementId, token });
        setData(summary);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load risk summary.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [engagementId, token]);

  const highCriticalCount = useMemo(() => {
    if (!data) return 0;
    const high = data.by_severity?.HIGH ?? 0;
    const critical = data.by_severity?.CRITICAL ?? 0;
    return high + critical;
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="text-sm font-semibold text-slate-800">Risk summary</CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="text-sm font-semibold text-slate-800">Risk summary</CardHeader>
        <CardContent className="text-sm text-rose-700">
          {error || "Risk summary unavailable. Upload data and run checks to see risk."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-sm font-semibold text-slate-800">Risk summary</CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Overall risk</p>
            <p className={`text-3xl font-bold ${scoreColor(data.overall_score)}`}>{data.overall_score}</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Total findings: {data.total_findings}</p>
            <p>
              High/Critical: <span className="font-semibold text-rose-700">{highCriticalCount}</span>
            </p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
          <p className="text-xs font-semibold text-slate-800">By severity</p>
          <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-slate-600">
            {Object.keys(data.by_severity || {}).map((sev) => (
              <div key={sev} className="flex items-center justify-between">
                <span>{sev}</span>
                <span className="font-semibold">{data.by_severity[sev]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-800">By domain</p>
          <div className="space-y-1">
            {data.domains.map((d) => (
              <div key={d.domain} className="flex items-center justify-between rounded-md border border-slate-200 px-2 py-1 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{d.domain}</p>
                  <p className="text-slate-600">Findings: {d.total_findings}</p>
                </div>
                <div className={`text-lg font-bold ${scoreColor(d.score)}`}>{d.score}</div>
              </div>
            ))}
            {!data.domains.length && <p className="text-xs text-slate-600">No domain findings yet.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
