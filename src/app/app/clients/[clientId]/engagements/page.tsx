import Link from "next/link";
import { notFound } from "next/navigation";
import { demoClients } from "@/lib/demoData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function EngagementsPage({ params }: { params: { clientId: string } }) {
  const client = demoClients.find((c) => c.id === params.clientId);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Engagements</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {client?.name} · Engagements
        </h1>
        <p className="text-sm text-slate-600">Period-by-period audit workspace. Data, modules, findings, and reports are engagement-scoped.</p>
      </div>

      <Card>
        <CardHeader className="text-sm font-semibold text-slate-800">Engagements</CardHeader>
        <CardContent className="space-y-3">
          {client?.engagements.map((eng) => (
            <div key={eng.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {eng.period} · {eng.status}
                  </p>
                  <p className="text-xs text-slate-600">Modules run: {eng.summary.modulesRun} · Open findings: {eng.summary.findingsOpen}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={eng.risk === "High" ? "danger" : eng.risk === "Medium" ? "warning" : "default"}>{eng.risk} risk</Badge>
                  <Link href={`/app/clients/${client.id}/engagements/${eng.id}`} className="text-sm font-semibold text-slate-900 hover:underline">
                    Open
                  </Link>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>Progress</span>
                <span>{eng.progress}%</span>
              </div>
              <Progress value={eng.progress} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
