"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { Client } from "@/types/taxops";

export default function ClientsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getClients(token);
      setClients(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load clients.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  }, [clients, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clients</p>
          <h1 className="text-2xl font-semibold text-slate-900">Firm clients</h1>
          <p className="text-sm text-slate-600">Multi-tenant safe; all data scoped by firm_id and client_id.</p>
        </div>
        <div className="hidden items-center gap-2 text-sm text-slate-700 md:flex">
          <Users className="h-4 w-4" />
          {clients.length} clients
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input placeholder="Search clients" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 text-xs text-slate-600">
          <Badge variant="default">All</Badge>
          <Badge variant="warning">Medium risk</Badge>
          <Badge variant="danger">High risk</Badge>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading clients...
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
          <CardHeader className="text-sm font-semibold text-slate-800">Clients</CardHeader>
          <CardContent className="divide-y divide-slate-200">
            {filtered.map((client) => (
              <button
                key={client.id}
                onClick={() => router.push(`/app/clients/${client.id}`)}
                className="block w-full py-3 text-left hover:bg-slate-50"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                    <p className="text-xs text-slate-600">
                      {client.industry} · Year-end {client.yearEnd}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Badge variant={client.risk === "High" ? "danger" : client.risk === "Medium" ? "warning" : "default"}>{client.risk} risk</Badge>
                    <span>{client.engagements.length} active engagement(s)</span>
                  </div>
                </div>
              </button>
            ))}
            {!filtered.length && <p className="py-3 text-sm text-slate-600">No clients match your search.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
