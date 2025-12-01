"use client";

import { useAuth } from "@/hooks/useAuth";

export interface FirmContextValue {
  firmId: string;
  firmName: string;
}

export function useFirmContext(): FirmContextValue {
  const { user } = useAuth();
  return {
    firmId: user?.firmId ?? "",
    firmName: "TaxOps Firm",
  };
}
