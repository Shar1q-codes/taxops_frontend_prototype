import { demoClients } from "@/lib/demoData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Shield, Users } from "lucide-react";

export default function DashboardPage() {
  const totalClients = demoClients.length;
  const activeEngagements = demoClients.reduce((acc, c) => acc + c.engagements.length, 0);
  const highSeverityFindings = 2;
  const upcomingReports = 3;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Firm dashboard</p>
        <h1 className="text-2xl font-semibold text-slate-900">Oversight and risk</h1>
        <p className="text-sm text-slate-600">Assist CPAs with automated testing; findings stay linked to workpapers and data snapshots.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total clients", value: totalClients, icon: <Users className="h-4 w-4" /> },
          { label: "Active engagements", value: activeEngagements, icon: <Shield className="h-4 w-4" /> },
          { label: "High-severity findings", value: highSeverityFindings, icon: <AlertTriangle className="h-4 w-4" /> },
          { label: "Upcoming report deadlines", value: upcomingReports, icon: <CheckCircle2 className="h-4 w-4" /> },
        ].map((metric) => (
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
        <CardContent className="divide-y divide-slate-200">
          {demoClients.map((client) =>
            client.engagements.map((eng) => (
              <div key={eng.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {client.name} · {eng.period}
                  </p>
                  <p className="text-xs text-slate-600">
                    Status: {eng.status} · Risk: {eng.risk}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-slate-600">
                    <p>Data readiness</p>
                    <p className="font-semibold text-slate-800">{eng.summary.dataReadiness}%</p>
                  </div>
                  <Progress value={eng.summary.dataReadiness} className="w-36" />
                  <Badge variant={eng.risk === "High" ? "danger" : eng.risk === "Medium" ? "warning" : "default"}>{eng.risk} risk</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
