"use client";

export interface FirmContextValue {
  firmId: string;
  firmName: string;
}

// Placeholder until real firm loader; replace with server-fetched firm and inject via context.
export function useFirmContext(): FirmContextValue {
  return {
    firmId: "firm-demo",
    firmName: "TaxOps Demo Firm",
  };
}
