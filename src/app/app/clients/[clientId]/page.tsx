import Link from "next/link";
import { notFound } from "next/navigation";
import { demoClients } from "@/lib/demoData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientDetailPage({ params }: { params: { clientId: string } }) {
  const client = demoClients.find((c) => c.id === params.clientId);
  if (!client) {
    notFound();
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
          <h1 className="text-2xl font-semibold text-slate-900">{client?.name}</h1>
          <p className="text-sm text-slate-600">
            Industry: {client?.industry} · Year-end {client?.yearEnd}
          </p>
        </div>
        <Badge variant={client?.risk === "High" ? "danger" : client?.risk === "Medium" ? "warning" : "default"}>{client?.risk} risk</Badge>
      </div>

      <Tabs defaultValue="engagements">
        <TabsList>
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="engagements" className="mt-4">
          <Card>
            <CardHeader className="text-sm font-semibold text-slate-800">Engagements</CardHeader>
            <CardContent className="space-y-3">
              {client?.engagements.map((eng) => (
                <div key={eng.id} className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {eng.period} · {eng.status}
                    </p>
                    <p className="text-xs text-slate-600">Progress {eng.progress}% · High severity findings {eng.summary.highSeverity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={eng.risk === "High" ? "danger" : eng.risk === "Medium" ? "warning" : "default"}>{eng.risk} risk</Badge>
                    <Link href={`/app/clients/${client.id}/engagements/${eng.id}`} className="text-sm font-semibold text-slate-900 hover:underline">
                      Open workspace
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardContent className="text-sm text-slate-700">Contact management placeholder. Pull from CRM/IdP and scope by client.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="text-sm text-slate-700">Notes and client communications placeholder.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
