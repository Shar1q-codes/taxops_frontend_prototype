"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { DomainFinding } from "@/types/taxops";

type SeverityFilter = "all" | DomainFinding["severity"];

export function ExpensesModule({ engagementId }: { engagementId: string }) {
  const { token } = useAuth();
  const [findings, setFindings] = useState<DomainFinding[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>("all");

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.fetchExpenseFindings(token, engagementId);
      setFindings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load expense findings.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, engagementId]);

  const filtered = useMemo(() => findings.filter((f) => (filter === "all" ? true : f.severity === filter)), [findings, filter]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expenses</p>
          <h2 className="text-xl font-semibold text-slate-900">Expense checks</h2>
          <p className="text-sm text-slate-600">Duplicate expenses and policy threshold breaches.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs uppercase text-slate-500">Severity</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value as SeverityFilter)} className="rounded-md border border-slate-200 px-2 py-1 text-sm">
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading findings...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Message</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2">Txn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <Badge variant={f.severity === "high" || f.severity === "critical" ? "danger" : f.severity === "medium" ? "warning" : "default"}>
                        {f.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{f.code}</td>
                    <td className="px-3 py-2 text-slate-700">{f.message}</td>
                    <td className="px-3 py-2 text-slate-600">{f.account_code || "—"}</td>
                    <td className="px-3 py-2 text-slate-600">{f.transaction_id || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <AlertCircle className="h-4 w-4" />
            No expense findings yet. Upload TB + GL in Books, then refresh.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
