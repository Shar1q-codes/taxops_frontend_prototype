"use client";

import { EngagementOverviewModule } from "@/components/engagement-overview-module";

export default function EngagementOverviewPage({ params }: { params: { clientId: string; engagementId: string } }) {
  return <EngagementOverviewModule engagementId={params.engagementId} />;
}
