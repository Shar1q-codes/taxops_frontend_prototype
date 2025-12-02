"use client";

import { EngagementOverviewModule } from "@/components/engagement-overview-module";
import { EngagementRiskCard } from "@/components/engagement-risk-card";

export default function EngagementOverviewPage({ params }: { params: { clientId: string; engagementId: string } }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <EngagementOverviewModule engagementId={params.engagementId} />
      </div>
      <div className="lg:col-span-1">
        <EngagementRiskCard engagementId={params.engagementId} />
      </div>
    </div>
  );
}
