"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { taxopsApi } from "@/lib/taxopsApi";
import { FirmInfo } from "@/types/taxops";

export interface FirmContextValue {
  firmId: string;
  firmName: string;
  firmLogoUrl?: string;
  loading: boolean;
  error: string | null;
}

export function useFirmContext(): FirmContextValue {
  const { user, token } = useAuth();
  const [firmInfo, setFirmInfo] = useState<FirmInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setFirmInfo(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await taxopsApi.getFirmInfo(token);
        setFirmInfo(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load firm info.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return {
    firmId: user?.firmId ?? "",
    firmName: firmInfo?.name ?? "TaxOps Firm",
    firmLogoUrl: firmInfo?.logoUrl,
    loading,
    error,
  };
}
