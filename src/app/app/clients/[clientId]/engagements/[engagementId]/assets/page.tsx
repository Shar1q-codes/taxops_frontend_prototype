"use client";

import { AssetsModule } from "@/components/assets-module";

export default function AssetsPage({ params }: { params: { clientId: string; engagementId: string } }) {
  return <AssetsModule engagementId={params.engagementId} />;
}
