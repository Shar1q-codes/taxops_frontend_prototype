"use client";

import { ComplianceModule } from "@/components/compliance-module";

export default function CompliancePage({ params }: { params: { clientId: string; engagementId: string } }) {
  return <ComplianceModule engagementId={params.engagementId} />;
}
