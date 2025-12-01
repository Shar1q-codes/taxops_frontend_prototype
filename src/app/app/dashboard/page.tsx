"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Shield, Users } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";

type Summary = {
  totalClients: number;
  activeEngagements: number;
  highSeverityFindings: number;
  upcomingReports: number;
};

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getFirmSummary(token);
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load firm summary.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const metrics = summary
    ? [
        { label: "Total clients", value: summary.totalClients, icon: <Users className="h-4 w-4" /> },
        { label: "Active engagements", value: summary.activeEngagements, icon: <Shield className="h-4 w-4" /> },
        { label: "High-severity findings", value: summary.highSeverityFindings, icon: <AlertTriangle className="h-4 w-4" /> },
        { label: "Upcoming report deadlines", value: summary.upcomingReports, icon: <CheckCircle2 className="h-4 w-4" /> },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Firm dashboard</p>
        <h1 className="text-2xl font-semibold text-slate-900">Oversight and risk</h1>
        <p className="text-sm text-slate-600">Automated tests and findings for CPA review. No audit opinion is issued by the platform.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading firm summary...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
          <button onClick={load} className="rounded bg-rose-700 px-3 py-1 text-white">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  {metric.label}
                  {metric.icon}
                </CardHeader>
                <CardContent className="text-3xl font-semibold text-slate-900">{metric.value}</CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Engagements at risk</CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>Use the clients and engagements views to drill into high-severity findings and data readiness per engagement.</p>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                High-severity counts are based on automated tests for CPA review. Findings remain linked to workpapers and data snapshots.
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
