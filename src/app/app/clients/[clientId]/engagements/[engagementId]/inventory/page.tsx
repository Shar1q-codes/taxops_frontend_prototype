"use client";

import { useParams } from "next/navigation";

import { EngagementTabs } from "@/components/engagement-tabs";
import { InventoryModule } from "@/components/inventory-module";

export default function EngagementInventoryPage() {
  const params = useParams<{ clientId: string; engagementId: string }>();

  return (
    <div className="space-y-4">
      <EngagementTabs clientId={params.clientId} engagementId={params.engagementId} active="inventory" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inventory</p>
        <h1 className="text-2xl font-semibold text-slate-900">Inventory findings</h1>
        <p className="text-sm text-slate-600">Upload item master and movements; review negative stock, write-offs, slow-moving items, and margin sanity.</p>
      </div>
      <InventoryModule engagementId={params.engagementId} />
    </div>
  );
}
