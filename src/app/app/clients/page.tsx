import Link from "next/link";
import { demoClients } from "@/lib/demoData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

export default function ClientsPage() {
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
          {demoClients.length} clients
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input placeholder="Search clients" />
        <div className="flex gap-2 text-xs text-slate-600">
          <Badge variant="default">All</Badge>
          <Badge variant="warning">Medium risk</Badge>
          <Badge variant="danger">High risk</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="text-sm font-semibold text-slate-800">Clients</CardHeader>
        <CardContent className="divide-y divide-slate-200">
          {demoClients.map((client) => (
            <Link key={client.id} href={`/app/clients/${client.id}`} className="block py-3 hover:bg-slate-50">
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
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
