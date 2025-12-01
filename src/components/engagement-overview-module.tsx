"use client";

import { useEffect, useMemo, useState } from "react";

import { taxopsApi } from "@/lib/taxopsApi";
import { DomainFinding, DomainStats, EngagementStatsResponse } from "@/types/taxops";

type SeverityFilter = "all" | "high" | "medium" | "low";

export function EngagementOverviewModule({ engagementId }: { engagementId: string }) {
  const [stats, setStats] = useState<EngagementStatsResponse | null>(null);
  const [findings, setFindings] = useState<DomainFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, f] = await Promise.all([
          taxopsApi.fetchEngagementStats(engagementId),
          taxopsApi.fetchEngagementFindings(engagementId),
        ]);
        if (!cancelled) {
          setStats(s);
          setFindings(f);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load engagement overview.";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [engagementId]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (severityFilter !== "all" && f.severity.toLowerCase() !== severityFilter) return false;
      if (domainFilter !== "all" && f.domain !== domainFilter) return false;
      return true;
    });
  }, [findings, severityFilter, domainFilter]);

  const domainOptions = useMemo(() => Array.from(new Set(findings.map((f) => f.domain))), [findings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Engagement Overview</h1>
        <p className="text-sm text-gray-600">Summary of findings across all domains for this engagement.</p>
      </div>

      {loading && <div className="text-sm text-gray-600">Loading overview…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && stats && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SummaryTile label="High" value={stats.totals.high} />
            <SummaryTile label="Medium" value={stats.totals.medium} />
            <SummaryTile label="Low" value={stats.totals.low} />
            <SummaryTile label="Total" value={stats.totals.total} />
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">By domain</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.domains.map((d: DomainStats) => (
                <DomainCard key={d.domain} stats={d} />
              ))}
              {!stats.domains.length && <div className="text-sm text-gray-600">No findings yet. Run checks.</div>}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All findings</h2>
              <div className="flex gap-2 items-center">
                <label className="text-xs text-gray-600">
                  Severity:
                  <select
                    className="ml-1 border rounded px-2 py-1 text-xs"
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                  >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label className="text-xs text-gray-600">
                  Domain:
                  <select
                    className="ml-1 border rounded px-2 py-1 text-xs"
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    {domainOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="border rounded-md overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Severity</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Domain</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Code</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFindings.map((f) => (
                    <tr key={f.id} className="border-t">
                      <td className="px-3 py-2 align-top">
                        <SeverityBadge severity={f.severity} />
                      </td>
                      <td className="px-3 py-2 align-top">{f.domain}</td>
                      <td className="px-3 py-2 align-top">{f.code}</td>
                      <td className="px-3 py-2 align-top">{f.message}</td>
                    </tr>
                  ))}
                  {!filteredFindings.length && (
                    <tr>
                      <td className="px-3 py-4 text-sm text-gray-500" colSpan={4}>
                        No findings match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-md p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function DomainCard({ stats }: { stats: DomainStats }) {
  return (
    <div className="border rounded-md p-3 flex flex-col gap-1">
      <div className="font-semibold text-sm capitalize">{stats.domain}</div>
      <div className="text-xs text-gray-500">Total findings: {stats.total}</div>
      <div className="flex gap-3 text-xs mt-1">
        <span>High: {stats.high}</span>
        <span>Medium: {stats.medium}</span>
        <span>Low: {stats.low}</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  const base = "inline-flex items-center px-2 py-0.5 rounded text-[11px] border";
  if (s === "high") return <span className={base + " border-red-500 text-red-600"}>High</span>;
  if (s === "medium") return <span className={base + " border-yellow-500 text-yellow-600"}>Medium</span>;
  if (s === "low") return <span className={base + " border-blue-500 text-blue-600"}>Low</span>;
  return <span className={base + " border-gray-300 text-gray-700"}>{severity}</span>;
}
