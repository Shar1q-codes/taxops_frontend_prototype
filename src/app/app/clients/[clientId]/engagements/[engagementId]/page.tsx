"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EngagementPage() {
  const router = useRouter();
  const params = useParams<{ clientId: string; engagementId: string }>();

  useEffect(() => {
    router.replace(`/app/clients/${params.clientId}/engagements/${params.engagementId}/overview`);
  }, [router, params.clientId, params.engagementId]);

  return null;
}
