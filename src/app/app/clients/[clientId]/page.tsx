"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { Client } from "@/types/taxops";

export default function ClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getClient(token, params.clientId);
      setClient(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load client.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.clientId]);

  if (!loading && !client && !error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading client...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
          <button onClick={load} className="rounded bg-rose-700 px-3 py-1 text-white">
            Retry
          </button>
        </div>
      ) : client ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
              <h1 className="text-2xl font-semibold text-slate-900">{client.name}</h1>
              <p className="text-sm text-slate-600">
                Industry: {client.industry} · Year-end {client.yearEnd}
              </p>
            </div>
            <Badge variant={client.risk === "High" ? "danger" : client.risk === "Medium" ? "warning" : "default"}>{client.risk} risk</Badge>
          </div>

          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Engagements</CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700">{client.engagements.length} engagement(s)</p>
              <button
                onClick={() => router.push(`/app/clients/${client.id}/engagements`)}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View engagements
              </button>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
