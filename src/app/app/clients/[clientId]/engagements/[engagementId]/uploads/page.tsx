"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { DataUpload } from "@/types/taxops";

export default function EngagementUploadsPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();
  const { token } = useAuth();
  const [uploads, setUploads] = useState<DataUpload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taxopsApi.getEngagementUploads(token, params.engagementId);
      setUploads(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load uploads.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.engagementId]);

  const renderStatus = (status: DataUpload["status"]) => {
    if (status === "ingested") return <Badge variant="success">Ingested</Badge>;
    if (status === "uploaded") return <Badge variant="warning">Uploaded</Badge>;
    return <Badge variant="default">Not uploaded</Badge>;
  };

  const formatDate = (value: string) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uploads</p>
        <h1 className="text-2xl font-semibold text-slate-900">Data uploads</h1>
        <p className="text-sm text-slate-600">Engagement-scoped and firm-isolated. Upload → presigned S3 → ingest → snapshot for rules.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading uploads...
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
          <CardHeader className="text-sm font-semibold text-slate-800">Expected uploads</CardHeader>
          <CardContent className="space-y-3">
            {uploads.map((u) => (
              <div key={u.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-600">
                    Type: {u.type} · Updated {formatDate(u.updatedAt)} · Owner: {u.owner ?? "Client Admin"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatus(u.status)}
                  <Button variant="outline" size="sm" disabled>
                    Upload (TODO presigned)
                  </Button>
                </div>
              </div>
            ))}
            {!uploads.length && <p className="text-sm text-slate-600">No uploads yet.</p>}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              Note: uploads are scoped to firm_id/client_id/engagement_id. Presigned upload and polling will be wired here.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
